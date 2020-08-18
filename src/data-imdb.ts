import { downloadGzipped, readData, readDataString, writeData } from "./data-io";
import * as levenshtein from 'fast-levenshtein';

interface ImdbName {
  nconst: string;
  primaryName: string;
  birthYear: string;
  deathYear: string;
  primaryProfession: string;
  knownForTitles: string;
}

interface ImdbMovie {
  tconst: string;
  titleType: string;
  primaryTitle: string;
  originalTitle: string;
  isAdult: string;
  startYear: string;
  endYear: string;
  runtimeMinutes: string;
  genres: string;
}

export async function searchIMDBTitle(title: string): Promise<ImdbMovie | undefined> {
  const tsv = await readIMDBSourceAsTSV("title.basics");
  const lines = tsv.split('\n');
  const header = lines[0].split('\t');
  const search = title.toLowerCase();
  
  const matches = lines
    .filter(line => line.toLowerCase().includes(search))
    .map(line => {
      const values = line.split('\t');
      const row = {};
      header.forEach((name, i) => {
        row[name] = values[i];
      });
      return row as ImdbMovie;
    })
    .filter(movie => movie.titleType === 'movie');
  if (matches.length === 0) {
    return undefined;
  }

  let bestMatch = matches[0];
  let bestMatchDistance = 999;
  for (const match of matches) {
    const matchDistance = levenshtein.get(match.primaryTitle, search, { useCollator: true });
    if (matchDistance === 0) {
      return match;
    } else if (matchDistance < bestMatchDistance) {
      bestMatch = match;
      bestMatchDistance = matchDistance;
    }
  }
  return bestMatch;
}

let imdbSourcesCache: Record<string, string> = {};

async function readIMDBSourceAsTSV(sourceFileName: string): Promise<string> {
  if (imdbSourcesCache[sourceFileName]) {
    return imdbSourcesCache[sourceFileName];
  }

  let tsv = readDataString(`input/imdb.${sourceFileName}.tsv`);
  if (!tsv) {
    await downloadGzipped(`https://datasets.imdbws.com/${sourceFileName}.tsv.gz`, 'input', `imdb.${sourceFileName}.tsv`);
    tsv = readDataString(`input/imdb.${sourceFileName}.tsv`);
  }
  imdbSourcesCache[sourceFileName] = tsv;

  return tsv;
}

/*
async function readIMDBSourceAsJson<T>(sourceFileName: string): Promise<T> {
  let json = await readData<T>(`input/imdb.${sourceFileName}.json`);

  if (json) {
    return json;
  } else {
    const tsv = await readIMDBSourceAsTSV(sourceFileName);
    console.log(`Converting imdb.${sourceFileName}.tsv to json...`);
    let jsonObject = tsvToJson(tsv) as any;
    console.log(`Serializing imdb.${sourceFileName}.json...`)
    await writeData(`input/imdb.${sourceFileName}.json`, jsonObject);
    return jsonObject;
  }
}


function tsvToJson(data: String) {
  const rows = [];
  const lines = data.split('\n');
  const columnNames = [];
  lines.forEach((line, lineIndex) => {
    const columns = line.trim().split('\t');
    if (columns.length <= 1) {
      return;
    }

    // First line = header
    if (columnNames.length === 0) {
      columns.forEach(columnName => columnNames.push(columnName));
      return;
    }

    const row = {};
    columnNames.forEach((name, i) => {
      row[name] = columns[i];
    });
    rows.push(row);

    if (lineIndex % 100000 === 0) {
      console.log(`Progress: ${Math.floor((1.*lineIndex/lines.length)*100)}%, used heap: ${Math.floor(process.memoryUsage().heapUsed/1000000)}MB`);
    }

  })
  return rows;
}
*/