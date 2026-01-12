// @ts-check

import pino from 'pino';

const transport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    colorizeObjects: true,
    levelFirst: true,
    ignore: 'pid, hostname, name',
    translateTime: 'HH:MM:ss.l',
  },
};

const pinoLogger = pino({
  level: 'debug',
  transport,
});

export class Logger {
  constructor(fields = {}, parentLogger = pinoLogger) {
    this._logger = parentLogger.child(fields);
  }

  /** @param { string | any } err */
  error(err, fields = {}) {
    this._syncLoggerLevel();

    if (typeof err === 'string') {
      return this._logger.child(fields).error(err);
    }

    const loggerFields = { stack: err.stack, ...err.extensions, ...err.error?.extensions, ...fields };
    this._logger.child(loggerFields).error(err.message);
  }

  /** @param { string | any } msg */
  warn(msg, fields = {}) {
    this._syncLoggerLevel();

    let loggerFields = { ...fields };

    if (typeof msg !== 'string') {
      loggerFields = { stack: msg.stack, ...msg.extensions, ...msg.error?.extensions, ...fields };
    }

    this._logger.child(loggerFields).warn(msg);
  }

  /** @param { string | any } msg */
  info(msg, fields = {}) {
    this._syncLoggerLevel();

    this._logger.child(fields).info(msg);
  }

  /** @param { string | any } msg */
  debug(msg, fields = {}) {
    this._syncLoggerLevel();

    this._logger.child(fields).debug(msg);
  }

  get level() {
    return pinoLogger.level;
  }

  set level(newLevel) {
    pinoLogger.level = newLevel;
  }

  createChild(fields = {}) {
    return new Logger(fields, this._logger);
  }

  // If we set the ops toggle to change the log level, that only applies
  // to the parent pino logger - any existing children loggers will retain the
  // log level set at the time the child was created. This function ensures
  // that the logger will be in sync with the base parent log level.
  _syncLoggerLevel() {
    if (this._logger.level === pinoLogger.level) return;

    this._logger.level = pinoLogger.level;
  }
}
