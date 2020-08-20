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
  if (scbRankings.length < 1000) throw new Error('wtf'); // XXX

  const patch = await data.readScbRankingsPatch();

  let i = 0;
  for (const ranking of scbRankings) {
    if (!ranking.tconst) {
      let results;
      if (patch[ranking.scbTitle]) {
        results = [{movie: await imdb.getIMDBTitleById(patch[ranking.scbTitle]), distance: 0}];
      } else {
        results = await imdb.searchIMDBTitle(ranking.scbTitle);
      }

      const matchingResult = chooseMatchingResult(ranking, results);
      if (!matchingResult) {
        console.log(`${i}/${scbRankings.length}: No match found for ${ranking.scbTitle} among ${results.length} results`);
        if (!patch[ranking.scbTitle]) {
          patch[ranking.scbTitle] = null;
        }
        data.writeScbRankingsPatch(patch);
      } else {
        console.log(`${i}/${scbRankings.length}: OK for ${ranking.scbTitle}`)
        Object.assign(ranking, matchingResult.movie);
        await data.writeScbRankings(scbRankings);
      }
    }
    i++;
  }
}

function chooseMatchingResult(ranking: data.Ranking, results: Array<{ movie: imdb.ImdbMovie; distance: number; }>) {
  const expectedDecade = parseInt(ranking.decade, 10);
  for (const result of results) {
    if (!result.movie.startYear || Math.abs(expectedDecade - result.movie.startYear) <= 10) {
      return result;
    }
  }
}

function mergeRankings(existingRankings: data.Ranking[], newRankings: data.Ranking[]) {
  for (const newRanking of newRankings) {
    if (!existingRankings.find(r => r.scbTitle === newRanking.scbTitle)) {
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
      const scbTitle = $(cells.get(1)).text().trim();
      const ranking = parseInt($(cells.get(0)).text().trim(), 10);
      if (ranking && scbTitle) {
        rankings.push({
          decade,
          episode,
          scbTitle,
          ranking
        });
      }
    }
  }

  return rankings;
}
