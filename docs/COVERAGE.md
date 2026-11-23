# Finals coverage map

Generated from the shipped bank with `npm run coverage`. Slide numbers are the slide sequence in the supplied chapter deck. Assignment locators refer to the files identified in SOURCE_MAP.md. All prompts are original study questions, not predictions about the final exam.

| Chapter | Questions | MCQ | True | False |
| --- | ---: | ---: | ---: | ---: |
| 7 · CPU and memory | 32 | 19 | 7 | 6 |
| 8 · CPU performance | 32 | 17 | 9 | 6 |
| 9 · Input and output | 32 | 17 | 7 | 8 |
| 10 · Computer peripherals | 38 | 21 | 10 | 7 |
| 11 · Modern computer systems | 37 | 19 | 11 | 7 |

The 40 starter records retain IDs C7-001 through C11-008, eight per chapter. The optional archive adds 442 questions in Chapters 1–6, retaining their original IDs.

## Major concepts and exercise types

| Chapter/topic | Records |
| --- | --- |
| 7 · Registers | C7-001, C7-002, C7-008, C7-010, C7-011 |
| 7 · Memory addressing | C7-003, C7-015 |
| 7 · Fetch and execute | C7-004, C7-016, C7-017, C7-018, C7-019, C7-020 |
| 7 · Instruction behavior | C7-005, C7-007, C7-021, C7-022, C7-023, C7-024, C7-026, C7-032 |
| 7 · Instruction formats | C7-006, C7-027, C7-028, C7-029 |
| 7 · CPU components | C7-009, C7-031 |
| 7 · Memory technology | C7-012, C7-013, C7-014 |
| 7 · Stacks | C7-025 |
| 7 · Addressing modes | C7-030 |
| 8 · Pipelining | C8-001, C8-002, C8-016, C8-019 |
| 8 · Superscalar execution | C8-003, C8-017, C8-018, C8-020 |
| 8 · Caches | C8-004, C8-005, C8-006, C8-022, C8-023, C8-024, C8-025, C8-026, C8-027 |
| 8 · Multiprocessing | C8-007, C8-028, C8-029, C8-030, C8-031, C8-032 |
| 8 · Memory interleaving | C8-008, C8-021 |
| 8 · CPU architecture | C8-009, C8-010, C8-011, C8-012 |
| 8 · Clock timing | C8-013, C8-014, C8-015 |
| 9 · Programmed I/O | C9-001, C9-010 |
| 9 · Interrupts | C9-002, C9-005, C9-006, C9-008, C9-011, C9-012, C9-013, C9-014, C9-015, C9-016, C9-017, C9-031 |
| 9 · DMA | C9-003, C9-004, C9-018, C9-019, C9-020, C9-021 |
| 9 · Buses | C9-007, C9-023, C9-024, C9-025, C9-026, C9-027, C9-028 |
| 9 · I/O interfaces | C9-009, C9-030 |
| 9 · I/O controllers | C9-022, C9-032 |
| 9 · Hot plugging | C9-029 |
| 10 · Flash storage | C10-001, C10-011, C10-012 |
| 10 · Magnetic disks | C10-002, C10-004, C10-013, C10-016, C10-017, C10-018, C10-019, C10-038 |
| 10 · Disk layouts | C10-003, C10-014, C10-015 |
| 10 · RAID | C10-005, C10-006, C10-020, C10-021, C10-022, C10-023 |
| 10 · Displays | C10-007, C10-027, C10-028, C10-029, C10-030, C10-031 |
| 10 · Optical storage | C10-008, C10-024, C10-025 |
| 10 · Storage hierarchy | C10-009, C10-010 |
| 10 · Magnetic tape | C10-026 |
| 10 · Graphics processing | C10-032 |
| 10 · Printers | C10-033, C10-034 |
| 10 · Input devices | C10-035, C10-036 |
| 10 · Network devices | C10-037 |
| 11 · System architecture | C11-001, C11-006, C11-008, C11-009, C11-010, C11-011, C11-012, C11-029, C11-032, C11-033, C11-034, C11-036 |
| 11 · PCI Express | C11-002, C11-007, C11-014, C11-015, C11-016, C11-017 |
| 11 · USB | C11-003, C11-018, C11-019, C11-020, C11-021, C11-030 |
| 11 · I/O channels | C11-004, C11-005, C11-025, C11-026, C11-027, C11-031, C11-037 |
| 11 · Device control | C11-013, C11-028, C11-035 |
| 11 · Thunderbolt and USB4 | C11-022, C11-023, C11-024 |

## Assignment exercise coverage

| Source exercises | Study records / treatment |
| --- | --- |
| 7.1–7.6, 7.9 | CPU/LMC roles, registers, copying, MAR/MDR, flags: C7-001–002, 008–011, 031 |
| 7.7–7.8 | Address capacity and volatile/nonvolatile RAM: C7-003, 012–015 |
| 7.10–7.13 | Fetch, LOAD/STORE/ADD/SUBTRACT, full state and branch traces: C7-004, 016–020, 021 |
| 7.14–7.19 | Classes, shifts/rotates, program control, stacks and privilege: C7-005, 007, 021–026, 032 |
| 7.20–7.21 | Opcode and register-field budget calculations: C7-006, 027–028 |
| 8 Q1–12, Q26–27 | Architecture families, simplified instruction formats, internal translation, timing: C8-009–015. Ambiguous clock wording Q8 excluded. |
| 8 Q13–16, Q28–30 | Pipeline and superscalar behavior, hazards, branch history: C8-001–003, 016–020 |
| 8 Q17–22, Q31–34 | Memory bottlenecks, cache tags/lines, locality, writes, hit ratio and average time: C8-004–006, 008, 014, 021–027 |
| 8 Q23–25, Q35 | Thread parallelism, multicore, primary-replica vs SMP, diminishing returns: C8-007, 028–032 |
| 9 Q1–10, Q12–15, Q21–27, Q31–33 | I/O requirements, word transfers, context, interrupt sources, nesting, quantum, privilege, IRQ width: C9-001–002, 005–006, 008–017, 030–031. Exact device-rate bins are omitted. |
| 9 Q11, Q28–29, Q34–35 | Block-transfer interpretation, DMA setup/conditions/path/completion, controllers: C9-003–004, 018–022. Q11 is not a verified DMA key; see SOURCE_ISSUES.md. |
| 9 Q16–20, Q30, Q36 | Hot plugging, NIC, line/bus characteristics, serial/parallel, duplex and throughput: C9-007, 023–029, 032 |
| 10 Q1–6, Q11–18, Q21–27, Q31–34 | Primary/secondary storage, flash, geometry, CAV/CLV/ZBR, capacity/timing, RAID and tape: C10-001–006, 008–026, 038. Fill-in grading quirks are not keys. |
| 10 Q7–10, Q19–20, Q28–30, Q35–36 | Display formats, frame size/RGB, LCD/OLED, GPU, printers, barcode/QR/RFID and NIC: C10-007, 027–037. Unqualified brightness and scan-code claims excluded. |
| 11 Q2–4, Q9–13, Q15–25, Q27–28, Q30–35 | Architecture, bridges, PCIe lanes, hubs, hot plugging, isochrony, interface roles and channel processors: C11-001–037, verified from slides or inspected diagrams. |
| 11 Q1, Q5–8, Q14, Q21, Q26, Q29, Q31–32 | MIPS/VLSI/SoC expansions, cable distance, synergy terminology, DisplayPort, malformed serial-SCSI item, full PCI predecessor list and eSATA: unresolved slide coverage; see SOURCE_ISSUES.md. Q21 system bottleneck concept is covered; its vocabulary is not scored. |

## Per-record source locators

| ID | Topic | Source locator |
| --- | --- | --- |
| C7-001 | Registers | Slides 11–13 · Assignment 7.6 |
| C7-002 | Registers | Slides 9, 19–21 · Assignment 7.3 |
| C7-003 | Memory addressing | Slide 16 · Assignment 7.7 |
| C7-004 | Fetch and execute | Slides 19–21 · Assignment 7.10 |
| C7-005 | Instruction behavior | Slide 27 · Assignment 7.16 |
| C7-006 | Instruction formats | Slides 34–37 · Assignment 7.20 |
| C7-007 | Instruction behavior | Slides 29–32 · Assignment 7.18 |
| C7-008 | Registers | Slide 10 · Assignment 7.4 |
| C8-001 | Pipelining | Slides 9–10 · Chapter 8 assignment, pipelining written response |
| C8-002 | Pipelining | Slide 11 |
| C8-003 | Superscalar execution | Slides 12–15 |
| C8-004 | Caches | Slides 18, 21 · Chapter 8 assignment, locality written response |
| C8-005 | Caches | Slides 18–20 · Chapter 8 assignment, cache writes written response |
| C8-006 | Caches | Slides 19–22 · Chapter 8 assignment, cache lookup written response |
| C8-007 | Multiprocessing | Slides 24–28 · Chapter 8 assignment, CPU scaling written response |
| C8-008 | Memory interleaving | Slides 16–17 |
| C9-001 | Programmed I/O | Slides 9–15 |
| C9-002 | Interrupts | Slides 21–23 |
| C9-003 | DMA | Slides 25–27 · Chapter 9 assignment, DMA written responses |
| C9-004 | DMA | Slides 25–27 · Chapter 9 assignment, DMA completion written response |
| C9-005 | Interrupts | Slides 13–17 · Chapter 9 assignment, interrupt comparison written response |
| C9-006 | Interrupts | Slides 13–14, 21–22 · Chapter 9 assignment, IRQ written response |
| C9-007 | Buses | Slides 31–35 |
| C9-008 | Interrupts | Slides 21–24 · Chapter 9 assignment, interrupt priority written response |
| C10-001 | Flash storage | Slides 8–10 · Chapter 10 assignment, SSD written response |
| C10-002 | Magnetic disks | Slides 16–17 |
| C10-003 | Disk layouts | Slides 13–15 |
| C10-004 | Magnetic disks | Slides 12, 16–18 · Chapter 10 assignment, capacity written response |
| C10-005 | RAID | Slides 19–23 |
| C10-006 | RAID | Slides 20–22 · Chapter 10 assignment, mirrored read written response |
| C10-007 | Displays | Slides 36–39 |
| C10-008 | Optical storage | Slides 13, 24–26 |
| C11-001 | System architecture | Slides 10–16 |
| C11-002 | PCI Express | Slides 17–18 · Chapter 11 assignment, PCIe items |
| C11-003 | USB | Slide 19 · Chapter 11 assignment, USB connection item |
| C11-004 | I/O channels | Slides 22–23 · Chapter 11 assignment, channel items |
| C11-005 | I/O channels | Slides 22–23 · Chapter 11 assignment, channel items |
| C11-006 | System architecture | Slides 7–15 · Chapter 11 assignment, chipset written response |
| C11-007 | PCI Express | Slide 18 · Chapter 11 assignment, PCIe lane-width item |
| C11-008 | System architecture | Slides 3–6 |
| C7-009 | CPU components | Slides 4, 6 · Assignment 7.1 |
| C7-010 | Registers | Slides 7–9 · Assignment 7.2 |
| C7-011 | Registers | Slide 9 · Assignment 7.9 |
| C7-012 | Memory technology | Slides 17–18 · Assignment 7.8 |
| C7-013 | Memory technology | Slide 17 |
| C7-014 | Memory technology | Slide 18 · Assignment 7.8 |
| C7-015 | Memory addressing | Slide 16 · derived variant of Assignment 7.7 |
| C7-016 | Fetch and execute | Slide 21 · Assignment 7.11 |
| C7-017 | Fetch and execute | Slide 23 · Assignment 7.13, pp. 3–4; independently derived |
| C7-018 | Fetch and execute | Slide 22 · derived STORE trace |
| C7-019 | Fetch and execute | Slide 24 · Assignment 7.12 |
| C7-020 | Fetch and execute | Slides 21, 23 |
| C7-021 | Instruction behavior | Slide 24 · Assignment 7.17 |
| C7-022 | Instruction behavior | Slides 25–26 · Assignment 7.14–7.17 |
| C7-023 | Instruction behavior | Slide 27 · derived variant of Assignment 7.16 |
| C7-024 | Instruction behavior | Slide 27 · Assignment 7.16 |
| C7-025 | Stacks | Slides 29–32 · Assignment 7.18 |
| C7-026 | Instruction behavior | Slide 33 |
| C7-027 | Instruction formats | Slides 34–35 · Assignment 7.20 |
| C7-028 | Instruction formats | Slides 34–38 · Assignment 7.21 |
| C7-029 | Instruction formats | Slide 34 |
| C7-030 | Addressing modes | Slide 37 |
| C7-031 | CPU components | Slide 4 · Assignment 7.1 |
| C7-032 | Instruction behavior | Assignment 7.19, p. 5 · Chapter 9 slide 26 |
| C8-009 | CPU architecture | Slide 3 · Assignment 8 Q1–4, Q26 |
| C8-010 | CPU architecture | Slide 4 |
| C8-011 | CPU architecture | Slides 3–4 |
| C8-012 | CPU architecture | Assignment 8 Q27, p. 7; model-specific terminology |
| C8-013 | Clock timing | Slides 5, 16 · independently derived |
| C8-014 | Clock timing | Slide 16 · independently derived |
| C8-015 | Clock timing | Slide 5 · Assignment 8 Q12 |
| C8-016 | Pipelining | Slides 9–10 · idealized derived example |
| C8-017 | Superscalar execution | Slide 15 · Assignment 8 Q30 |
| C8-018 | Superscalar execution | Slides 12–15 · Assignment 8 Q10 |
| C8-019 | Pipelining | Slides 11, 15 · Assignment 8 Q16 |
| C8-020 | Superscalar execution | Slide 15 |
| C8-021 | Memory interleaving | Slides 16–17 · Assignment 8 Q19 |
| C8-022 | Caches | Slides 18, 21 · Assignment 8 Q21–22 |
| C8-023 | Caches | Slide 18 · independently derived |
| C8-024 | Caches | Slides 18–22 · derived cache timing, assumptions stated |
| C8-025 | Caches | Slide 18 · Assignment 8 Q31 |
| C8-026 | Caches | Slide 18 · Assignment 8 Q33 |
| C8-027 | Caches | Slide 22 |
| C8-028 | Multiprocessing | Slides 25, 27 |
| C8-029 | Multiprocessing | Slides 25, 28 · Assignment 8 Q25 |
| C8-030 | Multiprocessing | Slide 24 |
| C8-031 | Multiprocessing | Slide 27 |
| C8-032 | Multiprocessing | Slide 28 · Assignment 8 Q35 |
| C9-009 | I/O interfaces | Slides 4–5 |
| C9-010 | Programmed I/O | Slide 10 · Assignment 9 Q24 |
| C9-011 | Interrupts | Slides 14, 17 · Assignment 9 Q14, Q25 |
| C9-012 | Interrupts | Slides 14, 17 |
| C9-013 | Interrupts | Slides 21–23 |
| C9-014 | Interrupts | Slide 16 · Assignment 9 Q9 |
| C9-015 | Interrupts | Slide 15 · Assignment 9 Q26 |
| C9-016 | Interrupts | Slides 17, 24 · Assignment 9 Q32 |
| C9-017 | Interrupts | Slides 17, 24 · Assignment 9 Q32 |
| C9-018 | DMA | Slides 25–27 · Assignment 9 Q34 |
| C9-019 | DMA | Slides 25–26 · Assignment 9 Q35 |
| C9-020 | DMA | Slide 25 · Assignment 9 Q28 |
| C9-021 | DMA | Slide 26 · derived DMA setup exercise |
| C9-022 | I/O controllers | Slides 28–30 |
| C9-023 | Buses | Slide 33 · Assignment 9 Q20 |
| C9-024 | Buses | Slide 33 |
| C9-025 | Buses | Slide 31 |
| C9-026 | Buses | Slide 34 |
| C9-027 | Buses | Slide 32 · derived bus throughput exercise |
| C9-028 | Buses | Slides 33–35 |
| C9-029 | Hot plugging | Assignment 9 Q16, p. 4 · Chapter 11 slide 21 |
| C9-030 | I/O interfaces | Slides 26, 28 · Assignment 9 Q10, Q15, Q27 |
| C9-031 | Interrupts | Slides 14, 21 · derived variant of Assignment 9 Q31 |
| C9-032 | I/O controllers | Assignment 9 Q17 · Chapter 10 slide 48 |
| C10-009 | Storage hierarchy | Slides 3–6 · Assignment 10 Q12, Q31 |
| C10-010 | Storage hierarchy | Slide 5 |
| C10-011 | Flash storage | Slides 8–10 · Assignment 10 Q2–3, Q32 |
| C10-012 | Flash storage | Slides 10–17 |
| C10-013 | Magnetic disks | Slides 11–12 |
| C10-014 | Disk layouts | Slides 14–15 |
| C10-015 | Disk layouts | Slide 14 |
| C10-016 | Magnetic disks | Slide 17 · Assignment 10 Q24, p. 6; independently derived |
| C10-017 | Magnetic disks | Slide 17 · Assignment 10 Q25, p. 6; independently derived |
| C10-018 | Magnetic disks | Slides 16–17 |
| C10-019 | Magnetic disks | Assignment 10 Q33, p. 8 · independently derived; GB/GiB ambiguity resolved |
| C10-020 | RAID | Slide 23 |
| C10-021 | RAID | Slide 20 · derived mirrored-capacity exercise |
| C10-022 | RAID | Slide 23 |
| C10-023 | RAID | Slide 20 · Assignment 10 Q34 |
| C10-024 | Optical storage | Slide 24 · independently derived |
| C10-025 | Optical storage | Slides 24–27 |
| C10-026 | Magnetic tape | Slides 7, 28 · Assignment 10 Q18, Q27 |
| C10-027 | Displays | Slide 30 · independently derived |
| C10-028 | Displays | Slide 29 |
| C10-029 | Displays | Slides 29–30 · Assignment 10 Q7, Q19 |
| C10-030 | Displays | Slides 36–38 · Assignment 10 Q35 |
| C10-031 | Displays | Slides 36–39 |
| C10-032 | Graphics processing | Slides 33–35 · Assignment 10 Q28 |
| C10-033 | Printers | Slides 40, 42–44 · Assignment 10 Q29 |
| C10-034 | Printers | Slides 40, 45 |
| C10-035 | Input devices | Slide 46 · Assignment 10 Q36 |
| C10-036 | Input devices | Slide 46 · Assignment 10 Q20 |
| C10-037 | Network devices | Slide 48 · Assignment 10 Q30 |
| C10-038 | Magnetic disks | Slide 18 |
| C11-009 | System architecture | Slides 3–13 |
| C11-010 | System architecture | Slides 8–11 · Assignment 11 Q20 |
| C11-011 | System architecture | Slides 12–15 · Assignment 11 Q23, Q33 |
| C11-012 | System architecture | Slides 3–6 |
| C11-013 | Device control | Slide 16 · Assignment 11 Q18 |
| C11-014 | PCI Express | Slide 18 · Assignment 11 Q24 |
| C11-015 | PCI Express | Slide 18 · derived PCIe-width exercise |
| C11-016 | PCI Express | Slide 18 · Assignment 11 Q3, Q31 |
| C11-017 | PCI Express | Slide 18 · derived calculation, hypothetical lane rate |
| C11-018 | USB | Slide 19 |
| C11-019 | USB | Slide 19 · Assignment 11 Q4, Q11 |
| C11-020 | USB | Slide 19 |
| C11-021 | USB | Slide 21 · Assignment 11 Q28 |
| C11-022 | Thunderbolt and USB4 | Slide 21 |
| C11-023 | Thunderbolt and USB4 | Slide 20 |
| C11-024 | Thunderbolt and USB4 | Slides 20–21 |
| C11-025 | I/O channels | Slides 22–23 · Assignment 11 Q15, Q19, Q30 |
| C11-026 | I/O channels | Slides 22–23 |
| C11-027 | I/O channels | Slide 22 |
| C11-028 | Device control | Slide 16 · Assignment 11 Q35 |
| C11-029 | System architecture | Slides 11–16 |
| C11-030 | USB | Slide 19 · derived unit conversion |
| C11-031 | I/O channels | Slides 22–23 |
| C11-032 | System architecture | Slides 13–16 |
| C11-033 | System architecture | Slide 14, inspected architecture diagram |
| C11-034 | System architecture | Slide 14, inspected architecture diagram |
| C11-035 | Device control | Slide 13, inspected diagram · Assignment 11 Q27 |
| C11-036 | System architecture | Slide 12, inspected pathway diagram · Chapter 9 slides 25–27 |
| C11-037 | I/O channels | Slide 23, inspected architecture diagram |

## Saved mock inventory

Six 20-question finals mocks use 120 distinct questions with 0 reused slots. Each has four questions per finals chapter. The UI shows the measured pairwise overlap matrix.
