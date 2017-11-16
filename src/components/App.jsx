import React from 'react';
import RequestRow from 'Elements/RequestRow';

class App extends React.Component {
    render() {
        return (
            <div>
                <RequestRow />
                <RequestRow />
            </div>
        );
    }
}

export default App;