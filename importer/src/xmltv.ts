import download from "download";
import libxmljs from "libxmljs";
import { isEqual } from "lodash";
import { readDataString, writeDataString } from "./io";
import { readMovieRankings } from "./scb";
import { Movie, XmltvSchedule } from "./types";

export const REFRESH_DELAY_IN_MILLIS = 24 * 3600 * 1000 /* 1 day */;

export async function fetchXmltvSchedule(): Promise<XmltvSchedule> {
  const tvDoc = await loadXmltvDocument();
  const schedule = createEmptySchedule(tvDoc);
  const movies = await readMovieRankings();
  fillSchedule(schedule, tvDoc, movies);
  return schedule;
}

async function loadXmltvDocument(): Promise<libxmljs.Document> {
  const existingXmltvData = await readDataString("xmltv-tnt.xml");

  if (existingXmltvData) {
    try {
      const tvDoc = libxmljs.parseXml(existingXmltvData);
      const schedule = createEmptySchedule(tvDoc);
      const isOutdated = new Date(schedule.fromDate).getTime() < Date.now() - REFRESH_DELAY_IN_MILLIS;
      if (!isOutdated) {
        return tvDoc;
      }
    } catch (e) {
      console.error("Failed to parse cached schedule", e);
    }
  }

  console.log("Downloading new XMLTB schedule")
  const newXmltvData = await download("http://xmltv.ch/xmltv/xmltv-tnt.xml");
  await writeDataString("xmltv-tnt.xml", newXmltvData);
  return libxmljs.parseXml(newXmltvData.toString());
}

function fillSchedule(schedule: XmltvSchedule, tvDoc: libxmljs.Document, movies: Movie[]) {
  const programmes = tvDoc.find("//programme")
    .filter(programme => programme.get("category")?.text().startsWith("film"));

  console.log(`Looking for matches between ${programmes.length} scheduled film broadcasts and ${movies.length} ranked films`);

  const movieTitles = movies.map(movie => [
    { movie, title: movie.title },
    { movie, title: movie.primaryTitle },
    { movie, title: movie.originalTitle }])
    .reduce((a, b) => [...a, ...b]);

  for (const programme of programmes) {
    const title = programme.get("title")?.text();
    let newMatch = movieTitles.find(m => title === m.title)?.movie;
    if (newMatch) {
      if (!schedule.matches.find(match => isEqual(match.movie, newMatch.id))) {
        schedule.matches.push({
          movie: newMatch.id,
          csaRating: programme.get("rating/value")?.text(),
          broadcasts: []
        })
      }
      const match = schedule.matches.find(match => isEqual(match.movie, newMatch.id));
      const date = parseDate(programme.attr("start")?.value())?.toISOString();
      const channel = getChannelName(tvDoc, programme.attr("channel").value());
      if (date && channel) {
        match.broadcasts.push({
          channel,
          date
        });
      } else {
        console.warn("No date or channel found for programme:\n" + programme.toString());
      }
    }
  }

}

const startTimes = tvDoc.find("//programme")
  function createEmptySchedule(tvDoc: libxmljs.Document): XmltvSchedule {
    .map(programme => parseDate(programme.attr("start")?.value()));
  const fromDate = startTimes.reduce((a, b) => a < b ? a : b).toISOString();
  const toDate = startTimes.reduce((a, b) => a > b ? a : b).toISOString();
  return {
    fromDate,
    toDate,
    matches: []
  }
}

function parseDate(date: string): Date | undefined {
  if (date) {
    const y = parseInt(date.slice(0, 4), 10);
    const m = parseInt(date.slice(4, 6), 10) - 1;
    const d = parseInt(date.slice(6, 8), 10);
    const h = parseInt(date.slice(8, 10), 10);
    const mn = parseInt(date.slice(10, 12), 10);
    return new Date(y, m, d, h, mn);
  }
}

function getChannelName(tvDoc: libxmljs.Document, channelId: string) {
  const channelEl = tvDoc.find(`/tv/channel[@id="${channelId}"]`)[0];
  return channelEl?.get("display-name").text();
}
