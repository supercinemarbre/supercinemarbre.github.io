"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDb = exports.readDb = exports.writeDecageRankings = exports.readDecageRankings = exports.readSCBUrls = void 0;
var data_io_1 = require("./data-io");
function readSCBUrls() {
    return data_io_1.readData("input/scb_urls.json");
}
exports.readSCBUrls = readSCBUrls;
function readDecageRankings(decade) {
    try {
        return data_io_1.readData("output/rankings_" + decade + ".json");
    }
    catch (e) {
        return undefined;
    }
}
exports.readDecageRankings = readDecageRankings;
function writeDecageRankings(decade, rankings) {
    data_io_1.writeData("output/rankings_" + decade + ".json", rankings);
}
exports.writeDecageRankings = writeDecageRankings;
function readDb() {
    try {
        return data_io_1.readData("output/db.json");
    }
    catch (e) {
        return undefined;
    }
}
exports.readDb = readDb;
function writeDb(movies) {
    data_io_1.writeData("output/db.json", movies);
}
exports.writeDb = writeDb;
