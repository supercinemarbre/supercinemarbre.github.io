import * as cheerio from "cheerio";
import download from "download";
import * as imdb from "./src/data-imdb";
import * as data from "./src/data-internal";

(async () => {
  //await parseSCBPages();
  console.log(await imdb.searchIMDBTitle("The Terminator")); // TEST
  console.log(await imdb.searchIMDBTitle("Matrix Revolutions")); // TEST
})();

async function parseSCBPages() {
  const scbPages = await data.readSCBUrls();
  for (const decade of Object.keys(scbPages)) {
    if (!await data.readDecageRankings(decade)) {
      console.log(`Downloading rankings for decade ${decade}...`);
      const scbPage = await download(scbPages[decade]);
      const $ = cheerio.load(scbPage);
      const rankings = parseRanking($);
      console.log(`${rankings.length} movies found`);
      await data.writeDecageRankings(decade, rankings);
    } else {
      console.log(`Rankings already downloaded for decade ${decade}...`);
    }
  }

}

function parseRanking($: CheerioStatic) {
  const rankings: data.Ranking[] = [];

  const rows = $("table tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows.get(i) as CheerioElement;
    const cells = $("td", row);
    if (cells.length > 0) {
      const ranking = parseInt($(cells.get(0)).text().trim(), 10);
      const title = $(cells.get(1)).text().trim();
      const episode = parseInt($(cells.get(2)).text().trim(), 10);
      if (ranking && title) {
        rankings.push({
          ranking,
          title,
          episode
        });
      }
    }
  }

  return rankings;
}
