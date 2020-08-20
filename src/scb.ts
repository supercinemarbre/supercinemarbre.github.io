import * as cheerio from "cheerio";
import download from "download";
import * as data from "./data";
import * as imdb from "./imdb";

export async function importMovieRankings() {
  const scbPages = await data.readSCBUrls();
  const scbRankings = await data.readScbRankings() || [];

  for (const decade of Object.keys(scbPages)) {
    console.log(`Downloading rankings for decade ${decade}...`);
    const scbPage = await download(scbPages[decade]);
    const $ = cheerio.load(scbPage);
    const rankings = parseRankings($, decade);
    console.log(` - ${rankings.length} movies found`);

    const sizeBefore = scbRankings.length;
    mergeRankings(scbRankings, rankings);
    console.log(` - ${scbRankings.length - sizeBefore} movies added to list`);
  }

  await data.writeScbRankings(scbRankings);
}

export async function matchMoviesWithIMDB() {
  const scbRankings = await data.readScbRankings() || [];

  let i = 0;
  for (const ranking of scbRankings) {
    if (!ranking.tconst) {
      console.log(`Matching ${ranking.decade}s movie ${ranking.title}`);

      const results = await imdb.searchIMDBTitle(ranking.title);
      const matchingResult = chooseMatchingResult(ranking, results);
      if (!matchingResult) {
        console.log(` - No match found among ${results.length} results`);
      } else {
        console.log(` - OK!`)
        Object.assign(ranking, matchingResult.movie);
        if (i % 10 === 0) {
          await data.writeScbRankings(scbRankings);
        }
      }
      i++;
    }

  }

  await data.writeScbRankings(scbRankings);

}

function chooseMatchingResult(ranking: data.Ranking, results: Array<{ movie: imdb.ImdbMovie; distance: number; }>) {
  const expectedDecade = parseInt(ranking.decade, 10);
  for (const result of results) {
    if (!result.movie.startYear || Math.abs(expectedDecade - parseInt(ranking.decade, 10)) <= 10) {
      return result;
    }
  }
}

function mergeRankings(existingRankings: data.Ranking[], newRankings: data.Ranking[]) {
  for (const newRanking of newRankings) {
    if (!existingRankings.find(r => r.rawTitle === newRanking.rawTitle)) {
      existingRankings.push(newRanking);
    }
  }
}

function parseRankings($: CheerioStatic, decade: string): data.Ranking[] {
  const rankings: data.Ranking[] = [];

  const rows = $("table tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows.get(i) as CheerioElement;
    const cells = $("td", row);
    if (cells.length > 0) {
      const episode = parseInt($(cells.get(2)).text().trim(), 10);
      const title = $(cells.get(1)).text().trim();
      const ranking = parseInt($(cells.get(0)).text().trim(), 10);
      if (ranking && title) {
        rankings.push({
          decade,
          episode,
          title,
          rawTitle: title,
          ranking
        });
      }
    }
  }

  return rankings;
}
