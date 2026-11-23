// Drafted distractor rationales for Chapter 9 (DMA questions live in ch9-dma.js). whyNot keys are canonical choice indexes, not display order.
// Drafted from sources/ch9-slides.txt and sources/ch9-assignment.txt; entries in `verify` need a source check.
export const ch9Rationales = {
  'C9-001': { concept: 'programmed-io', whyNot: {
    1: 'Checking a status register is exactly what polling does; it is interrupt-driven I/O where the device signals the CPU instead.' } },
  'C9-002': { concept: 'interrupt-identification', whyNot: {
    0: 'Programmed I/O moves one word per instruction under CPU control; it does not dispatch to handlers from a vector.',
    1: 'Polling finds the requester by checking each device in turn, which is the work a vector makes unnecessary.',
    2: 'DMA is a way to move data blocks, not a way to identify which handler should service an interrupt.' } },
  'C9-005': { concept: 'interrupt-sources', whyNot: {
    1: 'Both alter program flow, but the exception arises from the current instruction while the disk controller signals on its own schedule.' } },
  'C9-006': { concept: 'interrupt-id-bits', whyNot: {
    0: '4 bits give only 2⁴ = 16 patterns, half of the 32 identifiers needed.',
    1: '6 bits give 64 patterns, which works but is more than the minimum, since 2⁵ already equals 32.',
    3: '31 is the highest IRQ number, not a bit count; find the smallest power of two that covers all 32 identifiers.' } },
  'C9-007': { concept: 'bus-topology', whyNot: {
    0: 'Point-to-point means exactly two endpoints; a single path shared by three devices is a multipoint bus.' } },
  'C9-008': { concept: 'interrupt-priority', whyNot: {
    0: 'That treats interrupts as a first-in, first-out queue; priority decides which pending request goes first, and lower ones are held.' } },
  'C9-009': { concept: 'io-controller-role', whyNot: {
    1: 'The interface exists so the CPU does not have to slow to each device’s speed; buffering bridges the gap.',
    2: 'An interrupt only announces an event; the data itself still has to move through the interface or by DMA.',
    3: 'Bursty devices are a reason to add buffering in the interface, not a reason to remove it.' } },
  'C9-010': { concept: 'programmed-io', whyNot: {
    1: 'Moving a block without an instruction per word is what DMA adds; programmed I/O transfers one word per I/O instruction.' } },
  'C9-011': { concept: 'context-save-restore', whyNot: {
    1: 'By the time the handler finishes it has already overwritten registers, so saving afterward preserves the wrong values.',
    2: 'A device address alone loses the program’s registers, and the program resumes where it left off rather than restarting.',
    3: 'Restoring before anything was saved has nothing to restore; saving comes first and restoring comes last.' } },
  'C9-012': { concept: 'context-save-restore', whyNot: {
    0: 'An interrupt suspends the program rather than ending it, so its saved context lets it resume exactly where it left off.' } },
  'C9-013': { concept: 'interrupt-identification', whyNot: {
    1: 'An interrupt line was asserted, so this is not busy-waiting without notification; the device checks happen after the interrupt.',
    2: 'DMA moves blocks of data; it does not explain a handler checking devices to find who raised the interrupt.',
    3: 'With a vector the device identifies itself, so the handler would not need to check devices one by one.' } },
  'C9-014': { concept: 'interrupt-cycle', whyNot: {
    0: 'Bit transfers happen far below the instruction level; the course cycle checks for interrupts once per completed instruction.',
    2: 'Waiting until the program ends would defeat interrupts, which exist so events can be handled mid-program.',
    3: 'The check follows a whole instruction, not each register transfer, and the diagram skips it when interrupts are disabled.' } },
  'C9-015': { concept: 'interrupt-sources', whyNot: {
    1: 'Allocating CPU time is a listed use of interrupts: the timer’s periodic signal lets the OS regain control each quantum.' } },
  'C9-016': { concept: 'interrupt-priority', whyNot: {
    1: 'Priority is more than queue order; a higher-priority interrupt can suspend a running lower-priority handler after saving its context.' } },
  'C9-017': { concept: 'interrupt-priority', whyNot: {
    1: 'L was suspended, not cancelled; its saved context must be restored so it can finish its work.',
    2: 'L is suspended while H runs, so it cannot return first; nested handlers unwind in reverse order.',
    3: 'Restoring context resumes at the point of interruption, not at the program’s first instruction.' } },
  'C9-022': { concept: 'io-controller-role', whyNot: {
    1: 'Buffering and physically controlling the device are core controller functions, which is what frees the CPU for other tasks.' } },
  'C9-023': { concept: 'duplex-modes', whyNot: {
    1: 'One direction only describes simplex, the most limited of the three transmission modes.',
    2: 'Both directions taken in turns is half duplex; full duplex lets traffic flow both ways at once.',
    3: 'Echoing each bit is a protocol acknowledgement scheme, not the direction capability that defines duplex modes.' } },
  'C9-024': { concept: 'duplex-modes', whyNot: {
    0: 'Simultaneous two-way traffic is full duplex; half duplex is bidirectional but only one direction at a time.' } },
  'C9-025': { concept: 'bus-signals', whyNot: {
    1: 'A bus also carries addressing to select locations or devices and control signals to coordinate operations.',
    2: 'Power is carried only sometimes, and data still travels as signals on the bus lines.',
    3: 'Addresses are one of the four kinds of bus signals; data is the most basic thing a bus carries.' } },
  'C9-026': { concept: 'serial-vs-parallel', whyNot: {
    0: 'More wires do not guarantee speed; interference limits parallel rate and length, so serial is often faster in practice.' } },
  'C9-027': { concept: 'bus-throughput', whyNot: {
    1: '50 MB/s treats each transfer as one byte; a 16-bit transfer moves 2 bytes, so multiply 50 million by 2.',
    2: '800 is the rate in megabits per second; divide by 8 to convert bits to bytes.',
    3: '16 is the bus width in bits, not a rate; multiply it by the 50 million transfers each second.' } },
  'C9-028': { concept: 'bus-topology', whyNot: {
    1: 'A switch connects many devices, but each separate link to it still joins only two endpoints, so each is point-to-point.',
    2: 'A dedicated link joining exactly two controllers is the definition of point-to-point, not multipoint.',
    3: 'Private, unconnected buses share nothing, so there is no common path joining multiple points.' } },
  'C9-029': { concept: 'hot-plugging', whyNot: {
    1: 'Staying powered on during insertion or removal is what hot plugging names; plug-and-play describes automatic configuration instead.' },
    verify: [1], note: 'Assignment 9 Q16 accepts “hot-swappable or plug-and-play” as equivalent; the plug-and-play-means-configuration distinction comes from the bank explanation and Ch 11 slide 21, not the Ch 9 sources.' },
  'C9-030': { concept: 'privileged-io', whyNot: {
    1: 'Protection blocks access outside the application’s own region, not to the memory it is permitted to use.',
    2: 'Interrupt handlers service events; protection does not require them to decode every application instruction.',
    3: 'DMA controllers move data; it is the OS that uses privileged programmed I/O instructions to set them up.' } },
  'C9-031': { concept: 'interrupt-id-bits', whyNot: {
    0: '5 bits give 2⁵ = 32 patterns, which runs out before 48; round up to the next power of two.',
    2: '8 bits (256 patterns) work but are not the minimum, since 2⁶ = 64 already covers 48.',
    3: '48 is the number of identifiers, not bits; the bit count is the smallest n with 2ⁿ ≥ 48.' } },
  'C9-032': { concept: 'io-controller-role', whyNot: {
    0: 'The network is external, but the NIC is the computer’s I/O controller for sending and receiving that data.' },
    verify: [0], note: 'Ch 9 sources only expand the acronym (Assignment 9 Q17); NIC-as-I/O-controller rests on Ch 10 slide 48, which is not in the Ch 9 source files.' },
};
