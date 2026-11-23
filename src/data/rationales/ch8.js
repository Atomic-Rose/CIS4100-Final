// Drafted distractor rationales for Chapter 8. whyNot keys are canonical choice indexes, not display order.
// Drafted from sources/ch8-slides.txt and sources/ch8-assignment.txt; entries in `verify` need a source check.
export const ch8Rationales = {
  'C8-001': { concept: 'pipeline-timing', whyNot: {
    1: 'Pipelining shortens the average time between completions, not the cycles one instruction spends passing through every stage.' } },
  'C8-002': { concept: 'branch-prediction', whyNot: {
    0: 'Wrong-path instructions must never commit; letting them finish first would apply effects from a path the program didn’t take.',
    1: 'A misprediction means those instructions came from the wrong path, so keeping them would run code the program should skip.',
    3: 'Instructions on the predicted path don’t supply the branch’s outcome; the branch only decides where fetching continues.' },
    verify: [0, 1, 3], note: 'Slide 11 lists branch-problem solutions but never describes discarding wrong-path instructions; rationales rest on general knowledge.' },
  'C8-003': { concept: 'superscalar-parallelism', whyNot: {
    1: 'One instruction per cycle describes scalar processing; superscalar adds parallel execution units to process more than one per cycle.' } },
  'C8-004': { concept: 'cache-locality', whyNot: {
    1: 'Interleaving spreads addresses across memory banks to overlap accesses; it doesn’t explain why reused bytes are worth caching.',
    2: 'Write-through is a policy for sending cache writes to memory, not a reason instructions are good to keep in cache.',
    3: 'Spatial locality is about touching neighboring addresses; reusing the same bytes repeatedly over time is temporal locality.' },
    verify: [3], note: 'Sources say only “locality of reference”; the temporal vs. spatial terms come from general knowledge and the bank explanation.' },
  'C8-005': { concept: 'cache-write-policy', whyNot: {
    0: 'Holding a change until a dirty block is evicted is write-back; write-through sends each write to memory immediately.' } },
  'C8-006': { concept: 'cache-lookup', whyNot: {
    0: 'A miss means this cache doesn’t hold the block, so the missing bytes must come from the next level, not just a tag.',
    1: 'Registers sit outside the memory hierarchy here; a cache miss is filled by the level below the cache, not the register file.',
    2: 'The controller fetches the block containing the missed address, not whatever block happens to come next in sequence.' },
    verify: [1, 2], note: 'Slides 19–20 are diagrams with no exported text; register-file and next-sequential-block points come from general knowledge.' },
  'C8-007': { concept: 'multiprocessor-scaling', whyNot: {
    0: 'A second CPU helps only the parallel part; serial work, coordination overhead, and shared-resource conflicts keep speedup below 2×.' } },
  'C8-008': { concept: 'memory-interleaving', whyNot: {
    1: 'Each interleaved bank has its own address and data registers, so accesses to different banks can overlap.' } },
  'C8-009': { concept: 'cpu-architecture-families', whyNot: {
    1: 'PCI Express is an I/O bus that connects devices to the CPU, not a processor architecture family.',
    2: 'POWER/PowerPC and SPARC are CPU families, but DRAM is a memory technology, so the group isn’t three architectures.',
    3: 'ARM and x86 are CPU families, but USB is a peripheral interface, so the group isn’t three architectures.' } },
  'C8-010': { concept: 'risc-design', whyNot: {
    1: 'Fixed-length, fixed-format words let the CPU know each instruction’s boundary in advance, so several can be fetched and decoded in parallel.' } },
  'C8-011': { concept: 'risc-design', whyNot: {
    0: 'Rarely used specialized instructions are what RISC removed, because they added hardware complexity and slowed other instructions.',
    2: 'Forcing operands into slow memory is the opposite of RISC, which adds general registers to cut data-memory accesses.',
    3: 'Variable-length instructions make boundaries harder to find; RISC favors fixed-length formats for parallel fetch and decode.' } },
  'C8-012': { concept: 'code-morphing', whyNot: {
    1: 'This reverses the direction: code-morphing turns complex external instructions into simpler internal ones.',
    2: 'Cache tags locate blocks in cache; code-morphing works on machine instructions, not source-language variables.',
    3: 'Code-morphing translates instructions while preserving their behavior; it doesn’t turn operand data into opcodes.' } },
  'C8-013': { concept: 'clock-timing', whyNot: {
    0: '2 ns uses the frequency number directly as the period; the period is its reciprocal, 1 ÷ 2 GHz.',
    2: '50 ns misplaces the power of ten; 1 ÷ (2 × 10^9) s is 0.5 × 10^-9 s.',
    3: '500 ns mixes up units: 0.5 ns equals 500 picoseconds, not 500 nanoseconds.' } },
  'C8-014': { concept: 'clock-timing', whyNot: {
    0: '35 divides 70 by 2 instead of by the 0.5 ns period; dividing by a half doubles the count.',
    1: '70 assumes one cycle per nanosecond, a 1 GHz clock; at 2 GHz each cycle is only 0.5 ns.',
    3: '700 treats the period as 0.1 ns; 70 ns ÷ 0.5 ns per cycle is 140 cycles.' } },
  'C8-015': { concept: 'clock-timing', whyNot: {
    0: 'Clock rate counts cycles, not instructions; many instructions take several cycles or stall, so 3 GHz isn’t 3 billion instructions.' } },
  'C8-016': { concept: 'pipeline-timing', whyNot: {
    0: '8 counts one cycle per instruction but forgets the 4 extra cycles needed to fill the five-stage pipeline.',
    2: '13 is 5 + 8, which counts the first instruction twice: it finishes at cycle 5, then 7 more follow.',
    3: '40 is 5 × 8, the time with no overlap at all; pipelining overlaps the stages of successive instructions.' },
    verify: [0, 2], note: 'The fill formula (stages + instructions − 1) isn’t stated in the sources; arithmetic derived from the question’s idealized setup.' },
  'C8-017': { concept: 'data-dependency', whyNot: {
    1: 'The destinations differ, R1 versus R4; the wait comes from the second ADD reading R1, not writing the same register.',
    2: 'Neither ADD is a branch, so there is no branch target; this is a data dependency, not a control dependency.',
    3: 'Sharing an opcode creates no dependency; the problem is that the second ADD needs the value the first produces.' } },
  'C8-018': { concept: 'superscalar-parallelism', whyNot: {
    1: 'Execution units take different numbers of steps for different operations, so independent instructions can complete out of program order.' } },
  'C8-019': { concept: 'branch-prediction', whyNot: {
    1: 'Cache tags record which memory blocks are cached; they say nothing about whether a branch was taken before.',
    2: 'Saved return addresses let subroutines return to their callers; they don’t record past branch outcomes.',
    3: 'Register alias tables map logical to physical registers to resolve register conflicts, not to predict branches.' },
    verify: [2], note: 'Return-address saving isn’t covered in the Ch 8 sources (likely an earlier chapter); rationale from general knowledge.' },
  'C8-020': { concept: 'data-dependency', whyNot: {
    0: 'Renaming resolves conflicts over reused register names; an instruction that needs another’s result must still wait for it.' } },
  'C8-021': { concept: 'memory-interleaving', whyNot: {
    1: 'This swaps the two: separate banks describe interleaving, while a wider path retrieves more bytes per access.',
    2: 'Retaining recent blocks is caching and predicting branches is a CPU feature; neither describes wide paths or interleaving.',
    3: 'Neither technique changes the CPU clock; both help memory keep up with a CPU that already outpaces it.' } },
  'C8-022': { concept: 'cache-locality', whyNot: {
    1: 'Fetching one cache line brings neighboring array elements along, so the next accesses in the scan are likely hits.' } },
  'C8-023': { concept: 'cache-performance-math', whyNot: {
    0: '8% is the miss ratio, 80 ÷ 1,000; the hit ratio counts the 920 hits.',
    1: '90% echoes the “commonly 90% and above” figure; compute the actual ratio, 920 ÷ 1,000.',
    3: '108.7% divides requests by hits, 1,000 ÷ 920; the ratio is hits over requests, which can’t exceed 100%.' } },
  'C8-024': { concept: 'cache-performance-math', whyNot: {
    0: '5 ns counts only the miss share, 0.10 × 50; the 2 ns lookup applies to every access, including misses.',
    2: '45 ns weights the penalty by the hit rate, 0.90 × 50; only the 10% of misses pay the penalty.',
    3: '52 ns is the cost of a single miss, 2 + 50; most accesses hit, so the average is far lower.' },
    verify: [0, 2, 3], note: 'The sources define hit ratio but give no average-access-time formula; derived from the question’s stated assumptions.' },
  'C8-025': { concept: 'cache-lookup', whyNot: {
    1: 'The controller checks tags to see whether a requested location is in cache; each tag points to its main-memory location.' } },
  'C8-026': { concept: 'cache-write-policy', whyNot: {
    1: 'Write-back holds changed data in cache until the line is replaced, so main memory can be stale until then.' } },
  'C8-027': { concept: 'cache-hierarchy', whyNot: {
    0: 'Two levels exist to trade speed for size: a small fast L1 handles frequent hits while a larger L2 holds more blocks.' },
    verify: [0], note: 'Slide 22 asks why the cache sizes differ, but the exported text gives no answer; rationale from general knowledge.' },
  'C8-028': { concept: 'multiprocessor-configurations', whyNot: {
    0: 'In SMP each CPU picks its own work using a standard algorithm; no single CPU schedules the others.',
    2: 'Superscalar execution runs several instructions inside one core; it isn’t a way to organize multiple CPUs.',
    3: 'Interleaving spreads addresses across memory banks; it has nothing to do with assigning work to CPUs.' } },
  'C8-029': { concept: 'multiprocessor-configurations', whyNot: {
    1: 'Equal access is SMP’s defining trait; its listed drawback is conflicts over shared memory and I/O, not unequal access.' } },
  'C8-030': { concept: 'multicore', whyNot: {
    1: 'One core running several hardware threads is multithreading; multicore means several distinct cores on the chip.',
    2: 'Separate packages in separate sockets is the multiprocessor setup multicore is contrasted with, not multicore itself.',
    3: 'One unit doing everything sequentially describes a simple single CPU, the opposite of having multiple cores.' },
    verify: [1], note: 'Hardware multithreading within one core isn’t described in the Ch 8 sources; rationale from general knowledge.' },
  'C8-031': { concept: 'multiprocessor-configurations', whyNot: {
    0: 'Replicas only run tasks the primary assigns; with the primary gone nothing schedules them, so the entire system fails.' } },
  'C8-032': { concept: 'multiprocessor-scaling', whyNot: {
    1: 'Threads are independent program segments; a dependency between every pair isn’t what slows cores sharing one bus.',
    2: 'A disk controller doesn’t decode instructions; the bottleneck here is cores waiting on the shared memory bus.',
    3: 'Program counter width limits addressable memory, not bus throughput; adding cores doesn’t change address bits.' } },
};
