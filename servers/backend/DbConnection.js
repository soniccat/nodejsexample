
var Client = require('mysql');

var database_user   = process.env.DB_USER;
var database_pass   = process.env.DB_PASS;

class DbConnection {
    constructor() {
        this.database = new Client.createConnection({
            host: '127.0.0.1',
            user: database_user,
            password: database_pass,
            database: "db_requests"
        })
    }

    connect(callback) {
        this.database.connect(callback);
    }

    close(callback) {
        this.database.end(callback);
    }

    query(query, callback) {
        this.database.query(query, (err, rows) => {
            callback(err, rows);
        });
    }
}

export default DbConnection