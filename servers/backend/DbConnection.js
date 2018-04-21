
import Client from 'mysql';

class DbConnection {
  constructor(user, pass, name) {
    this.database = new Client.createConnection({
      host: '127.0.0.1',
      user,
      password: pass,
      database: name,
    });
  }

  connect(callback) {
    this.database.connect(callback);
  }

  close(callback) {
    this.database.end(callback);
  }

  query(query, callback) {
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

  wrapString(value) {
    return `${Client.escape(value, true)}`;
  }
}

export default DbConnection;
