// @ts-check

import { Logger } from '../utils/logger.js';
import { writeStream } from '../utils/streamer.js';
import { popular } from '../utils/popular-words.js';

const dict = /** @type { { [key: string]: { [word: string]: { types: string[] } } } } */ (
  (await import('../../data/dict.json', { with: { type: 'json' } })).default
);

const logger = new Logger();

let popularDone = false;
let normalDone = false;

(() => {
  try {
    /** @type { { [key: string]: string[] } } */
    const startLetterMap = {};
    /** @type { { [key: string]: string[] } } */
    const popularStartLetterMap = {};

    for (const section of Object.values(dict)) {
      for (const word of Object.keys(section)) {
        const firstLetter = word[0].replace('"', '\\"').toLowerCase();
        (startLetterMap[firstLetter] ??= []).push(word);
        if (popular.has(word)) {
          (popularStartLetterMap[firstLetter] ??= []).push(word);
        }
      }
    }

    const stream = writeStream(startLetterMap, 'start-letters.json', logger);
    const popularStream = writeStream(popularStartLetterMap, 'popular-start-letters.json', logger);

    popularStream.on('finish', () => {
      logger.info('Popular Done.');
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
      process.exit(0);
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
