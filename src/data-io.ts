import * as bigJson from "big-json";
import { createReadStream, createWriteStream, existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import download from "download";
import { ungzip } from "node-gzip";

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
    
    parseStream.on('data', function(pojo) {
      resolve(pojo);
    });
    
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
  const gzFileFullname = resolve(dataPath(folder), filename + ".gz");

  if (!existsSync(gzFileFullname)) {
    console.log(`Downloading ${filename}...`);
    await download(url, dataPath(folder), { filename: gzFilename });
    console.log("Download OK");
  }

  console.log(`Ungzipping ${filename}...`);
  const decompressed = await ungzip(readFileSync(gzFileFullname), {});
  const fileFullname = resolve(dataPath(folder), filename);
  writeData(dataPath(fileFullname), decompressed);
  console.log("Ungzipping OK");
}


function dataPath(file: string) {
  if (__filename.endsWith('.js')) {
    return resolve(__dirname, "../../data", file);
  } else {
    return resolve(__dirname, "../data", file);
  }
}
