// @ts-check

import { Logger } from './src/utils/logger.js';
import LineByLine from 'n-readlines';
import { writeFileSync } from 'node:fs';
const charMap = /** @type { { [key: string]: string } } */ (
  (await import('./src/utils/charmap.json', { with: { type: 'json' } })).default
);

/** @typedef { { pos: string, word: string, forms?: { form: string, tags: string[]}[], [key: string]: any } } Record */
/** @typedef { { [key: string]: { [word: string]: { types: string[] } } } } Dictionary */
/** @typedef { { [key: string] : Map<string, { types: Set<string> }> } } MapHolder */

const logger = new Logger();
let lineNumber = 1;
let line = '';

const sample = true;

const input = sample ? './data/sample.jsonl' : './data/data.jsonl';
const output = sample ? './data/dict-sample.json' : './data/dict.json';

/** @type { MapHolder } */
const mapHolder = {};

const buildMapHolder = () => {
  for (const firstLetter of '_ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')) {
    for (const secondLetter of '_ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')) {
      for (const thirdLetter of '_ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')) {
        Object.assign(mapHolder, { [firstLetter + secondLetter + thirdLetter]: new Map() });
      }
    }
  }
};

/** Turns a map into a normal object
 * @param { MapHolder } mapHolder
 * @returns { Dictionary }
 */
const buildFinalDictionary = (mapHolder) => {
  /** @type { Dictionary } */
  const dict = {};
  for (const mapKey in mapHolder) {
    // e.g. mapKey = 'DIC'
    if (!Object.hasOwn(mapHolder, mapKey)) continue;

    const range = mapHolder[mapKey];
    // e.g. { dictionary: ['noun', 'verb'], dictaphone: ['noun'] }

    if (range.size > 0) {
      /** @type { { [word: string]: { types: string[] } } } */
      const entries = {};
      for (const keyAndTypes of range) {
        const entryKey = keyAndTypes[0];
        // e.g. dictionary

        entries[entryKey] = { types: [] };

        for (const type of keyAndTypes[1].types) {
          entries[entryKey].types.push(type);
        }
      }
      dict[mapKey] = entries;
    }
  }

  return dict;
};

/**
 * @param { Record } record
 */
const addRecordToMapHolder = (record) => {
  const uWord = record.word.toUpperCase();
  const uWordPrefix = uWord.substring(0, 3);
  let prefix = '';
  for (const char of uWordPrefix.split('')) {
    const mappedChar = charMap[char];
    if (mappedChar) {
      prefix += mappedChar;
    } else {
      prefix += char;
    }
  }

  const key = prefix
    .replace(/[^A-Z]/g, '_')
    .substring(0, 3)
    .padEnd(3, '_');

  const map = mapHolder[key].get(record.word);

  if (map) {
    for (const recordPos of record.pos.split(' ')) {
      map.types.add(recordPos);
    }
  } else {
    mapHolder[key].set(record.word, { types: new Set(record.pos.split(' ')) });
  }
};

/**
 * @param { string } line
 * @returns { Record | undefined }
 */
const buildRecordFromJson = (line) => {
  // If the line didn't include a comma between objects, we have to put the opening and closing braces back in
  if (line.substring(0, 1) !== '{') {
    line = '{"' + line;
  } else if (line.substring(line.length - 1, line.length) !== '}') {
    line = line + '}';
  }

  /** @type { Record } */
  const record = JSON.parse(line);

  // Remove any properties we're not interested in
  for (const key in record) {
    if (!Object.hasOwn(record, key)) continue;

    if (['pos', 'word', 'forms'].includes(key)) continue;

    delete record[key];
  }

  // Early exits if the word is not a normal dictionary word
  if (!record.word.match(/[a-z]/) && record.word.length > 1) return;
  if (record.word.match(/[ 0-9!@£#$%^&*()_=+\[\]{};:"\\|,<.>/?`~]/)) return;
  if (record.word.match(/^-/)) return;
  if (record.word.match(/-$/)) return;
  if (record.word.match(/.*-.*-.*/)) return;
  if (record.word.match(/[\u0250-\uFFFF]/)) return;

  // If the word has a plural or alternative form, add that first
  if (record.forms) {
    for (const form of record.forms) {
      if (form.tags.includes('plural')) {
        /** @type { Record } */
        const plural = { word: form.form, pos: 'plural ' + record.pos };

        addRecordToMapHolder(plural);
      }
      if (form.tags.includes('alternative')) {
        /** @type { Record } */
        const alternative = { word: form.form, pos: 'alternative ' + record.pos };

        addRecordToMapHolder(alternative);
      }
    }

    delete record.forms;
  }

  return record;
};

(() => {
  try {
    buildMapHolder();

    const liner = new LineByLine(input);

    let jsonl;
    while ((jsonl = liner.next())) {
      lineNumber++;

      const lines = jsonl.toString().split('}{"'); // Data is a bit rough and doesn't always split on the new line where it should

      for (line of lines) {
        const record = buildRecordFromJson(line);

        if (!record) continue;

        addRecordToMapHolder(record);
      }
    }

    /** @type { Dictionary } */
    const dict = buildFinalDictionary(mapHolder);

    const newLine = `
`;

    writeFileSync(output, JSON.stringify(dict).replace(/"\]\}(\}?),/g, '"]}$1,' + newLine));

    logger.info('Done');
    process.exit(0);
  } catch (e) {
    logger.error(e);
    console.log(line);
    process.exit(1);
  }
})();
