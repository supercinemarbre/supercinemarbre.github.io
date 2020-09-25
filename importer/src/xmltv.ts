import download from "download";
import libxmljs from "libxmljs";
import { readDataString, writeDataString } from "./io";
import { readMovieRankings } from "./scb";
import { Movie } from "./types";

export interface MovieBroadcast {
  movie: Movie;
  channel: string;
  date: string;
  csaRating: string;
}

export async function fetchUpcomingMovieBroadasts() {
  let xmltv = await readDataString("xmltv-tnt.xml");
  if (!xmltv) {
    xmltv = (await download("http://xmltv.ch/xmltv/xmltv-tnt.xml")).toString();
    await writeDataString("xmltv-tnt.xml", xmltv);
  }

  const tvDoc = libxmljs.parseXml(xmltv);

  const programmes = tvDoc.find("//programme")
    .filter(programme => programme.get("category")?.text().startsWith("film"));
  console.log(`${programmes.length} films in the schedule`);

  const movies = await readMovieRankings();
  console.log(`${movies.length} ranked films`);

  const movieTitles = movies.map(movie => [
    { movie, title: movie.title },
    { movie, title: movie.primaryTitle },
    { movie, title: movie.originalTitle }])
    .reduce((a, b) => [...a, ...b]);

  const foundProgrammes: Array<{ programme: libxmljs.Element; matchingMovie: Movie; }> = [];

  for (const programme of programmes) {
    const title = programme.get("title")?.text();
    let matchingMovie = movieTitles.find(m => title === m.title)?.movie;
    if (matchingMovie) {
      foundProgrammes.push({
        programme,
        matchingMovie
      });
    }
  }

  console.log(foundProgrammes.length + " matches found!");

  console.log(foundProgrammes.map(found => {
    return "* **" + found.programme.get("title")?.text() + "** *(" + found.matchingMovie.ranking + "e des années " + found.matchingMovie.decade + ")*: "
      + "le " + parseDate(found.programme.attr("start")?.value()) + " sur " + getChannel(tvDoc, found.programme.attr("channel").value())
  }).join('\n'))
}

function parseDate(date: string) {
  if (!date) {
    return "Date inconnue";
  }
  const y = date.slice(0, 4);
  const m = date.slice(4, 6);
  const d = date.slice(6, 8);
  const h = date.slice(8, 10);
  const mn = date.slice(10, 12);
  return `${d}/${m}/${y} à ${h}:${mn}`;
}

function getChannel(tvDoc: libxmljs.Document, channelId: string) {
  const channelEl = tvDoc.find(`/tv/channel[@id="${channelId}"]`)[0];
  return channelEl?.get("display-name").text();
}