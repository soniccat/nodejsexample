import React from 'react';
import RequestRow from 'Elements/RequestRow';
import RequestStorage from 'Utils/RequestStorage'
let Client = require('mariasql');

class App extends React.Component {
    constructor(props) {
        super(props);

        let context = this.getStorageContext();
        this.requestStorage = new RequestStorage(context);
    }

    getStorageContext() {
        let database_user   = process.env.DB_USER;
        let database_pass   = process.env.DB_PASS;

        let client = new Client({
            host: '127.0.0.1',
            user: database_user,
            password: database_pass,
            db: "db_requests"
        });

        return {
            client: client
        }
    }

    componentDidMount() {
        this.loadUrls()
    }

    loadUrls() {
        this.requestStorage.loadRequests(function (err, rows) {
            console.log("requests are loaded");
        })
    }

    render() {
        return (
            <div>
                <RequestRow url={"url1"}/>
                <RequestRow url={"url2"}/>
            </div>
        );
    }
}

export default App;