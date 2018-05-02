import BaseLogger from './BaseLogger';

class EmptyLogger extends BaseLogger {
  constructor() {
    super((str) => {
    });
  }
}

export default EmptyLogger;
