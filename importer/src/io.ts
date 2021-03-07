import * as bigJson from "big-json";
import { createReadStream, createWriteStream, existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";

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

export function readData<T>(file: string, defaultValue?: T): Promise<T> {
  return new Promise((resolve) => {
    if (!existsSync(dataPath(file))) {
      resolve(defaultValue);
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
      }, 300); // XXX Prevent crashes with file being deleted
    });
  })
}

export function readApiKey(filename: string) {
  try {
    return readFileSync(dataPath(filename)).toString().trim();
  } catch (e) {
    return undefined;
  }
}

export function dataPath(file: string) {
  if (__filename.endsWith('.js')) {
    return resolve(__dirname, "../../data", file);
  } else {
    return resolve(__dirname, "../data", file);
  }
}
