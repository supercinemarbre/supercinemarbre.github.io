import { GoogleSpreadsheet } from 'google-spreadsheet';
import { readApiKey, writeDataString } from './io';
import { markAsUpdated, needsUpdate } from './last-updated';

const GOOGLE_SHEETS_API_KEY = readApiKey("googlesheetsapikey");
const TIMESTAMPS_SHEET_ID = "1_h4Yh9xU72iqH3gZI6OquYG-jfBYPP4d1k-T9jwxEq8";

export async function refreshTimestampFiles() {
  if (!process.env.GSHEETS_FORCE && !await needsUpdate('gsheets')) {
    console.log('Skipping Google Sheets as recently updated (use GSHEETS_FORCE=true to override)');
    return;
  }

  if (!GOOGLE_SHEETS_API_KEY) {
    console.log(`
    Cannot synchronize with Google Sheets, an API key must first be set in the importer data/ directory, in a file called "googlesheetsapikey".
    You can get a free key at https://console.developers.google.com/apis (Google Account required).
    Or, you can open the spreadsheet by hand at https://docs.google.com/spreadsheets/d/${TIMESTAMPS_SHEET_ID}/edit
    and copy/paste the timestamps by hand in data/timestampsXXXX.csv.`);
    return;
  } else {
    console.log("Refreshing timestamps from Google Sheets");
  }

  const doc = new GoogleSpreadsheet(TIMESTAMPS_SHEET_ID);
  doc.useApiKey(GOOGLE_SHEETS_API_KEY);
  await doc.loadInfo();

  for (const sheetIndex in doc.sheetsByIndex) {
    const sheet = doc.sheetsByIndex[sheetIndex];
    if (sheet.title === 'Episodes Spéciaux') {
      continue; // Unsupported for now
    }

    const decade = getDecade(sheet.title);
    console.log(`  ${decade}...`);

    const timestampCsvRows = [];
    let rowIndex = 0;
    await sheet.loadCells("A1:E1000");
    while (sheet.getCell(rowIndex, 0).value !== null) {
      const timestampCsvRow = [0, 1, 2, 3]
        .map(columnIndex => sheet.getCell(rowIndex, columnIndex).formattedValue)
        .map(value => typeof value === "number" ? value : `"${value}"`)
        .join(',');
      timestampCsvRows.push(timestampCsvRow);
      rowIndex++;
    }

    await writeDataString(`timestamps${decade}.csv`, timestampCsvRows.join("\n"));
  }

  await markAsUpdated('gsheets');
}

function getDecade(sheetTitle: string) {
  const rawDecade = sheetTitle.split(' ')[1];
  if (!rawDecade.startsWith("20")) {
    return "19" + rawDecade;
  } else {
    return rawDecade;
  }
}
