"use strict";
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
var data_imdb_1 = require("./src/data-imdb");
var data_io_1 = require("./src/data-io");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var tsv, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Reading TSV...");
                return [4 /*yield*/, data_imdb_1.readIMDBSourceAsTSV('title.basics')];
            case 1:
                tsv = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, data_io_1.runInDb('input/imdb.title.basics.db', function (db) { return __awaiter(void 0, void 0, void 0, function () {
                        var existingTitles, linesToInsert, insertStmt, i, _i, linesToInsert_1, line, values;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, run(db, 'PRAGMA page_size = 10000')];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, run(db, 'PRAGMA synchronous = OFF')];
                                case 2:
                                    _a.sent(); // Can corrupt the DB in case of a hardware crash
                                    return [4 /*yield*/, run(db, "\n    CREATE TABLE IF NOT EXISTS title_basics (\n      tconst TEXT PRIMARY KEY,\n      primaryTitle TEXT,\n      originalTitle TEXT,\n      startYear INTEGER,\n      runtimeMinutes TEXT,\n      genres TEXT\n    )\n    ")];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, all(db, 'SELECT count(*) as c FROM title_basics')];
                                case 4:
                                    existingTitles = _a.sent();
                                    console.log("Skipping " + existingTitles[0]['c'] + " lines already inserted...");
                                    linesToInsert = tsv.split('\n')
                                        .filter(function (line) { return line.includes('\tmovie\t'); })
                                        .slice(existingTitles[0]['c']);
                                    insertStmt = db.prepare("INSERT INTO title_basics(\n        tconst,\n        primaryTitle,\n        originalTitle,\n        startYear,\n        runtimeMinutes,\n        genres)\n      VALUES (\n        ?,\n        ?,\n        ?,\n        ?,\n        ?,\n        ?\n      )\n      ON CONFLICT(tconst) DO NOTHING;");
                                    i = 0;
                                    return [4 /*yield*/, run(db, 'BEGIN TRANSACTION;')];
                                case 5:
                                    _a.sent();
                                    _i = 0, linesToInsert_1 = linesToInsert;
                                    _a.label = 6;
                                case 6:
                                    if (!(_i < linesToInsert_1.length)) return [3 /*break*/, 11];
                                    line = linesToInsert_1[_i];
                                    values = line.split('\t').map(function (value) { return value.replace('\\N', ''); });
                                    // header: "tconst	titleType	primaryTitle	originalTitle	isAdult	startYear	endYear	runtimeMinutes	genres"
                                    if (i++ % 10000 === 0) {
                                        console.log("Insert progress: " + i + "/" + linesToInsert.length + " (" + Math.floor(100. * i / linesToInsert.length) + "%)...");
                                    }
                                    if (!(i % 1000 === 0)) return [3 /*break*/, 8];
                                    return [4 /*yield*/, run(db, 'END TRANSACTION; BEGIN TRANSACTION;')];
                                case 7:
                                    _a.sent();
                                    _a.label = 8;
                                case 8: return [4 /*yield*/, runStmt(insertStmt, [values[0], values[2], values[3], values[5], values[7], values[8]])];
                                case 9:
                                    _a.sent();
                                    _a.label = 10;
                                case 10:
                                    _i++;
                                    return [3 /*break*/, 6];
                                case 11: return [4 /*yield*/, finalizeStmt(insertStmt)];
                                case 12:
                                    _a.sent();
                                    return [4 /*yield*/, run(db, 'END TRANSACTION;')];
                                case 13:
                                    _a.sent();
                                    console.log("Inserts complete");
                                    return [4 /*yield*/, run(db, "CREATE INDEX IF NOT EXISTS primaryTitle ON title_basics (primaryTitle)")];
                                case 14:
                                    _a.sent();
                                    console.log("Index created");
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.error("ERROR: ", e_1, e_1.stack);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); })();
function runStmt(stmt, params) {
    if (params === void 0) { params = []; }
    return new Promise(function (resolve, reject) {
        stmt.run(params, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
function finalizeStmt(stmt) {
    return new Promise(function (resolve, reject) {
        stmt.finalize(function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
function run(db, sql, params) {
    if (params === void 0) { params = []; }
    return new Promise(function (resolve, reject) {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
function all(db, sql) {
    return new Promise(function (resolve, reject) {
        db.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}
