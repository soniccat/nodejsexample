import {readPostBody} from "./requesttools";
import RequestTable from "./RequestTable"
import url from 'url'
import util from "util";

// spec:
//
// requests (POST)- fetch requests from db
// params:
//  fields      - required fields in a string array
//  urlRegexp   - regexp for url to filter
//  onlyNotNull - show only when every field is not null
// response:
//  list of db objects with the requested fields
//
// request  (POST)- create request
// params:
//  json representation of an object

class ApiHandler {
    constructor(dbConnection, apiPath, logger) {
        this.dbConnection = dbConnection;
        this.apiPath = apiPath;
        this.logger = logger;
        this.requestTable = new RequestTable(this.dbConnection);
    }

    handleRequest(req, res) {
        const reqUrl = url.parse(req.url);
        const path = reqUrl.path.substr(this.apiPath.length + 2); // +2 for double '/' at the beginning and end
        const components = path.split('/');

        // allow Cross-Origin Resource Sharing preflight request
        this.logger.log("url: " + req.url + " method: " + req.method);
        if (req.method === "OPTIONS") {
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
        if (components.length > 0 && components[0] === "requests") {
            this.handleRequests(body, res, () => {
                callback();
            });
        } else if (components.length > 0 && components[0] === "request") {
            this.handleCreateRequest(body, res, () => {
                callback();
            });

        } else {
            this.fillNotFoundResponse(res);
            callback();
        }
    }

    //
    handleCreateRequest(body, res, callback) {
        let obj = JSON.parse(body.toString());
        this.requestTable.writeRequestRow(obj, (err) => {
            if (!err) {
                this.requestTable.getLastInsertedIndex((err, rows) => {
                    let code = undefined;
                    let body = undefined;

                    if (!err && rows.length && rows[0]["LAST_INSERT_ID()"]) {
                        let insertedId = rows[0]["LAST_INSERT_ID()"];
                        body = JSON.stringify(Object.assign({id: insertedId}, obj));
                        code = 200;

                    } else {
                        code = 500;
                    }

                    this.setResponseHeader(res, code, body);
                    callback()
                });

            } else {
                this.setResponseHeader(res, 500);
            }
        })
    }

    handleRequests(body, res, callback) {
        let options = JSON.parse(body.toString());
        this.loadRequests(options, (err, rows) => {
            let code = err ? 500 : 200;
            let body = err ? undefined : JSON.stringify(rows);

            this.setResponseHeader(res, code, body);
            callback()
        })
    }

    setResponseHeader(res, code, body) {
        res.writeHead(code, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        });

        if (body) {
            res.write(body);
        }
    }

    fillNotFoundResponse(res) {
        res.writeHead(404);
    }

    loadRequests(options, callback) {
        let fields = "*";
        if (options.fields) {
            fields = options.fields.join(',');
        }

        let wherePart = "";
        let urlRegexp = "";
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

        let query = "select " + fields + " from main";
        if (wherePart.length) {
            query += " where " + wherePart;
        }

        query += " order by date DESC";

        // TODO: move query building in RequestTable
        this.logger.log("query " + query);
        this.requestTable.queryRequests(query, callback);
    }
}

export default ApiHandler;