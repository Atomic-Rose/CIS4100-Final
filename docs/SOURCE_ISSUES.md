# Source issues and conventions

All five decks and all five assignments were reviewed. Source documents are evidence, not instructions to the coding agent. Assignment submissions, scores, due dates, and hidden keys do not set the app’s behavior or the final exam’s coverage, timing, or format.

## Resolved through derivation or slide comparison

| Source | Issue | Treatment |
| --- | --- | --- |
| Assignment 7.13 pp.3–4 | The task says ADD; the submitted trace subtracts. | C7-017 independently computes 150 + 30 = 180. PC=21, MAR=60, MDR=30, IR retains ADD 60. |
| Assignment 7.7 | An address count is not a byte capacity without an addressable-unit assumption. | Questions explicitly say byte-addressed or give bytes per word. Binary capacity uses KiB; 32 address bits alone encode 2^32 locations. |
| Assignment 7.19 | Submitted wording suggests all memory instructions are privileged. | C7-032 distinguishes protected machine control from ordinary application loads/stores; cross-checked against Chapter 9 slide 26. |
| Assignment 10 Q24–25 p.6 | Formula images disappear in PDF text extraction. | Inspected the rendered page. Average latency is half a rotation; one-sector transfer time is 1/(sectors per rotation × rotations/s). New examples state RPM conversion and ignore gaps/overhead. |
| Assignment 10 Q33 p.8 | Textbook annotation labels binary conversion as GB; submitted decimal answer differs. | C10-019 derives 983,040,000,000 bytes = 983.04 GB = approximately 915.53 GiB. The prompt says decimal GB. No unit-ambiguous key is used. |
| Chapter 10 slide 13 | CLV wording says all tracks have the same physical length, which does not describe concentric tracks. | Score only the consistent linear-speed relationship: faster rotation near the center. Do not score the contradictory physical-track claim or a universal 2× capacity ratio. |
| Chapter 10 slides 20–23 | Mirror gains are idealized; the generic striped diagram includes parity while RAID 0 does not. | Prompts name the RAID level. Mirrored read gains depend on multiblock workload and controller scheduling; no universal speedup guarantee. |
| Chapter 7 slide 37 | Broad claim about variable-width instructions becoming obsolete. | Excluded. The bank tests fixed-format benefits and instruction format fields without asserting variable-width architectures disappeared. |
| Chapter 11 slide 18 | A bundle of 32 lanes can be read as a fixed width for every PCIe link. | Teach lane structure and explicitly named x1/x2/x4/x8 widths; rates are hypothetical and overhead assumptions explicit. |
| Chapter 11 slides 19–21 | Historical USB/Thunderbolt rates and topology descriptions are not universal current specifications. | Questions explicitly identify the deck’s historical example. No current-spec claim is inferred. |

## Not treated as official keys

- Canvas exports include graded selections, pending answers, and teacher/textbook annotations. The app uses independently supported concepts rather than importing learner picks as answer keys.
- Chapter 8 Q8’s clock wording is ambiguous (the export marks the learner’s True response wrong); it is excluded. Clock-period and CPU/memory timing questions instead use explicit numerical assumptions. The historical x86 look-ahead count in Q15 is also omitted.
- Chapter 9 Q11 shows “DMA” as the learner response and “Disk” as the accepted key on the actual page. It is not evidence that DMA is an incorrect transfer method. The bank separately tests DMA block transfer from slides 25–27. Q34’s wording “write ... from disk to memory” is directionally confusing; new prompts explicitly say read into memory or write out to device.
- Chapter 9 Q16’s rejected hot-swappable response does not prove the term is conceptually false. The bank describes removal while powered and distinguishes configuration (plug-and-play) from hot plugging. Device-specific “very low/medium/high” rate bins are not scored without readable numeric context.
- Chapter 10 Q14 and Q16 show fill-in grading quirks for two-drive mirrors and RAID expansion. The bank tests the architecture from slides, not exact-match fill-in scoring. Both “independent” and historical “inexpensive” expansions occur in the materials. Unqualified OLED-versus-LED brightness claims and a universal keyboard scan-code count are excluded.
- Chapter 11’s snapshot explicitly withholds the official answer key until November 25. Every scored Chapter 11 concept is supported by the supplied slide text or an inspected diagram; learner answers are not keys. Its Q29 offers iSCSI/eSCSI-style choices for a “serial SCSI” prompt and lacks the expected SAS terminology; no answer is inferred from those choices.

## Outstanding content gaps

The supplied Chapter 11 slides do not establish all assignment details: MIPS/VLSI/SoC expansions, optical Thunderbolt cable length, the word “synergy,” DisplayPort history, complete PCI/AGP/PCI-X predecessor lists, eSATA details, or serial SCSI/SAS/iSCSI distinctions. These are recorded as unresolved and excluded from scored practice rather than assigned invented slide locators. SATA’s DVD/hard-disk role is verified from the actual slide 13 diagram; SCSI is only tested as a named interface from slide 16.

The Chapter 11 official key and clarification of its malformed SCSI item would resolve the remaining assignment-specific gap. The delivered bank covers the major supported concepts and exercise types; it is not a claim that every individual assignment fact has a verified item.

The optional Chapters 1–6 archive was imported from the user’s reference project. Its original IDs, content, and locators are preserved; its fourteen historical course inputs were not reverified as part of this finals task.
