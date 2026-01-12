// @ts-check

import { Logger } from '../utils/logger.js';
import { createWriteStream } from 'node:fs';

const dict = /** @type { { [key: string]: { [word: string]: { types: string[] } } } } */ (
  (await import('../../data/dict.json', { with: { type: 'json' } })).default
);

const logger = new Logger();

(() => {
  try {
    /** @type { { [key: string]: string[] } } */
    const sizeMap = {};

    for (const section of Object.values(dict)) {
      for (const word of Object.keys(section)) {
        (sizeMap[word.length] ??= []).push(word);
      }
    }

    const stream = createWriteStream('./indexes/data/sizes.json', { flags: 'w', encoding: 'utf-8' });

    stream.on('error', function (e) {
      logger.error(e);
      process.exit(1);
    });

    stream.write('{\n');
    let counter = 0;
    const sizeMapLength = Object.keys(sizeMap).length;

    for (const entry in sizeMap) {
      if (!Object.hasOwn(sizeMap, entry)) continue;

      const element = sizeMap[entry];

      counter++;

      if (counter === sizeMapLength) {
        stream.write(`"${entry}":${JSON.stringify(element)}\n`);
      } else {
        stream.write(`"${entry}":${JSON.stringify(element)},\n`);
      }
    }
    stream.write('}');
    stream.end();

    stream.on('finish', () => {
      logger.info('Done.');
      process.exit(0);
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
