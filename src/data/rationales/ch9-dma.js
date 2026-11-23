// Chapter 9 DMA: the worked example from the design audit, written first to prove the wrong-answer flow.
// whyNot keys are canonical choice indexes (the order in the bank, not the shuffled display order).
// Each sentence names the misconception behind that specific option. Sources: Ch 9 slides 25–27, Assignment 9 Q28, Q34, Q35.
export const ch9DmaRationales = {
  'C9-003': { concept: 'dma-cpu-role', whyNot: {
    0: 'Setup only tells the controller what to move; the controller, not the CPU, copies the block into memory.' } },
  'C9-019': { concept: 'dma-cpu-role', whyNot: {
    0: 'DMA removes the per-word copying, not the CPU’s role: the CPU still sets up the transfer and is notified when it ends.' } },
  'C9-004': { concept: 'dma-completion', whyNot: {
    1: 'The starting address was supplied during setup, before the transfer began, so it is not requested afterward.',
    2: 'Copying the block again would defeat DMA; the controller has already placed it in memory.',
    3: 'Direction is part of the setup the CPU provides before the transfer starts, not after the block arrives.' } },
  'C9-018': { concept: 'dma-setup', whyNot: {
    1: 'Without a memory start address the controller has nowhere to put the block.',
    2: 'The controller must also know which device block to read and that data moves from device to memory.',
    3: 'An interrupt vector only routes the completion signal; it does not describe which block to move or where.' } },
  'C9-020': { concept: 'dma-arbitration', whyNot: {
    1: 'Longer blocks make overlap more likely; overlap is the conflict, not a way to coordinate access.',
    2: 'Uncoordinated use of the same address is exactly the conflict that arbitration exists to prevent.',
    3: 'A signal after the conflicting writes comes too late; access must be coordinated before both use the resource.' } },
  'C9-021': { concept: 'dma-address-range', whyNot: {
    1: '4608 is the first byte after the block; the last byte is start + count − 1.',
    2: '512 is the byte count, not an address; add it to the start address and subtract one.',
    3: '4095 is the byte just before the start; the block runs forward from 4096.' } },
};
