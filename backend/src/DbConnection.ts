
import * as Client from 'mysql';

class DbConnection {
  database: Client.Connection;

  constructor(user: string, pass: string, name: string) {
    this.database = Client.createConnection({
      user,
      host: '127.0.0.1',
      password: pass,
      database: name,
    });
  }

  connect(callback?: (err: Client.MysqlError, ...args: any[]) => void) {
    this.database.connect(callback);
  }

  close(callback?: (err: Client.MysqlError, ...args: any[]) => void) {
    this.database.end(callback);
  }

  async queryPromise(query): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.query(query, (err: Client.MysqlError | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  query(query, callback?: (err: Client.MysqlError | null, ...args: any[]) => void) {
    this.database.query(query, (err, rows) => {
      if (err) {
        console.log(`DbConnection error: ${err}`);
        console.log(`DbConnection query: ${err.sql}`);
      }

      if (callback) {
        callback(err, rows);
      }
    });
  }

  wrapString(value: string) {
    return `${Client.escape(value, true)}`;
  }
}

export default DbConnection;
