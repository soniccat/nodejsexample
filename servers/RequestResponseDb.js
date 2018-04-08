import {getUrlString} from "./requesttools";

var Client = require('mariasql');

var database_user   = process.env.DB_USER;
var database_pass   = process.env.DB_PASS;

var database = new Client({
    host: '127.0.0.1',
    user: database_user,
    password: database_pass,
    db: "db_requests"
});

class RequestResponseDb {

    writeRequestRow(requestInfo, responseInfo) {
        var tableName = "main";
        var session_id = 1;

        // SQL
        var query = `INSERT INTO ${tableName} VALUES(null,
        ${session_id}, 
        NOW(), 
        ${this.wrapString(getUrlString(requestInfo))},
        ${requestInfo.options.port},
        ${this.getHttpMethodCode(requestInfo.options.method)},
        ${(requestInfo.options.headers ? this.wrapString(JSON.stringify(requestInfo.options.headers)) : "NULL")},`;

        var body_string = "NULL";
        var body_string_is_json = 0;
        var body_data = "NULL";

        var isBodyString = requestInfo.body && this.isValidUTF8(requestInfo.body);
        if (requestInfo.body) {
            if (isBodyString){
                let bodyString = requestInfo.body.toString();

                body_string_is_json = this.isJsonString(bodyString);
                body_string = this.wrapString(bodyString);
            } else {
                // TODO: need to support blobs
                //body_data = requestInfo.body;
            }
        }

        // SQL
        query += `${body_string}, 
        ${body_string_is_json}, 
        ${body_data}, 
        ${responseInfo.statusCode}, 
        ${(responseInfo.header ? this.wrapString(JSON.stringify(responseInfo.header)) : "NULL")},`;

        var response_string = "NULL";
        var response_string_is_json = 0;
        var response_data = "NULL";

        var isResponseBodyString = responseInfo.body && this.isValidUTF8(responseInfo.body);
        if (responseInfo.body) {
            if (isResponseBodyString) {
                let responseString = responseInfo.body.toString();

                response_string_is_json = this.isJsonString(responseString);
                response_string = this.wrapString(responseString);
            } else {
                // TODO: need to support blobs
                //response_data = responseInfo.body;
            }
        }

        // SQL
        query += `${response_string}, 
        ${response_string_is_json}, 
        ${response_data}
        );`;


        console.log("start inserting ");
        database.query(query, function(err, rows) {
            if (err) {
                console.log("insert error " + err);
                console.log("query " + query);
                //throw err;
            } else {
                console.log("data inserted");
            }
        });

        database.end();
    }

    wrapString(value) {
        return "\"" + Client.escape(value) + "\"";
    }

    isValidUTF8(buf){
        return Buffer.compare(new Buffer(buf.toString(),'utf8') , buf) === 0;
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    getHttpMethodCode(name) {
        switch(name){
            case "GET": return 1;
            case "POST": return 2;
            default: return 0;
        }
    }
}

export default RequestResponseDb;