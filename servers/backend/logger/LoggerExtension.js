
class LoggerExtension {
    constructor(logger) {
        this.innerLogger = logger;
    }

    log(str) {
        this.innerLogger.log(str)
    }
}

export default LoggerExtension