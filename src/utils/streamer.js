// @ts-check

import { createWriteStream, WriteStream } from 'node:fs';

/**
 * @param { { [key: string]: string[] } } map
 * @param { string } fileName
 * @param { import('./logger.js').Logger } logger
 * @returns { WriteStream }
 */
export const writeStream = (map, fileName, logger) => {
  const stream = createWriteStream(`./indexes/data/${fileName}`, { flags: 'w', encoding: 'utf-8' });

  stream.on('error', (e) => {
    logger.error(e);
    process.exit(1);
  });

  stream.write('{\n');
  let counter = 0;
  const mapLength = Object.keys(map).length;

  for (const entry in map) {
    if (!Object.hasOwn(map, entry)) continue;

    const element = map[entry];

    counter++;

    if (counter === mapLength) {
      stream.write(`"${entry}":${JSON.stringify(element)}\n`);
    } else {
      stream.write(`"${entry}":${JSON.stringify(element)},\n`);
    }
  }
  stream.write('}');
  stream.end();
  return stream;
};
