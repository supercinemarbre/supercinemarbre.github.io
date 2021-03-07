import { readData, writeData } from './io';

interface LastUpdated {
  [source: string]: string
}

const LAST_UPDATED_PATH = 'last_updated.json';
const ONE_DAY = 24 * 3600 * 1000;

export async function needsUpdate(source: string) {
  const lastUpdatedMap = await readData<LastUpdated>(LAST_UPDATED_PATH, {});
  if (source in lastUpdatedMap) {
    const lastUpdated = Date.parse(lastUpdatedMap[source]);
    return Date.now() > lastUpdated + ONE_DAY;
  }
  return true;
}

export async function markAsUpdated(source: string) {
  const lastUpdatedMap = await readData<LastUpdated>(LAST_UPDATED_PATH, {});
  lastUpdatedMap[source] = new Date().toISOString();
  await writeData(LAST_UPDATED_PATH, lastUpdatedMap);
}
