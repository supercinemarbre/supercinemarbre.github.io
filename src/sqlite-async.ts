import { Database, Statement } from "sqlite3";

export function runStmt(stmt: Statement, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    stmt.run(params, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  });
}


export function finalizeStmt(stmt: Statement): Promise<any[]> {
  return new Promise((resolve, reject) => {
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  });
}

export function run(db: Database, sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  });
}

export function all(db: Database, sql: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    })
  });
} 