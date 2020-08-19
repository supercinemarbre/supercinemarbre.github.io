"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchIMDBTitle = void 0;
var levenshtein = __importStar(require("fast-levenshtein"));
var data_io_1 = require("./data-io");
var sqlite_async_1 = require("./sqlite-async");
function searchIMDBTitle(title) {
    return __awaiter(this, void 0, void 0, function () {
        var dbPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Searching: " + title);
                    return [4 /*yield*/, initializeIMDBTitleBasicsDb()];
                case 1:
                    dbPath = _a.sent();
                    return [2 /*return*/, data_io_1.runInDb(dbPath, function (db) {
                            return new Promise(function (resolve, reject) {
                                db.all('select * from title_basics where primaryTitle LIKE ?', '%' + title + '%', function (err, rows) {
                                    if (err)
                                        reject(err);
                                    var movies = rows
                                        .map(function (movie) {
                                        return { movie: movie, distance: levenshtein.get(movie.primaryTitle, title, { useCollator: true }) };
                                    })
                                        .sort(function (a, b) { return a.distance - b.distance; });
                                    resolve(movies);
                                });
                            });
                        })];
            }
        });
    });
}
exports.searchIMDBTitle = searchIMDBTitle;
function initializeIMDBTitleBasicsDb() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, initializeIMDBSourceDb({
                    sourceName: 'title.basics',
                    tableColumns: "tconst TEXT PRIMARY KEY,\n      primaryTitle TEXT,\n      originalTitle TEXT,\n      startYear INTEGER,\n      runtimeMinutes TEXT,\n      genres TEXT",
                    lineFilter: function (line) { return line.includes('\tmovie\t'); },
                    insertQuery: "INSERT INTO title_basics(\n      tconst,\n      primaryTitle,\n      originalTitle,\n      startYear,\n      runtimeMinutes,\n      genres)\n    VALUES (?, ?, ?, ?, ?, ?)\n    ON CONFLICT(tconst) DO NOTHING;",
                    // header: "tconst	titleType	primaryTitle	originalTitle	isAdult	startYear	endYear	runtimeMinutes	genres"
                    insertParamsProvider: function (values) { return [values[0], values[2], values[3], values[5], values[7], values[8]]; },
                    indexesQuery: 'CREATE INDEX IF NOT EXISTS primaryTitle ON title_basics (primaryTitle)'
                })];
        });
    });
}
var imdbInitializedSources = {};
function initializeIMDBSourceDb(_a) {
    var sourceName = _a.sourceName, tableColumns = _a.tableColumns, lineFilter = _a.lineFilter, insertQuery = _a.insertQuery, insertParamsProvider = _a.insertParamsProvider, indexesQuery = _a.indexesQuery;
    return __awaiter(this, void 0, void 0, function () {
        var dbFilePath, tsv, tableName, e_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dbFilePath = "input/imdb." + sourceName + ".db";
                    if (!imdbInitializedSources[sourceName]) {
                        imdbInitializedSources[sourceName] = true;
                    }
                    else {
                        return [2 /*return*/, dbFilePath];
                    }
                    console.log("INITIALIZING IMDB SOURCE: " + sourceName);
                    console.log("Reading TSV...");
                    return [4 /*yield*/, readIMDBSourceAsTSV(sourceName)];
                case 1:
                    tsv = _b.sent();
                    tableName = sourceName.replace(/\./g, '_');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, data_io_1.runInDb(dbFilePath, function (db) { return __awaiter(_this, void 0, void 0, function () {
                            var existingTitles, linesToInsert, insertStmt, i, _i, linesToInsert_1, line, values;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, sqlite_async_1.run(db, 'PRAGMA page_size = 10000')];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, sqlite_async_1.run(db, 'PRAGMA synchronous = OFF')];
                                    case 2:
                                        _a.sent(); // Can corrupt the DB in case of a hardware crash
                                        return [4 /*yield*/, sqlite_async_1.run(db, "\n        CREATE TABLE IF NOT EXISTS " + tableName + " (" + tableColumns + ")\n    ")];
                                    case 3:
                                        _a.sent();
                                        return [4 /*yield*/, sqlite_async_1.all(db, "SELECT count(*) as c FROM " + tableName)];
                                    case 4:
                                        existingTitles = _a.sent();
                                        console.log("Skipping " + existingTitles[0]['c'] + " lines already inserted...");
                                        linesToInsert = tsv.split('\n')
                                            .filter(lineFilter)
                                            .slice(existingTitles[0]['c']);
                                        insertStmt = db.prepare(insertQuery);
                                        i = 0;
                                        return [4 /*yield*/, sqlite_async_1.run(db, 'BEGIN TRANSACTION;')];
                                    case 5:
                                        _a.sent();
                                        _i = 0, linesToInsert_1 = linesToInsert;
                                        _a.label = 6;
                                    case 6:
                                        if (!(_i < linesToInsert_1.length)) return [3 /*break*/, 11];
                                        line = linesToInsert_1[_i];
                                        values = line.split('\t').map(function (value) { return value.replace('\\N', ''); });
                                        if (i++ % 10000 === 0) {
                                            console.log("Insert progress: " + i + "/" + linesToInsert.length + " (" + Math.floor(100. * i / linesToInsert.length) + "%)...");
                                        }
                                        if (!(i % 1000 === 0)) return [3 /*break*/, 8];
                                        return [4 /*yield*/, sqlite_async_1.run(db, 'END TRANSACTION; BEGIN TRANSACTION;')];
                                    case 7:
                                        _a.sent();
                                        _a.label = 8;
                                    case 8: return [4 /*yield*/, sqlite_async_1.runStmt(insertStmt, insertParamsProvider(values))];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10:
                                        _i++;
                                        return [3 /*break*/, 6];
                                    case 11: return [4 /*yield*/, sqlite_async_1.finalizeStmt(insertStmt)];
                                    case 12:
                                        _a.sent();
                                        return [4 /*yield*/, sqlite_async_1.run(db, 'END TRANSACTION;')];
                                    case 13:
                                        _a.sent();
                                        console.log("Inserts complete");
                                        return [4 /*yield*/, sqlite_async_1.run(db, indexesQuery)];
                                    case 14:
                                        _a.sent();
                                        console.log("Indexes created");
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _b.sent();
                    return [2 /*return*/, dbFilePath];
                case 4:
                    e_1 = _b.sent();
                    console.error("ERROR: ", e_1, e_1.stack);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function readIMDBSourceAsTSV(sourceFileName) {
    return __awaiter(this, void 0, void 0, function () {
        var tsv;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tsv = data_io_1.readDataString("input/imdb." + sourceFileName + ".tsv");
                    if (!!tsv) return [3 /*break*/, 2];
                    return [4 /*yield*/, data_io_1.downloadGzipped("https://datasets.imdbws.com/" + sourceFileName + ".tsv.gz", 'input', "imdb." + sourceFileName + ".tsv")];
                case 1:
                    _a.sent();
                    tsv = data_io_1.readDataString("input/imdb." + sourceFileName + ".tsv");
                    _a.label = 2;
                case 2: return [2 /*return*/, tsv];
            }
        });
    });
}
