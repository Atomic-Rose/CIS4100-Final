// Writes docs/RATIONALES.md: coverage of the drafted wrong-answer rationales and every entry that still needs a source check.
import { writeFile } from 'node:fs/promises';
import { questions } from '../src/data/questions.js';
import { rationales } from '../src/data/rationales/index.js';
const cell = s => String(s).replace(/\|/g, '\|');
const flagged = questions.filter(q => rationales[q.id]?.verify?.length);
const lines = questions.reduce((n, q) => n + Object.keys(q.whyNot || {}).length, 0);
const concepts = Map.groupBy(questions, q => q.concept);
const rows = flagged.flatMap(q => rationales[q.id].verify.map(i => `| ${q.id} | ${cell(q.topic)} | ${'ABCD'[i] ?? i} · ${cell(q.choices[i])} | ${cell(q.whyNot[i])} | ${cell(rationales[q.id].note || '')} |`));
const md = `# Wrong-answer rationales

Every finals question has a \`concept\` tag and a one-sentence rationale for each wrong choice: ${questions.length} questions, ${lines} rationales, ${concepts.size} concepts (${[...concepts.values()].filter(g => g.length > 1).length} shared by two or more questions).

Rationales were drafted from \`sources/ch*-slides.txt\`, the chapter assignments, and each question's existing explanation and locator. Chapter 9 DMA (\`src/data/rationales/ch9-dma.js\`) was written first as the reference example. Question IDs, choices, and canonical answers are unchanged.

**Spot-check first:** ${rows.length} rationales on ${flagged.length} questions rest on general knowledge, an image missing from the text export, or a source that conflicts with itself. Letters are canonical choice order in the bank, not the shuffled display order.

| ID | Topic | Choice | Rationale | Why it is flagged |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

Regenerate with \`node scripts/report-rationales.mjs\`.
`;
await writeFile(new URL('../docs/RATIONALES.md', import.meta.url), md);
console.log(`docs/RATIONALES.md: ${rows.length} flagged rationales on ${flagged.length} questions`);
