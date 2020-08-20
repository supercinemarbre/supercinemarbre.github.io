import * as bigJson from "big-json";
import download from "download";
import { createReadStream, createWriteStream, existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import sqlite3 from 'sqlite3';
import { pipeline } from "stream";
import { promisify } from "util";
import { createGunzip } from "zlib";

export function readDataString(file: string) {
  try {
    return readFileSync(dataPath(file)).toString();
  } catch (e) {
    return undefined;
  }
}

export function writeDataString(file: string, data: string | Buffer) {
  writeFileSync(dataPath(file), data);
}

export function readData<T>(file: string): Promise<T> {
  return new Promise((resolve) => {
    if (!existsSync(dataPath(file))) {
      resolve(undefined);
      return;
    }
    
    const readStream = createReadStream(dataPath(file));
    const parseStream = bigJson.createParseStream();
    
    parseStream.on('data', resolve);
    
    readStream.pipe(parseStream);
  })
}

export function writeData(file: string, object: any): Promise<void> {
  const filePath = dataPath(file);
  return new Promise((resolve) => {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    const stringifyStream = bigJson.createStringifyStream({ body: object }, resolve);
    const fileStream = createWriteStream(filePath, {flags: 'a'});
    stringifyStream.pipe(fileStream);
  })
}

export async function downloadGzipped(url: string, folder: string, filename: string) {
  const gzFilename = filename + ".gz";
  if (!existsSync(resolve(dataPath(folder), gzFilename))) {
    console.log(`Downloading ${filename}...`);
    await download(url, dataPath(folder), { filename: gzFilename });
    console.log("Download OK");
  }

  console.log(`Ungzipping ${filename}...`);
  await ungzip(resolve(dataPath(folder), gzFilename), resolve(dataPath(folder), filename));
  console.log("Ungzipping OK");
}

async function ungzip(fromFile: string, toFile: string) {
  const readStream = createReadStream(dataPath(fromFile));
  const writeStream = createWriteStream(dataPath(toFile));
  await promisify(pipeline)(readStream, createGunzip(), writeStream);
}


export async function runInDb<T>(file: string, callback: (db: sqlite3.Database) => Promise<T>) {
  let db = new sqlite3.Database(dataPath(file));

  process.on('SIGINT', function() {
    if (db) {
      console.log("Closing DB connection to exit.");
      db.close();
      db = null;
      process.exit(0);
    } 
  });

  try {
    return callback(db);
  } finally {
    db.close();
  }
}


function dataPath(file: string) {
  if (__filename.endsWith('.js')) {
    return resolve(__dirname, "../../data", file);
  } else {
    return resolve(__dirname, "../data", file);
  }
}
