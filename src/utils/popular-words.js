// @ts-check

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type { Set<string> } */
export const popular = new Set(readFileSync(join(__dirname, '../../data/popular.txt'), 'utf-8').split('\n'));
