import BaseLogger from "./BaseLogger";

class ConsoleLogger extends BaseLogger{
    constructor() {
        super(str => {
            console.log(str);
        });
    }
}

export default ConsoleLogger;