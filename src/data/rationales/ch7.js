// Drafted distractor rationales for Chapter 7. whyNot keys are canonical choice indexes, not display order.
// Drafted from sources/ch7-slides.txt and sources/ch7-assignment.txt; entries in `verify` need a source check.
export const ch7Rationales = {
  'C7-001': { concept: 'mar-mdr-roles', whyNot: {
    1: 'False would describe the MDR, which carries the value moving to or from memory; the MAR holds the location.' } },
  'C7-002': { concept: 'special-register-roles', whyNot: {
    0: 'The program counter holds the address of the next instruction, not the instruction being decoded.',
    1: 'The MAR holds a memory location to access; during fetch it receives the PC’s address, not the instruction itself.',
    3: 'A stack pointer tracks the top of the stack for pushes and pops; it does not hold the current instruction.' },
    verify: [3], note: 'Stack pointer is not named in the Ch 7 slides or assignment; its role is from general knowledge.' },
  'C7-003': { concept: 'address-space-size', whyNot: {
    0: '512 bytes is 2^9; a 12-bit address gives 2^12 locations, so the exponent is the full register width.',
    1: '1 KiB is 2^10 bytes, two bits short; each extra address bit doubles the number of locations.',
    2: '2 KiB is 2^11, which uses one bit fewer than the 12-bit register provides.' } },
  'C7-004': { concept: 'fetch-cycle-steps', whyNot: {
    1: 'Fetch begins by sending the PC’s address to the MAR; memory uses the MAR, not the PC, to select the location.' } },
  'C7-005': { concept: 'shift-vs-rotate', whyNot: {
    0: 'Discarding the outgoing bit describes a shift; a rotate wraps that bit around to the opposite end.' } },
  'C7-006': { concept: 'instruction-field-widths', whyNot: {
    0: '4 bits give only 2^4 = 16 patterns, too few for 32 instructions.',
    2: '6 bits give 64 patterns; that works but is not the minimum, since 2^5 already equals 32.',
    3: '32 is the number of instructions, not bits; n bits encode 2^n opcodes, so far fewer bits are needed.' } },
  'C7-007': { concept: 'stack-lifo', whyNot: {
    1: 'A single fixed location would be overwritten by the inner call; a stack keeps each return address and pops the newest first.' } },
  'C7-008': { concept: 'register-copy-semantics', whyNot: {
    0: 'This treats a copy as a destructive move; the source keeps its value and only the destination is overwritten.' } },
  'C7-009': { concept: 'alu-cu-roles', whyNot: {
    1: 'Mailboxes model memory locations, not the ALU, and the calculator models the ALU rather than the control unit.',
    2: 'The counter models the program counter and mailboxes model memory; neither stands for the ALU or the CU.',
    3: 'This swaps the roles: the calculator does arithmetic like the ALU, while the little man directs work like the CU.' } },
  'C7-010': { concept: 'register-definition', whyNot: {
    0: 'Megabytes describe main memory; a register is a small CPU location sized in bits or bytes, holding one value, not a program.' } },
  'C7-011': { concept: 'special-register-roles', whyNot: {
    0: 'An instruction word holds a whole instruction, opcode plus address, not a single Boolean condition.',
    1: 'A memory address is a multi-bit location number, not a one-bit flag recording a condition.',
    3: 'The program counter holds the full address of the next instruction, not a one-bit condition.' } },
  'C7-012': { concept: 'memory-volatility', whyNot: {
    1: '“Static” means no refresh while powered, not nonvolatile; SRAM still loses its contents when power is removed.' } },
  'C7-013': { concept: 'dram-refresh', whyNot: {
    0: 'SRAM holds its bits without refresh while powered; static RAM is the type that skips refreshing.',
    2: 'ROM is nonvolatile and keeps firmware without power, so it needs no refresh.',
    3: 'Flash is nonvolatile storage that retains data without power or refresh cycles.' } },
  'C7-014': { concept: 'memory-volatility', whyNot: {
    0: 'DRAM is working memory that loses everything at power-off; persistent firmware needs nonvolatile ROM or flash.' } },
  'C7-015': { concept: 'address-space-size', whyNot: {
    0: '262,144 counts addresses as if each held one byte; each address here selects a 2-byte word, so double it.',
    2: '131,072 divides by two instead of multiplying; wider words mean more bytes per address, not fewer.',
    3: '2,097,152 multiplies by 8, as if converting to bits; a 16-bit word is 16 ÷ 8 = 2 bytes per address.' } },
  'C7-016': { concept: 'fetch-cycle-steps', whyNot: {
    0: 'Copying PC into MAR starts the next instruction fetch; the LOAD’s own operand address comes from the IR.',
    2: 'The instruction is already in the IR; copying MDR again repeats fetch instead of selecting the operand.',
    3: 'Moving A into MDR is STORE’s execute step; LOAD brings data from memory into A, not out of it.' } },
  'C7-017': { concept: 'lmc-instruction-trace', whyNot: {
    1: 'This freezes MAR and MDR at the fetch (address 20, code 160) and subtracts; execute reloads them with 60 and 30, then adds.',
    2: 'This swaps PC and MAR: PC simply increments to 21, while MAR ends holding the operand address 60.',
    3: 'This leaves PC and A unchanged, as if the instruction were only fetched; ADD updates A and PC still advances to 21.' },
    verify: [1], note: 'Assignment 7.13 p. 4 lists “A from A – MDR” for this ADD trace, which conflicts with slide 23; the A=120 option may echo that error.' },
  'C7-018': { concept: 'lmc-instruction-trace', whyNot: {
    1: 'Copying memory[70] into A is LOAD; STORE moves A’s value out through MDR into memory[70].',
    2: 'Address 9 holds the STORE instruction itself; the address field 70 is where A’s value goes.',
    3: 'STORE is not a branch; only branch instructions copy an address into the PC, so PC just advances to 10.' } },
  'C7-019': { concept: 'lmc-instruction-trace', whyNot: {
    0: '7 is the operand from memory[90]; SUBTRACT computes A − MDR rather than loading the operand into A.',
    2: '19 is A before execution; SUBTRACT does change A, replacing it with 19 − 7.',
    3: '26 adds the operand; SUBTRACT uses A − MDR, not A + MDR.' } },
  'C7-020': { concept: 'lmc-instruction-trace', whyNot: {
    1: 'Adding to the old accumulator is ADD’s step; LOAD copies MDR into A, replacing the previous value.' } },
  'C7-021': { concept: 'branch-pc-update', whyNot: {
    0: 'A false branch does not restart the program; PC simply advances to the next sequential address.',
    1: 'Staying at 12 would re-execute the branch forever; a false condition still increments PC to 13.',
    3: '45 is loaded only when the condition is true; a false condition falls through to PC + 1.' } },
  'C7-022': { concept: 'instruction-classes', whyNot: {
    1: 'SUBTRACT computes a new value from two operands, so it is arithmetic rather than simple movement.',
    2: 'BRANCH on zero changes which instruction runs next, making it program control, not data movement.',
    3: 'XOR combines bits with Boolean logic; it transforms data rather than just moving it.' } },
  'C7-023': { concept: 'shift-vs-rotate', whyNot: {
    0: '00000011 wraps the outgoing 1 into the low end, which is a rotate; a logical shift drops it and fills with 0.',
    1: '11000000 moves bits right and copies the high bit, like an arithmetic right shift, not a left shift.',
    3: '10000001 is the unchanged input; a shift always moves every bit one position.' },
    verify: [1], note: 'Arithmetic right shift (sign-bit copy) is not described in the slide text or assignment; slide 27 is an image.' },
  'C7-024': { concept: 'shift-vs-rotate', whyNot: {
    1: 'False expects a logical right shift, giving 00000000; a rotate carries the outgoing low bit around to the high end.' } },
  'C7-025': { concept: 'stack-lifo', whyNot: {
    0: '12 then 40 removes in insertion order, like a queue; a stack pops the most recent push first.',
    1: '40 then 75 skips the top item; POP always returns the newest entry, 75, before anything below it.',
    2: 'After 75, the next item down is 40, not 12; a stack removes items in exact reverse order of pushing.' } },
  'C7-026': { concept: 'simd', whyNot: {
    1: 'False may confuse SIMD with issuing several instructions per cycle; SIMD is one instruction applied across many data elements.' },
    verify: [1], note: 'Superscalar issue is not covered in the Ch 7 slides; the contrast comes from the question’s explanation and general knowledge.' },
  'C7-027': { concept: 'instruction-field-widths', whyNot: {
    0: '5 is the opcode width; the address field gets the bits that remain after the opcode.',
    1: '16 assumes a half-and-half split; with one address field, all 32 − 5 remaining bits go to the address.',
    3: '32 is the whole instruction width; the opcode still takes 5 of those bits.' } },
  'C7-028': { concept: 'instruction-field-widths', whyNot: {
    0: '8 is the opcode width; spare bits are what remains after the opcode and both register fields.',
    1: '12 leaves room for a third 4-bit register field; this two-register format needs only 2 × 4 bits.',
    3: '24 subtracts only the opcode; the two 4-bit register selectors also take space.' } },
  'C7-029': { concept: 'implicit-explicit-operands', whyNot: {
    0: 'Implicit operands are assumed by default, like the accumulator in ADD, so they need no address field at all.' } },
  'C7-030': { concept: 'addressing-modes', whyNot: {
    0: 'Immediate mode puts the operand value itself in the instruction, with no register or memory lookup.',
    1: 'Direct mode, as in the LMC, puts the memory address in the instruction itself; here the address sits in R2.',
    3: 'Register direct would use R2’s contents as the operand; here R2’s contents are an address to follow.' },
    verify: [0, 3], note: 'Slide 37 only names immediate and lists register deferred; immediate and register-direct definitions are from general knowledge.' },
  'C7-031': { concept: 'alu-cu-roles', whyNot: {
    0: 'This reverses the roles: the ALU does the arithmetic, and the control unit coordinates transfers and directs the ALU.' } },
  'C7-032': { concept: 'privileged-instructions', whyNot: {
    0: 'Privilege protects system control; it has nothing to do with how many register operands an application uses.',
    2: 'Applications still load and store their own memory; privilege guards operations affecting system control or other programs.',
    3: 'Privilege restricts who may run an instruction; it says nothing about how many cycles the instruction takes.' },
    verify: [2], note: 'Assignment 7.19 lists “memory instructions” as privileged, which a reader could take as conflicting; the own-memory distinction relies on the Ch 9 reference.' },
};
