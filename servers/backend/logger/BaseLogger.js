
class BaseLogger {
    constructor(f) {
        this.handler = f;
    }

    log(str) {
        this.handler(str);
    }
}

export default BaseLogger;