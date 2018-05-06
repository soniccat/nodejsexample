
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

  connect(callback: (err: Client.MysqlError, ...args: any[]) => void) {
    this.database.connect(callback);
  }

  close(callback: (err: Client.MysqlError, ...args: any[]) => void) {
    this.database.end(callback);
  }

  query(query, callback: (err: Client.MysqlError | null, ...args: any[]) => void) {
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
