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
    const startLetterMap = {};

    for (const section of Object.values(dict)) {
      for (const word of Object.keys(section)) {
        const firstLetter = word[0].replace('"', '\\"').toLowerCase();
        (startLetterMap[firstLetter] ??= []).push(word);
      }
    }

    const stream = createWriteStream('./indexes/data/startLetters.json', { flags: 'w', encoding: 'utf-8' });

    stream.on('error', (e) => {
      logger.error(e);
      process.exit(1);
    });

    stream.write('{\n');
    let counter = 0;
    const startLetterMapLength = Object.keys(startLetterMap).length;

    for (const entry in startLetterMap) {
      if (!Object.hasOwn(startLetterMap, entry)) continue;

      const element = startLetterMap[entry];

      counter++;

      if (counter === startLetterMapLength) {
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