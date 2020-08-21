import download from 'download';
import { downloadGzipped, readDataString, runInDb } from "./io";
import * as scb from "./scb";
import { all, finalizeStmt, run, runStmt } from './sqlite-utils';
import { Movie } from './types';

export interface ImdbPerson {
  nconst: string;
  primaryName: string;
  birthYear: string;
  deathYear: string;
  primaryProfession: string;
  knownForTitles: string;
}

export interface ImdbMovie {
  tconst: string;
  titleType: string;
  primaryTitle: string;
  originalTitle: string;
  startYear: number;
  runtimeMinutes: number;
  genres: string;
}

export async function synchronizeWithIMDB(sublist?: Movie[]) {
  console.log("Synchronizing rankings with IMDB");
  const rankings = sublist ?? await scb.readMovieRankings();
  const patch = await scb.readMoviesPatch();

  let i = 0;
  for (const ranking of rankings) {
    if (!ranking.tconst) {
      let results: ImdbMovie[];
      const hasPatch = Boolean(patch[ranking.scbTitle]);
      if (hasPatch) {
        const patchValue = patch[ranking.scbTitle];
        const tconst = (typeof patchValue === 'string') ? patchValue : patchValue.tconst;
        const movie = await getIMDBTitleById(tconst);
        if (!movie) {
          throw new Error("Unknown IMDB ID " + tconst);
        }
        results = [movie];
      } else {
        results = await getIMDBSuggestions(ranking.scbTitle);
      }

      const matchingResult = chooseMatchingResult(ranking, results, { acceptResultFromWrongDecade: hasPatch });
      if (!matchingResult) {
        console.log(` - ${i}/${rankings.length}: No match found for ${ranking.scbTitle} among ${results.length} results`);
        if (!patch[ranking.scbTitle]) {
          patch[ranking.scbTitle] = null;
        }
        if (!sublist) {
          await scb.writeMoviesPatch(patch);
        }
      } else {
        console.log(` - ${i}/${rankings.length}: OK for ${ranking.scbTitle}`)
        Object.assign(ranking, matchingResult);
        const patchValue = patch[ranking.scbTitle];
        if (typeof patchValue !== 'string') {
          Object.assign(ranking, patchValue);
        }
        if (!sublist) {
          await scb.writeMovieRankings(rankings);
        }
      }
    }
    i++;
  }
}

function chooseMatchingResult(ranking: Movie, results: ImdbMovie[],
  options: { acceptResultFromWrongDecade?: boolean } = {}) {
const expectedDecade = parseInt(ranking.decade, 10);
for (const result of results) {
  if (result.startYear && Math.abs(expectedDecade - result.startYear) <= 10) {
    return result;
  }
}
if (options.acceptResultFromWrongDecade && results.length > 0) {
  return results[0];
} else {
  const resultsWithoutDate = results.filter(result => !result.startYear);
  if (resultsWithoutDate.length > 0) {
    return resultsWithoutDate[0];
  }
}
}

async function getIMDBSuggestions(title: string): Promise<ImdbMovie[] | undefined> {
  try {
    const searchString = title.trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20);
    const imdbUrl = `https://v2.sg.media-imdb.com/suggestion/${searchString[0]}/${searchString}.json`;
    const resultString = await download(imdbUrl);
    const result = JSON.parse(resultString.toString()) as {
      d: Array<{
        i: {
          imageUrl: string;
        },
        id: string;
      }>
    };
    if (result.d) {
      const movies = [];
      for (const suggestion of result.d.slice(0, 5)) {
        const found = await getIMDBTitleById(suggestion.id);
        if (found) {
          movies.push(found);
        }
      }
      return movies;
    }
  } catch (e) {
    console.warn(`Failed to search ${title} on IMDB suggestions endpoint`);
  }
}

async function getIMDBTitleById(tconst: string): Promise<ImdbMovie | undefined> {
  const dbPath = await initializeIMDBTitleBasicsDb();

  return runInDb(dbPath, (db) => {
    return new Promise((resolve, reject) => {
      db.all('select * from title_basics where tconst = ?', tconst, (err, rows) => {
        if (err) reject(err);
        if (rows.length > 0) {
          resolve(rows[0]);
        } else {
          resolve(undefined);
        }
      })
    })
  })
}

async function initializeIMDBTitleBasicsDb() {
  return initializeIMDBSourceDb({
    sourceName: 'title.basics',
    tableColumns: `tconst TEXT PRIMARY KEY,
      primaryTitle TEXT,
      originalTitle TEXT,
      startYear INTEGER,
      runtimeMinutes TEXT,
      genres TEXT`,
    lineFilter: line => line.includes('\tmovie\t')
      || line.includes('\ttvMovie\t') /* eg. SW Holiday Special */
      || line.includes('\tvideo\t') /* eg. Fucking Kassovitz */,
    insertQuery: `INSERT INTO title_basics(
      tconst,
      primaryTitle,
      originalTitle,
      startYear,
      runtimeMinutes,
      genres)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(tconst) DO NOTHING;`,
    // header: "tconst	titleType	primaryTitle	originalTitle	isAdult	startYear	endYear	runtimeMinutes	genres"
    insertParamsProvider: (values) => [values[0], values[2], values[3], values[5], values[7], values[8]],
    indexesQuery: 'CREATE INDEX IF NOT EXISTS primaryTitle ON title_basics (primaryTitle)'
  });

}

let imdbInitializedSources: Record<string, boolean> = {};

async function initializeIMDBSourceDb({
  sourceName,
  tableColumns,
  lineFilter,
  insertQuery,
  insertParamsProvider,
  indexesQuery
}: {
  sourceName: string,
  tableColumns: string,
  lineFilter: (line: string) => boolean,
  insertQuery: string,
  insertParamsProvider: (values: any[]) => any[],
  indexesQuery: string
}) {
  const dbFilePath = `imdb.${sourceName}.db`;
  if (process.env.IMDB_INIT && !imdbInitializedSources[sourceName]) {
    imdbInitializedSources[sourceName] = true;
  } else {
    return dbFilePath;
  }

  console.log(`Initializing IMDB source ${sourceName}`);
  console.log(" - Reading TSV...");
  const tsv = await readIMDBSourceAsTSV(sourceName);
  const tableName = sourceName.replace(/\./g, '_');

  try {
    console.log(" - Extracting data to database...");
    await runInDb(dbFilePath, async (db) => {
      await run(db, 'PRAGMA page_size = 10000;');
      await run(db, 'PRAGMA synchronous = OFF;'); // Can corrupt the DB in case of a hardware crash

      await run(db, `CREATE TABLE IF NOT EXISTS ${tableName} (${tableColumns})`);

      const existingTitles = await all(db, `SELECT count(*) as c FROM ${tableName}`);
      console.log(` - Skipping ${existingTitles[0]['c']} lines already inserted...`);

      const linesToInsert = tsv.split('\n')
        .filter(lineFilter)
        .slice(existingTitles[0]['c']);

      const insertStmt = db.prepare(insertQuery);

      let i = 0;
      await run(db, 'BEGIN TRANSACTION');
      for (const line of linesToInsert) {
        const values = line.split('\t').map(value => value.replace('\\N', ''));

        if (i++ % 10000 === 0) {
          console.log(` - Progress: ${i}/${linesToInsert.length} (${Math.floor(100. * i / linesToInsert.length)}%)...`);
        }
        if (i % 1000 === 0) {
          await run(db, 'END TRANSACTION');
          await run(db, 'BEGIN TRANSACTION');
        }

        await runStmt(insertStmt, insertParamsProvider(values));
      }
      await finalizeStmt(insertStmt);
      await run(db, 'END TRANSACTION')
      console.log(" - Inserts complete");

      await run(db, indexesQuery);
      console.log(" - Indexes created");
    });

    return dbFilePath;
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
}

async function readIMDBSourceAsTSV(sourceFileName: string): Promise<string> {
  let tsv = readDataString(`imdb.${sourceFileName}.tsv`);
  if (!tsv) {
    await downloadGzipped(`https://datasets.imdbws.com/${sourceFileName}.tsv.gz`, `imdb.${sourceFileName}.tsv`);
    tsv = readDataString(`imdb.${sourceFileName}.tsv`);
  }
  return tsv;
}
