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
exports.downloadGzipped = exports.writeData = exports.readData = exports.writeDataString = exports.readDataString = void 0;
var bigJson = __importStar(require("big-json"));
var fs_1 = require("fs");
var path_1 = require("path");
var download_1 = __importDefault(require("download"));
var node_gzip_1 = require("node-gzip");
function readDataString(file) {
    try {
        return fs_1.readFileSync(dataPath(file)).toString();
    }
    catch (e) {
        return undefined;
    }
}
exports.readDataString = readDataString;
function writeDataString(file, data) {
    fs_1.writeFileSync(dataPath(file), data);
}
exports.writeDataString = writeDataString;
function readData(file) {
    return new Promise(function (resolve) {
        if (!fs_1.existsSync(dataPath(file))) {
            resolve(undefined);
            return;
        }
        var readStream = fs_1.createReadStream(dataPath(file));
        var parseStream = bigJson.createParseStream();
        parseStream.on('data', function (pojo) {
            resolve(pojo);
        });
        readStream.pipe(parseStream);
    });
}
exports.readData = readData;
function writeData(file, object) {
    var filePath = dataPath(file);
    return new Promise(function (resolve) {
        if (fs_1.existsSync(filePath)) {
            fs_1.unlinkSync(filePath);
        }
        var stringifyStream = bigJson.createStringifyStream({ body: object }, resolve);
        var fileStream = fs_1.createWriteStream(filePath, { flags: 'a' });
        stringifyStream.pipe(fileStream);
    });
}
exports.writeData = writeData;
function downloadGzipped(url, folder, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var gzFilename, gzFileFullname, decompressed, fileFullname;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gzFilename = filename + ".gz";
                    gzFileFullname = path_1.resolve(dataPath(folder), filename + ".gz");
                    if (!!fs_1.existsSync(gzFileFullname)) return [3 /*break*/, 2];
                    console.log("Downloading " + filename + "...");
                    return [4 /*yield*/, download_1.default(url, dataPath(folder), { filename: gzFilename })];
                case 1:
                    _a.sent();
                    console.log("Download OK");
                    _a.label = 2;
                case 2:
                    console.log("Ungzipping " + filename + "...");
                    return [4 /*yield*/, node_gzip_1.ungzip(fs_1.readFileSync(gzFileFullname), {})];
                case 3:
                    decompressed = _a.sent();
                    fileFullname = path_1.resolve(dataPath(folder), filename);
                    writeData(dataPath(fileFullname), decompressed);
                    console.log("Ungzipping OK");
                    return [2 /*return*/];
            }
        });
    });
}
exports.downloadGzipped = downloadGzipped;
function dataPath(file) {
    if (__filename.endsWith('.js')) {
        return path_1.resolve(__dirname, "../../data", file);
    }
    else {
        return path_1.resolve(__dirname, "../data", file);
    }
}
