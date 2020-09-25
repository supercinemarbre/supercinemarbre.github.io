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

  const titles = tvDoc.find("//programme")
    .filter(programme => programme.get("category")?.text().startsWith("film"))
    .map(programme => programme.get("title")?.text());
  console.log(`${titles.length} films in the schedule`);

  const movies = await readMovieRankings();
  console.log(`${movies.length} ranked films`);

  const movieTitles = movies.map(m => [
      {id: m.id, title: m.title},
      {id: m.id, title: m.primaryTitle},
      {id: m.id, title: m.originalTitle}])
      .reduce((a, b) => [...a, ...b]);
  
  const foundIds = [];
  const matches = movieTitles.filter(m => titles.includes(m.title))
    .filter(m => {
      if (!foundIds.includes(JSON.stringify(m.id))) {
        foundIds.push(JSON.stringify(m.id));
        return true;
      }
      return false;
    })
    .map(m => m.id);

  console.log(matches);
}