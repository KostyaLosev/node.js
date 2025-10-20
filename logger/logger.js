class Logger {
  format(type, message = '') {
    const timestamp = new Date().toISOString();
    return `[${type.toUpperCase()}][${timestamp}] ${message}`;
  }
}

module.exports = Logger;
