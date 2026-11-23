// Per-question concept tags and one-sentence "why not" lines for each wrong choice.
// Drafted from sources/ch*-slides.txt and assignments; entries with `verify` still need a source check (see docs/RATIONALES.md).
import { ch7Rationales } from './ch7.js';
import { ch8Rationales } from './ch8.js';
import { ch9Rationales } from './ch9.js';
import { ch9DmaRationales } from './ch9-dma.js';
import { ch10Rationales } from './ch10.js';
import { ch11Rationales } from './ch11.js';
export const rationales = { ...ch7Rationales, ...ch8Rationales, ...ch9Rationales, ...ch9DmaRationales, ...ch10Rationales, ...ch11Rationales };
