import util from 'util';
import LoggerExtension from './LoggerExtension';
import { getUrlString } from '../requesttools';

class RequestLoggerExtension extends LoggerExtension {
  logRequest(sendRequestInfo, responseInfo) {
    this.innerLogger.log(`load ${getUrlString(sendRequestInfo)}`);

    /* full
        logger.log("for " + getUrlString(sendRequestInfo));
        logger.log("send  " + util.inspect(sendRequestInfo));
        logger.log("response  " + util.inspect(responseInfo));
         */
  }
}

export default RequestLoggerExtension;
