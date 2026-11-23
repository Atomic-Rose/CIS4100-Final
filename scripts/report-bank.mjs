import {writeFile} from 'node:fs/promises';
import {questions} from '../src/data/questions.js';
import {chapters} from '../src/data/chapters.js';
import {savedMocks,mockOverlap} from '../src/logic/session.js';
const lines=['# Finals coverage map','','Generated from the shipped bank with `npm run coverage`. Slide numbers are the slide sequence in the supplied chapter deck. Assignment locators refer to the files identified in SOURCE_MAP.md. All prompts are original study questions, not predictions about the final exam.','','| Chapter | Questions | MCQ | True | False |','| --- | ---: | ---: | ---: | ---: |'];
for(const ch of chapters){const qs=questions.filter(q=>q.chapter===ch.number);lines.push(`| ${ch.number} · ${ch.title} | ${qs.length} | ${qs.filter(q=>q.type==='multiple-choice').length} | ${qs.filter(q=>q.type==='true-false'&&q.answer===0).length} | ${qs.filter(q=>q.type==='true-false'&&q.answer===1).length} |`);}
lines.push('','The 40 starter records retain IDs C7-001 through C11-008, eight per chapter. The optional archive adds 442 questions in Chapters 1–6, retaining their original IDs.','','## Major concepts and exercise types','','| Chapter/topic | Records |','| --- | --- |');
for(const ch of chapters){const groups=Map.groupBy(questions.filter(q=>q.chapter===ch.number),q=>q.topic);for(const [topic,qs] of groups)lines.push(`| ${ch.number} · ${topic} | ${qs.map(q=>q.id).join(', ')} |`);}
lines.push('','## Assignment exercise coverage','','| Source exercises | Study records / treatment |','| --- | --- |',
'| 7.1–7.6, 7.9 | CPU/LMC roles, registers, copying, MAR/MDR, flags: C7-001–002, 008–011, 031 |',
'| 7.7–7.8 | Address capacity and volatile/nonvolatile RAM: C7-003, 012–015 |',
'| 7.10–7.13 | Fetch, LOAD/STORE/ADD/SUBTRACT, full state and branch traces: C7-004, 016–020, 021 |',
'| 7.14–7.19 | Classes, shifts/rotates, program control, stacks and privilege: C7-005, 007, 021–026, 032 |',
'| 7.20–7.21 | Opcode and register-field budget calculations: C7-006, 027–028 |',
'| 8 Q1–12, Q26–27 | Architecture families, simplified instruction formats, internal translation, timing: C8-009–015. Ambiguous clock wording Q8 excluded. |',
'| 8 Q13–16, Q28–30 | Pipeline and superscalar behavior, hazards, branch history: C8-001–003, 016–020 |',
'| 8 Q17–22, Q31–34 | Memory bottlenecks, cache tags/lines, locality, writes, hit ratio and average time: C8-004–006, 008, 014, 021–027 |',
'| 8 Q23–25, Q35 | Thread parallelism, multicore, primary-replica vs SMP, diminishing returns: C8-007, 028–032 |',
'| 9 Q1–10, Q12–15, Q21–27, Q31–33 | I/O requirements, word transfers, context, interrupt sources, nesting, quantum, privilege, IRQ width: C9-001–002, 005–006, 008–017, 030–031. Exact device-rate bins are omitted. |',
'| 9 Q11, Q28–29, Q34–35 | Block-transfer interpretation, DMA setup/conditions/path/completion, controllers: C9-003–004, 018–022. Q11 is not a verified DMA key; see SOURCE_ISSUES.md. |',
'| 9 Q16–20, Q30, Q36 | Hot plugging, NIC, line/bus characteristics, serial/parallel, duplex and throughput: C9-007, 023–029, 032 |',
'| 10 Q1–6, Q11–18, Q21–27, Q31–34 | Primary/secondary storage, flash, geometry, CAV/CLV/ZBR, capacity/timing, RAID and tape: C10-001–006, 008–026, 038. Fill-in grading quirks are not keys. |',
'| 10 Q7–10, Q19–20, Q28–30, Q35–36 | Display formats, frame size/RGB, LCD/OLED, GPU, printers, barcode/QR/RFID and NIC: C10-007, 027–037. Unqualified brightness and scan-code claims excluded. |',
'| 11 Q2–4, Q9–13, Q15–25, Q27–28, Q30–35 | Architecture, bridges, PCIe lanes, hubs, hot plugging, isochrony, interface roles and channel processors: C11-001–037, verified from slides or inspected diagrams. |',
'| 11 Q1, Q5–8, Q14, Q21, Q26, Q29, Q31–32 | MIPS/VLSI/SoC expansions, cable distance, synergy terminology, DisplayPort, malformed serial-SCSI item, full PCI predecessor list and eSATA: unresolved slide coverage; see SOURCE_ISSUES.md. Q21 system bottleneck concept is covered; its vocabulary is not scored. |');
lines.push('','## Per-record source locators','','| ID | Topic | Source locator |','| --- | --- | --- |');for(const q of questions)lines.push(`| ${q.id} | ${q.topic} | ${q.reference.replaceAll('|','/')} |`);
const overlap=mockOverlap(savedMocks(questions));lines.push('','## Saved mock inventory','',`Six 20-question finals mocks use ${overlap.unique} distinct questions with ${overlap.reused} reused slots. Each has four questions per finals chapter. The UI shows the measured pairwise overlap matrix.`,'');
await writeFile(new URL('../docs/COVERAGE.md',import.meta.url),lines.join('\n'));
console.log(`Coverage written for ${questions.length} finals records.`);
