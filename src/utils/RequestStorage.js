
class RequestStorage {
    constructor(context) {
        // expect to have:
        // context.client is Client object
        if (context.client == undefined) {
            throw "context.client is undefined";
        }

        this.context = context;
    }

    loadRequests(callback) {
        const query = "select url from main";

        database.query(query, function(err, rows) {
            console.dir(rows);
            callback(err, rows);
        });

        context.client.end();
    }
}

export default RequestStorage;