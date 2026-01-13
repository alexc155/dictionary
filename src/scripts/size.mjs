// @ts-check

import { Logger } from '../utils/logger.js';
import { popular } from '../utils/popular-words.js';
import { writeStream } from '../utils/streamer.js';

const dict = /** @type { { [key: string]: { [word: string]: { types: string[] } } } } */ (
  (await import('../../data/dict.json', { with: { type: 'json' } })).default
);

const logger = new Logger();

let popularDone = false;
let normalDone = false;

(() => {
  try {
    /** @type { { [key: string]: string[] } } */
    const sizeMap = {};
    /** @type { { [key: string]: string[] } } */
    const popularSizeMap = {};

    for (const section of Object.values(dict)) {
      for (const word of Object.keys(section)) {
        (sizeMap[word.length] ??= []).push(word);
        // if (popular.includes(word)) {
          if (popular.has(word)) {
            (popularSizeMap[word.length] ??= []).push(word);
          }
        // }
      }
    }

    const stream = writeStream(sizeMap, 'sizes.json', logger);
    const popularStream = writeStream(popularSizeMap, 'popular-sizes.json', logger);

    popularStream.on('finish', () => {
      logger.info('Popular done.');
      popularDone = true;
      if (normalDone) {
        logger.info('All Done.');
        process.exit(0);
      }
    });

    stream.on('finish', () => {
      logger.info('Normal Done.');
      normalDone = true;
      if (popularDone) {
        logger.info('All Done.');
        process.exit(0);
      }
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
