// Drafted distractor rationales for Chapter 11. whyNot keys are canonical choice indexes, not display order.
// Drafted from sources/ch11-slides.txt and sources/ch11-assignment.txt; entries in `verify` need a source check.
export const ch11Rationales = {
  'C11-001': { concept: 'bus-hierarchy-purpose', whyNot: {
    1: 'The hierarchy exists precisely because one path does not suit every device; fast CPU-memory traffic and slower peripherals get different buses.' },
    verify: [1], note: 'Slide 15 lists the processor, memory, and I/O buses; the bandwidth/latency framing is inferred, not stated in the slide text.' },
  'C11-002': { concept: 'pcie-lanes', whyNot: {
    0: 'That describes the older parallel PCI bus; a PCIe lane is serial and point-to-point.',
    2: 'A lane has two simplex pairs, one per direction, so it can send and receive at the same time rather than taking turns.',
    3: 'Lanes connect the CPU or chipset to peripheral controllers; they are not a cache-coherence path between memory banks.' } },
  'C11-003': { concept: 'usb-hubs', whyNot: {
    1: 'A hub adds downstream ports but still reaches the host over one upstream link, so its devices share that link.' },
    verify: [1], note: 'Slide 19 says hubs provide connection points; sharing upstream bandwidth comes from general knowledge, not the slide text.' },
  'C11-004': { concept: 'channel-control-words', whyNot: {
    0: 'The main CPU’s arithmetic opcodes run application work; the channel has its own I/O program that it executes separately.',
    1: 'Cache tags identify cached memory blocks; they are not instructions and do not direct an I/O transfer.',
    3: 'Saved interrupt context preserves a program’s state while it is interrupted; it is data, not an I/O program to execute.' } },
  'C11-005': { concept: 'channel-offload', whyNot: {
    0: 'Channel control words move data between memory and the device using DMA, so the data goes to memory, not CPU registers.' } },
  'C11-006': { concept: 'northbridge-southbridge', whyNot: {
    0: 'This swaps the roles: the southbridge serves the slower ports, and neither bridge exists to fetch instructions.',
    1: 'The two bridges were split precisely because they serve different traffic; only the northbridge is the memory path.',
    2: 'Bridges route traffic between buses; registers live in the CPU and instructions in memory, not in either bridge.' } },
  'C11-007': { concept: 'pcie-link-width', whyNot: {
    0: 'The “x4” counts lanes; four lanes at the same rate add capacity, but no single lane becomes four times faster.' } },
  'C11-008': { concept: 'shared-system-roles', whyNot: {
    1: 'Slide 3 asks what these very different systems have in common, and the answer is exactly components, controllers, and interconnections.' } },
  'C11-009': { concept: 'system-interface-components', whyNot: {
    1: 'These are all parts inside the CPU, so the list leaves out memory, peripherals, controllers, and the buses joining them.',
    2: 'This lists only connection hardware and software, leaving out the CPU and memory that those connections must serve.',
    3: 'Instruction formats and opcodes describe how the CPU is programmed, not physical participants connected by buses.' } },
  'C11-010': { concept: 'motherboard-backplane', whyNot: {
    1: 'The motherboard is defined as the printed circuit board that holds the CPU and related components, including the backplane.' } },
  'C11-011': { concept: 'northbridge-southbridge', whyNot: {
    1: 'USB is an I/O bus for external peripherals, reached through the southbridge, not the processor-memory path.',
    2: 'SATA links the disk controller to drives; it is an I/O bus, not the path between processor and memory.',
    3: 'A printer’s device-side interface connects only that peripheral to its controller, far from the processor-memory path.' } },
  'C11-012': { concept: 'shared-system-roles', whyNot: {
    0: 'Sharing the same component roles does not mean sharing a layout; slides 4–6 show each system arranged differently.' } },
  'C11-013': { concept: 'device-driver-vs-controller', whyNot: {
    1: 'A device controller is hardware attached to the device; the driver is the software that tells it what to do.',
    2: 'A bus interface circuit is physical hardware joining the device to the bus, not a program.',
    3: 'A DMA engine is hardware that moves the block itself; software only sets it up.' } },
  'C11-014': { concept: 'pcie-lanes', whyNot: {
    1: 'Each lane has two simplex line pairs, one for each direction, so sending and receiving use separate paths.' } },
  'C11-015': { concept: 'pcie-link-width', whyNot: {
    0: '2 is the smaller link’s lane count, not the ratio; divide eight lanes by two lanes.',
    2: '8 is the x8 link’s lane count alone; compare it with the two lanes of x2.',
    3: '16 multiplies the widths (8 × 2) instead of dividing them to get the ratio.' } },
  'C11-016': { concept: 'pcie-lanes', whyNot: {
    0: 'That describes the older parallel PCI bus; PCIe sends bits serially over point-to-point lanes.' } },
  'C11-017': { concept: 'pcie-link-width', whyNot: {
    0: '1 GB/s is one lane’s rate; an x4 link combines four lanes.',
    1: '2 GB/s treats the link as two lanes, or splits the rate between directions, but x4 means four lanes each way.',
    3: '8 GB/s adds both directions together; the question asks for one direction only.' } },
  'C11-018': { concept: 'usb-hubs', whyNot: {
    0: 'More ports are not more upstream capacity; devices behind a hub share its one connection to the host.' },
    verify: [0], note: 'Slide 19 only says hubs provide connection points; shared upstream bandwidth is general knowledge.' },
  'C11-019': { concept: 'usb-hubs', whyNot: {
    1: 'A hub adds ports, not upstream capacity; attached devices share the hub’s single link toward the host.',
    2: 'A hub only fans out connections; the host still schedules USB transfers, including isochronous ones.',
    3: 'Turning CPU loads into memory data is the CPU and memory system’s job; a USB hub only connects peripherals.' },
    verify: [1, 2], note: 'Shared upstream bandwidth and host-side scheduling are general USB knowledge; slide 19 and Assignment Q28 only imply them.' },
  'C11-020': { concept: 'usb-device-limit', whyNot: {
    0: '16 is a familiar PCIe slot width (x16), not the USB device limit given on slide 19.',
    1: '32 is the number of PCIe lanes in slide 18’s bundle, not the USB device count.',
    3: '512 is a familiar block or sector size from storage examples, not the USB device limit.' },
    verify: [0, 3], note: 'x16 and 512-byte blocks are not in the Ch 11 slides; these distractor origins are guessed associations.' },
  'C11-021': { concept: 'isochronous-transfer', whyNot: {
    1: 'Slide 21 defines isochronous as delivery at regular time intervals, which is exactly what scheduled timing means.' } },
  'C11-022': { concept: 'usb4-thunderbolt-topology', whyNot: {
    1: 'USB4 is a multipoint bus that supports hubs, so it is not limited to one point-to-point device.',
    2: 'USB4 is a serial bus that uses a packet protocol, not parallel transfers.',
    3: 'USB4 lets devices be added and removed without powering down; shutdown is not required.' } },
  'C11-023': { concept: 'usb4-thunderbolt-topology', whyNot: {
    1: 'Slide 20 does give six daisy-chained devices for its Thunderbolt example; the caution is only that it is historical.' } },
  'C11-024': { concept: 'isochronous-transfer', whyNot: {
    1: 'Peak rate says how fast data can move, not when it arrives; even spacing needs isochronous scheduling.',
    2: 'Serial buses carry streams fine; slide 20 calls serial Thunderbolt suitable for high-definition video.',
    3: 'Bigger packets move more data per transfer but say nothing about arriving at regular times before playback needs it.' },
    verify: [3], note: 'Slides do not discuss packet size; this rationale relies on general reasoning about timing versus throughput.' },
  'C11-025': { concept: 'channel-offload', whyNot: {
    1: 'The channel subsystem is a separate I/O processor that runs its own channel control words independently of the CPU.' } },
  'C11-026': { concept: 'channel-offload', whyNot: {
    1: 'Recopying every word would undo the offload; the channel moves the data to memory with DMA.',
    2: 'Channel programs move data between memory and devices; they do not swap memory access for register transfers.',
    3: 'The channel is a separate I/O processor that runs its own program, not just a device that raises requests.' } },
  'C11-027': { concept: 'channel-control-words', whyNot: {
    0: 'Instruction-like does not mean application CPU: channel control words are the channel’s own I/O program.' } },
  'C11-028': { concept: 'interface-bus-names', whyNot: {
    1: 'SRAM is a memory technology, not an interface bus, even though it sits beside real bus names.',
    2: 'DRAM is main-memory technology, not one of the interface buses that connect peripherals.',
    3: 'SIMD describes a way of executing instructions on many data items, not a bus that connects devices.' },
    verify: [1, 2, 3], note: 'Slide 16 lists only the buses; identifying SRAM/DRAM as memory and SIMD as an execution model is from other chapters/general knowledge.' },
  'C11-029': { concept: 'bus-hierarchy-purpose', whyNot: {
    0: 'A fast CPU still waits for memory and I/O; system speed depends on the slowest part of the path a task needs.' },
    verify: [0], note: 'The bottleneck idea is not stated in the Ch 11 slide text; it is general performance reasoning.' },
  'C11-030': { concept: 'bits-to-bytes', whyNot: {
    1: '10 GB/s forgets to convert: the rate is 10 gigabits, and eight bits make one byte.',
    2: '80 GB/s multiplies by 8; going from bits to bytes means dividing by 8.',
    3: '0.125 GB/s is the conversion for 1 Gb/s; this question starts from 10 Gb/s.' } },
  'C11-031': { concept: 'channel-hierarchy', whyNot: {
    1: 'Slide 22 states that subchannels connect to a control unit module through one or more channel paths.' } },
  'C11-032': { concept: 'bus-hierarchy-purpose', whyNot: {
    1: 'Putting everything on the slowest shared path is the bottleneck a hierarchy is designed to avoid.',
    2: 'Connector count says how many devices fit, not whether a path has the speed and timing a device needs.',
    3: 'Memory traffic is the most speed-critical, so it gets the most direct path rather than passing through external controllers.' },
    verify: [1, 2, 3], note: 'Slide 15 gives the bus hierarchy, but the bandwidth/latency matching principle is inferred rather than stated.' },
  'C11-033': { concept: 'haswell-integration', whyNot: {
    1: 'Haswell integrates memory control on the processor; a southbridge handles peripheral I/O, not the path to memory.',
    2: 'PCIe connects peripheral controllers, not main memory, so it does not sit between the system agent and RAM.',
    3: 'A USB host controller serves external peripherals and plays no part in the system agent’s memory path.' },
    verify: [1, 2, 3], note: 'The Haswell diagram (slide 14) is an image not in the text export; check placement against the diagram.' },
  'C11-034': { concept: 'haswell-integration', whyNot: {
    1: 'The Haswell example does join cores, cache, GPU, and system agent around a ring; just don’t treat it as universal.' },
    verify: [1], note: 'Ring bus detail comes from the slide 14 diagram, which is not in the text export.' },
  'C11-035': { concept: 'interface-bus-names', whyNot: {
    1: 'A display connects through the graphics path, not SATA; SATA is the storage interface to the disk controller.',
    2: 'USB hubs and keyboards connect through the USB controller, a separate interface from SATA.',
    3: 'Cache and main memory are on the CPU-memory side of the system, not peripherals on a disk controller.' },
    verify: [1, 2], note: 'Assignment Q27 supports SATA for disk storage; the display and USB paths come from the slide 13 diagram, not in the text export.' },
  'C11-036': { concept: 'cpu-memory-io-pathway', whyNot: {
    1: 'The pathway links the I/O module to memory as well as to the CPU, which is what lets DMA skip CPU registers.' },
    verify: [1], note: 'Slide 12’s pathway diagram is an image not in the text export; the direct I/O-memory link needs a diagram check.' },
  'C11-037': { concept: 'channel-hierarchy', whyNot: {
    1: 'The device is at the far end: the channel path leads to the control unit, which then serves the device.',
    2: 'The CPU accumulator belongs to the CPU side; the channel hierarchy begins at the channel subsystem, not a control unit.',
    3: 'The CPU instruction register is not on the device side; the order runs from channel subsystem outward to the device.' } },
};
