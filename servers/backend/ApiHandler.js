import {readPostBody} from "./requesttools";
import url from 'url'

class ApiHandler {
    constructor(dbConnection, apiPath) {
        this.dbConnection = dbConnection;
        this.apiPath = apiPath;
    }

    handleRequest(req, res) {
        const reqUrl = url.parse(req.url);
        const path = reqUrl.path.substr(this.apiPath.length + 2); // +2 for double '/' at the beginning and end
        const components = path.split('/');

        // allow Cross-Origin Resource Sharing preflight request
        if (req.method == "OPTIONS") {
            res.writeHeader(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type"
            });
            res.end();

        } else {
            readPostBody(req, body => {
                this.handleComponents(components, body, res, () => {
                    res.end();
                });
            });
        }
    }

    handleComponents(components, body, res, callback) {
        if (components.length > 0 && components[0] == "requests") {
            this.handleRequests(body, res, () => {
                callback();
            });

        } else {
            this.fillNotFoundResponse(res);
            callback();
        }
    }

    handleRequests(body, res, callback) {
        let options = JSON.parse(body.toString());
        this.loadRequests(options, (err, rows) => {
            console.dir(body);
            console.dir(rows);

            var code;
            var body;
            if (err == undefined ) {
                code = 200;
                body = JSON.stringify(rows);

            } else {
                code = 500;
            }

            res.writeHead(code, {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            });
            if (body) {
                res.write(body);
            }

            callback()
        })
    }

    fillNotFoundResponse(res) {
        res.writeHead(404);
    }

    loadRequests(options, callback) {
        var fields = "*";
        if (options.fields) {
            fields = options.fields.join(',');
        }

        var wherePart = "";
        var urlRegexp = "";
        if (options.urlRegexp) {
            urlRegexp = options.urlRegexp;
            wherePart += "url REGEXP " + "\"" + urlRegexp + "\"";
        }

        if (options.onlyNotNull && options.fields) {
            for (i = 0; i < options.fields.length; i++) {
                if (wherePart.length > 0) {
                    wherePart += " AND "
                }
                wherePart += options.fields[i] +" IS NOT NULL ";
            }
        }

        var query = "select " + fields + " from main";
        if (wherePart.length) {
            query += " where " + wherePart;
        }

        console.log("query " + query);

        this.dbConnection.query(query, callback);
    }
}

export default ApiHandler;