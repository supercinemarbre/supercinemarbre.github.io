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

export function writeDataString(file: string, data: string | Buffer): void {
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
  return new Promise((resolve) => {
    const filePath = dataPath(file);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    const stringifyStream = bigJson.createStringifyStream({ body: object });
    const fileStream = createWriteStream(filePath, {flags: 'a'});
    stringifyStream.pipe(fileStream);
    stringifyStream.on('end', function() {
      setTimeout(() => {
        resolve(undefined);
      }, 100); // XXX Prevent crashes with file being deleted
    });
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
  const readStream = createReadStream(resolve(dataPath(folder), gzFilename));
  const writeStream = createWriteStream(resolve(dataPath(folder), filename));
  await promisify(pipeline)(readStream, createGunzip(), writeStream);
  console.log("Ungzipping OK");
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
