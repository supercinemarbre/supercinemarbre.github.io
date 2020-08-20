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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchMoviesWithIMDB = exports.importMovieRankings = void 0;
var cheerio = __importStar(require("cheerio"));
var download_1 = __importDefault(require("download"));
var data = __importStar(require("./data"));
var imdb = __importStar(require("./imdb"));
function importMovieRankings() {
    return __awaiter(this, void 0, void 0, function () {
        var scbPages, scbRankings, _i, _a, decade, scbPage, $, rankings, sizeBefore;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, data.readSCBUrls()];
                case 1:
                    scbPages = _b.sent();
                    return [4 /*yield*/, data.readScbRankings()];
                case 2:
                    scbRankings = (_b.sent()) || [];
                    _i = 0, _a = Object.keys(scbPages);
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    decade = _a[_i];
                    console.log("Downloading rankings for decade " + decade + "...");
                    return [4 /*yield*/, download_1.default(scbPages[decade])];
                case 4:
                    scbPage = _b.sent();
                    $ = cheerio.load(scbPage);
                    rankings = parseRankings($, decade);
                    console.log(" - " + rankings.length + " movies found");
                    sizeBefore = scbRankings.length;
                    mergeRankings(scbRankings, rankings);
                    console.log(" - " + (scbRankings.length - sizeBefore) + " movies added to list");
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, data.writeScbRankings(scbRankings)];
                case 7:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.importMovieRankings = importMovieRankings;
function matchMoviesWithIMDB() {
    return __awaiter(this, void 0, void 0, function () {
        var scbRankings, patch, i, _i, scbRankings_1, ranking, results, matchingResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, data.readScbRankings()];
                case 1:
                    scbRankings = (_a.sent()) || [];
                    if (scbRankings.length < 1000)
                        throw new Error('wtf'); // XXX
                    return [4 /*yield*/, data.readScbRankingsPatch()];
                case 2:
                    patch = _a.sent();
                    i = 0;
                    _i = 0, scbRankings_1 = scbRankings;
                    _a.label = 3;
                case 3:
                    if (!(_i < scbRankings_1.length)) return [3 /*break*/, 13];
                    ranking = scbRankings_1[_i];
                    if (!!ranking.tconst) return [3 /*break*/, 11];
                    results = void 0;
                    if (!patch[ranking.scbTitle]) return [3 /*break*/, 5];
                    return [4 /*yield*/, imdb.getIMDBTitleById(patch[ranking.scbTitle])];
                case 4:
                    results = _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, imdb.searchIMDBTitle(ranking.scbTitle)];
                case 6:
                    results = _a.sent();
                    _a.label = 7;
                case 7:
                    matchingResult = chooseMatchingResult(ranking, results);
                    if (!!matchingResult) return [3 /*break*/, 8];
                    console.log(i + "/" + scbRankings.length + ": No match found for " + ranking.scbTitle + " among " + results.length + " results");
                    patch[ranking.scbTitle] = null;
                    return [3 /*break*/, 11];
                case 8:
                    console.log(i + "/" + scbRankings.length + ": OK for " + ranking.scbTitle);
                    Object.assign(ranking, matchingResult.movie);
                    if (!(i % 10 === 0)) return [3 /*break*/, 11];
                    return [4 /*yield*/, data.writeScbRankings(scbRankings)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, data.writeScbRankingsPatch(patch)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    i++;
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 3];
                case 13: return [4 /*yield*/, data.writeScbRankings(scbRankings)];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, data.writeScbRankingsPatch(patch)];
                case 15:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.matchMoviesWithIMDB = matchMoviesWithIMDB;
function chooseMatchingResult(ranking, results) {
    var expectedDecade = parseInt(ranking.decade, 10);
    for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
        var result = results_1[_i];
        if (!result.movie.startYear || Math.abs(expectedDecade - parseInt(ranking.decade, 10)) <= 10) {
            return result;
        }
    }
}
function mergeRankings(existingRankings, newRankings) {
    var _loop_1 = function (newRanking) {
        if (!existingRankings.find(function (r) { return r.scbTitle === newRanking.scbTitle; })) {
            existingRankings.push(newRanking);
        }
    };
    for (var _i = 0, newRankings_1 = newRankings; _i < newRankings_1.length; _i++) {
        var newRanking = newRankings_1[_i];
        _loop_1(newRanking);
    }
}
function parseRankings($, decade) {
    var rankings = [];
    var rows = $("table tr");
    for (var i = 0; i < rows.length; i++) {
        var row = rows.get(i);
        var cells = $("td", row);
        if (cells.length > 0) {
            var episode = parseInt($(cells.get(2)).text().trim(), 10);
            var scbTitle = $(cells.get(1)).text().trim();
            var ranking = parseInt($(cells.get(0)).text().trim(), 10);
            if (ranking && scbTitle) {
                rankings.push({
                    decade: decade,
                    episode: episode,
                    scbTitle: scbTitle,
                    ranking: ranking
                });
            }
        }
    }
    return rankings;
}
