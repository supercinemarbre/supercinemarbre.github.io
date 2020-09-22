import { GoogleSpreadsheet } from 'google-spreadsheet';
import { readApiKey, writeDataString } from './io';

const GOOGLE_SHEETS_API_KEY = readApiKey("googlesheetsapikey");
const TIMESTAMPS_SHEET_ID = "1_h4Yh9xU72iqH3gZI6OquYG-jfBYPP4d1k-T9jwxEq8";

export async function refreshTimestampFiles() {
  if (!GOOGLE_SHEETS_API_KEY) {
    console.log(`
    Cannot synchronize with Google Sheets, an API key must first be set in the importer data/ directory, in a file called "googlesheetsapikey".
    You can get a free key at https://console.developers.google.com/apis (Google Account required).
    Or, you can open the spreadsheet by hand at https://docs.google.com/spreadsheets/d/${TIMESTAMPS_SHEET_ID}/edit
    and copy/paste the timestamps by hand in data/timestampsXXXX.csv.`);
    return;
  } else {
    console.log("Refreshing timestamps from Google Sheets")
  }

  const doc = new GoogleSpreadsheet(TIMESTAMPS_SHEET_ID);
  doc.useApiKey(GOOGLE_SHEETS_API_KEY);
  await doc.loadInfo();

  for (const sheetTitle in doc.sheetsByTitle) {
    const sheet = doc.sheetsByTitle[sheetTitle];
    const decade = getDecade(sheetTitle);
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
}

function getDecade(sheetTitle: string) {
  const rawDecade = sheetTitle.split(' ')[1];
  if (!rawDecade.startsWith("20")) {
    return "19" + rawDecade;
  } else {
    return rawDecade;
  }
}