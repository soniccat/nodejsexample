import React from 'react';
import RequestViewer from "Components/RequestViewer"

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <RequestViewer />
            </div>
        );
    }
}

export default App;