"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = exports.run = exports.finalizeStmt = exports.runStmt = void 0;
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
exports.runStmt = runStmt;
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
exports.finalizeStmt = finalizeStmt;
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
exports.run = run;
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
exports.all = all;
