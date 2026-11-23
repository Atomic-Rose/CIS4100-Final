// Drafted distractor rationales for Chapter 10. whyNot keys are canonical choice indexes, not display order.
// Drafted from sources/ch10-slides.txt and sources/ch10-assignment.txt; entries in `verify` need a source check.
export const ch10Rationales = {
  'C10-001': { concept: 'flash-endurance', whyNot: {
    0: 'Nonvolatile means data survives power loss, not that cells survive unlimited writes; wear-leveling exists because program/erase cycles wear cells out.' } },
  'C10-002': { concept: 'disk-access-components', whyNot: {
    0: 'Seek time moves the head to the right track; the wait for the sector to come around happens after the seek.',
    1: 'Transfer time starts once the sector is under the head; it covers moving the data, not waiting for it to arrive.',
    3: 'Controller overhead is electronic processing, not the mechanical wait for the platter to rotate the sector under the head.' } },
  'C10-003': { concept: 'cav-clv', whyNot: {
    1: 'Holding RPM fixed is the definition of CAV; it is CLV that changes spin speed as the head moves between tracks.' } },
  'C10-004': { concept: 'disk-capacity-calc', whyNot: {
    0: '0.512 GB is one surface’s capacity; the 4 recording surfaces were left out of the product.',
    2: '4.096 GB doubles the correct result, as if there were 8 surfaces or 1024-byte sectors.',
    3: '8.192 GB is four times the correct result, as if the surface count were multiplied in twice.' } },
  'C10-005': { concept: 'raid-redundancy-levels', whyNot: {
    0: 'RAID 0 only stripes for speed; with no mirror or parity, the blocks on a failed member have no second source.' } },
  'C10-006': { concept: 'raid-mirroring', whyNot: {
    0: 'Reading the same block from every drive just repeats work; the gain comes from fetching different blocks at once.',
    1: 'Parity reconstruction belongs to striped-with-parity arrays; a mirror already holds complete copies and needs no rebuild to read.',
    2: 'If every drive had to finish the whole request, there would be no division of work and no speedup.' } },
  'C10-007': { concept: 'emissive-vs-backlit-display', whyNot: {
    1: 'Needing a backlight is the LCD model, where cells only filter light; OLED pixels are LEDs that produce their own light.' } },
  'C10-008': { concept: 'cav-clv', whyNot: {
    1: 'Inner tracks have a smaller circumference, so keeping the same linear speed there needs more revolutions per second, not fewer.' } },
  'C10-009': { concept: 'storage-hierarchy', whyNot: {
    1: 'DVD and tape are offline secondary storage that is loaded when needed, the opposite end of the hierarchy from primary memory.',
    2: 'SSDs and hard disks are nonvolatile online secondary storage; their data must be copied into primary memory for CPU use.',
    3: 'USB drives and network archives are offline or network storage, which are peripherals rather than primary memory.' } },
  'C10-010': { concept: 'access-time-vs-transfer-rate', whyNot: {
    0: 'Access time is a delay to locate data, while transfer rate is data moved per second; one is time, the other throughput.' } },
  'C10-011': { concept: 'flash-endurance', whyNot: {
    1: 'Hammering one cell is exactly the wear pattern wear-leveling avoids; it would exhaust that cell’s endurance first.',
    2: 'Refresh keeps DRAM charge alive while powered; flash is nonvolatile, and its problem is write wear, not charge leakage.',
    3: 'Holding the only copy in volatile cache risks losing data at power-off and does nothing to spread wear across cells.' },
    verify: [2, 3], note: 'DRAM refresh and volatile write caching are not covered in the Chapter 10 slides; rationale relies on general knowledge.' },
  'C10-012': { concept: 'ssd-vs-hdd', whyNot: {
    1: 'Seek and rotational delays come from a moving head and spinning platter; an SSD is electronic and has neither.' } },
  'C10-013': { concept: 'disk-geometry', whyNot: {
    1: 'All sectors along one track on one surface is just a track; a cylinder stacks that track across every surface.',
    2: 'What passes under the head in one revolution is a single track’s contents, not the aligned tracks on other surfaces.',
    3: 'All tracks on one surface is the whole platter face; a cylinder takes one track position across surfaces instead.' } },
  'C10-014': { concept: 'zone-bit-recording', whyNot: {
    1: 'The surface count is fixed by the drive’s physical platters; zones divide tracks on each surface, not the number of surfaces.',
    2: 'A byte is always 8 bits; zones change how many sectors fit on a track, not the size of a byte.',
    3: 'ZBR is also called zone-CAV: the disk keeps spinning at the same speed, and buffering evens out the data rate.' } },
  'C10-015': { concept: 'zone-bit-recording', whyNot: {
    0: 'Equal sectors holds only within a zone; extending that rule to the whole disk describes plain CAV, which ZBR improves on.' } },
  'C10-016': { concept: 'rotational-timing', whyNot: {
    1: '8.33 ms is one full revolution; on average the sector is only half a turn away, so halve it.',
    2: '16.67 ms is two revolutions, which comes from doubling the rotation time instead of halving it.',
    3: '120 is rotations per second (7200 ÷ 60), not a time; invert it to get milliseconds per rotation.' } },
  'C10-017': { concept: 'rotational-timing', whyNot: {
    1: '100 μs is double the answer, as if the revolution were divided among 100 sectors instead of 200.',
    2: '5 ms is half a revolution, the average rotational latency, not the time for one sector to pass the head.',
    3: '10 ms is one full revolution, the time to read the whole track; divide it by the 200 sectors.' } },
  'C10-018': { concept: 'disk-access-components', whyNot: {
    0: '2.5 ms comes from subtracting latency (6 − 4 + 0.5); every component is a separate delay that adds to the total.',
    1: '6 ms counts only the seek; the head must still wait for the sector and then transfer the data.',
    2: '10 ms adds seek and latency but drops the 0.5 ms transfer, which is also part of the access.' } },
  'C10-019': { concept: 'disk-capacity-calc', whyNot: {
    0: 'About 916 comes from dividing by 2^30, which gives GiB; decimal GB divides by 10^9.',
    1: '245.76 GB is a single surface; multiply by all 4 recording surfaces.',
    3: '3932.16 GB is four times too large, as if the 4 surfaces were multiplied in twice.' } },
  'C10-020': { concept: 'raid-redundancy-levels', whyNot: {
    1: 'RAID 1 is the mirrored array; its duplicate copies are redundancy, the opposite of “no redundancy.”',
    2: 'RAID 5 stripes but adds parity, which is recovery information that lets it rebuild a failed member.',
    3: 'RAID 6 stripes with two different parity checks, giving more redundancy, not none.' } },
  'C10-021': { concept: 'raid-mirroring', whyNot: {
    0: 'Adding 2 TB + 2 TB treats the mirror as holding different data, but both drives store the same blocks.' } },
  'C10-022': { concept: 'raid-redundancy-levels', whyNot: {
    1: 'Mirrored copies without parity describe RAID 1; RAID 6 still stripes data and protects it with parity.',
    2: 'Striping with no recovery information is RAID 0, which offers no fault tolerance at all.',
    3: 'Keeping a whole unstriped file on one drive is not a RAID level; RAID 5 and 6 both stripe data across drives.' } },
  'C10-023': { concept: 'raid-mirroring', whyNot: {
    1: 'Splitting writes across members is striping; a mirror only provides redundancy if every copy receives the same data.' } },
  'C10-024': { concept: 'optical-media', whyNot: {
    0: '16 bytes is only the header; the 288 error-control bytes are overhead too.',
    1: '288 bytes is only the error-control field; the 16-byte header also counts as overhead.',
    3: '4400 adds the two sizes (2352 + 2048); overhead is the difference, total minus data.' } },
  'C10-025': { concept: 'optical-media', whyNot: {
    1: 'A shorter wavelength focuses to a smaller spot, allowing smaller pits; that is why DVD holds more than CD.' } },
  'C10-026': { concept: 'tape-sequential-access', whyNot: {
    1: 'Small random updates need direct access; tape is sequential and must wind to each location.',
    2: 'Paging demands quick random access, but tape is offline sequential storage with long positioning delays.',
    3: 'Executable instructions must come from primary memory; tape’s sequential, offline access is the slowest fit.' } },
  'C10-027': { concept: 'image-memory-size', whyNot: {
    1: '5000 is just the pixel count (100 × 50); each pixel still needs 4 bits, then divide by 8.',
    2: '20,000 is the size in bits; divide by 8 to convert to bytes.',
    3: '40,000 is 100 × 50 × 8, using 8 bits per pixel instead of 4 and never converting bits to bytes.' } },
  'C10-028': { concept: 'pixel-color-depth', whyNot: {
    0: '256 counts the levels of only one channel; the three channels combine independently.',
    1: '768 adds 256 + 256 + 256, but each channel’s level can pair with every level of the others, so multiply.',
    2: '65,536 is 2^16, covering only two 8-bit channels; the third channel multiplies by another 256.' } },
  'C10-029': { concept: 'aspect-ratio', whyNot: {
    1: 'Aspect ratio is width over height; 16/9 ≈ 1.78 exceeds 4/3 ≈ 1.33, so the screen is relatively wider.' } },
  'C10-030': { concept: 'lcd-matrix-addressing', whyNot: {
    1: 'One switch for the whole panel could not control cells individually; active matrix uses one transistor per cell.',
    2: 'Row and column switching that lights cells in succession describes passive matrix, which is the dimmer design.',
    3: 'Self-emitting pixels describe OLED; an active-matrix LCD still uses liquid crystals to control backlight.' } },
  'C10-031': { concept: 'emissive-vs-backlit-display', whyNot: {
    1: 'Liquid crystals do not glow; they twist polarized backlight so filters pass more or less of it.' } },
  'C10-032': { concept: 'gpu-parallelism', whyNot: {
    1: 'A GPU wins on total parallel throughput, not on each single instruction; a CPU core can still run one instruction faster.',
    2: 'Pixel work is highly repetitive and independent, which makes it parallel; that is exactly what the GPU exploits.',
    3: 'The rendered image must still be moved to video memory and the display; the GPU speeds computation, not removes data movement.' },
    verify: [1, 3], note: 'Slides only say GPUs maximize operations through parallelization; per-instruction speed and display data movement are general knowledge.' },
  'C10-033': { concept: 'printer-technologies', whyNot: {
    1: 'Charging and exposing the drum only creates the electrostatic image; no toner has reached the paper yet.',
    2: 'Toner sticks to the drum’s charged spots here, but it is still on the drum, not bonded to paper.',
    3: 'After transfer the toner sits loosely on the paper; only the heated fuser melts it into place.' } },
  'C10-034': { concept: 'printer-technologies', whyNot: {
    0: 'Extruding a hardening material in layers is how a 3D printer works; inkjets squirt ink and lasers fuse toner.' } },
  'C10-035': { concept: 'optical-id-codes', whyNot: {
    1: 'Widening a single row of bars is still a one-dimensional code; QR adds a second dimension of data.',
    2: 'QR codes are read optically by a camera; magnetic storage is how a magnetic stripe card works.',
    3: 'A QR code is one two-dimensional grid decoded as a whole, not a stack of separate barcodes read column by column.' },
    verify: [3], note: 'Slides and Assignment Q36 describe QR as a 2-D grid but do not explicitly rule out stacked 1-D codes; general knowledge.' },
  'C10-036': { concept: 'optical-id-codes', whyNot: {
    0: 'Line-of-sight scanning of bars describes barcode readers; RFID, Radio Frequency Identification, reads tags by radio.' } },
  'C10-037': { concept: 'network-interface', whyNot: {
    1: 'Both halves hold: the NIC is the network I/O controller, and MAC protocols define the local network’s communication rules.' } },
  'C10-038': { concept: 'disk-formatting', whyNot: {
    1: 'Formatting does not add physical media; it lays out track positions, blocks, and headers before the disk is used.' } },
};
