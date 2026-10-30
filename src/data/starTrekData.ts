export interface StarTrekCanonItem {
  id: string;
  category: 'species' | 'starships' | 'technology' | 'protocols' | 'worlds';
  title: string;
  designation?: string;
  affiliation?: string;
  starTrekLore: string;
  realScienceFact: string;
  isFictional: boolean; // Flag to clearly distinguish canon vs real
  technicalSpecs: { label: string; value: string }[];
  keyHistoricalMilestone?: string;
}

export const STAR_TREK_CANON_DATABASE: StarTrekCanonItem[] = [
  // --- STAR TREK TECHNOLOGIES ---
  {
    id: 'tech-warp-drive',
    category: 'technology',
    title: 'Warp Drive & Subspace Displacement',
    designation: 'Cochrane Propulsion System',
    affiliation: 'United Federation of Planets',
    isFictional: true,
    starTrekLore: 'Warp drive uses matter-antimatter annihilation regulated by dilithium crystals to power twin nacelle coils. These coils generate an asymmetrical multi-layered subspace field (warp bubble) that contracts spacetime ahead of the ship and expands it behind, allowing speeds far exceeding light (Warp 9.6 ≈ 1,909c) without time dilation.',
    realScienceFact: 'REAL SCIENCE: Einstein\'s Special Relativity strictly forbids acceleration past c within flat spacetime. However, in 1994, physicist Miguel Alcubierre formulated a solution in General Relativity where a bubble of flat spacetime moves superluminally by warping surrounding spacetime geometry. Real Alcubierre drives require negative energy density (exotic matter) and immense energy, though modern modified metrics (Lentz, Bobrick-Martire) study sub-light and positive-energy soliton configurations.',
    technicalSpecs: [
      { label: 'Canonical Speed', value: 'Warp Factor 1 (c) to Warp 9.975 (3,053c)' },
      { label: 'Core Reaction', value: 'Deuterium + Antideuterium Annihilation' },
      { label: 'Real Theoretical Model', value: 'Alcubierre Spacetime Metric (1994)' },
      { label: 'Scientific Status', value: 'Theoretically allowed in GR; requires exotic matter' },
    ],
    keyHistoricalMilestone: 'First Human Warp Flight: April 5, 2063 (Phoenix, piloted by Zefram Cochrane).',
  },
  {
    id: 'tech-transporters',
    category: 'technology',
    title: 'Matter-Energy Transporters',
    designation: 'Annular Confinement Beam (ACB) System',
    affiliation: 'Starfleet Division of Engineering',
    isFictional: true,
    starTrekLore: 'Transporters scan an object at the subatomic quantum level, convert matter into a phased matter-energy stream, store it temporarily in a pattern buffer, and transmit it along an Annular Confinement Beam to a remote site for molecular reassembly. Heisenberg Compensators resolve quantum indeterminacy.',
    realScienceFact: 'REAL SCIENCE: Real quantum teleportation (Nobel Prize in Physics 2022) teleports quantum information/states across entangled photons and atoms, not macroscopic biological matter. The Heisenberg Uncertainty Principle (Δx · Δp ≥ ℏ/2) mathematically limits precision in measuring simultaneous position and momentum. Storing a 70 kg human body\'s quantum state would require ~10²⁸ bits—far exceeding all digital data on Earth today.',
    technicalSpecs: [
      { label: 'Standard Range', value: '40,000 Kilometers' },
      { label: 'Critical Subsystem', value: 'Heisenberg Compensator & Bio-Filters' },
      { label: 'Real Counterpart', value: 'Quantum State Teleportation (Aspect, Zeilinger)' },
      { label: 'Scientific Status', value: 'Fictional macroscopic execution; quantum state info real' },
    ],
    keyHistoricalMilestone: 'Transporter invention by Emory Erickson (early 22nd century).',
  },
  {
    id: 'tech-replicators',
    category: 'technology',
    title: 'Molecular Replicators',
    designation: 'Matter-Energy Synthesis Terminal',
    affiliation: 'Starfleet / Civilian Infrastructure',
    isFictional: true,
    starTrekLore: 'Replicators dematerialize bulk raw feedstock matter and restructure it at the molecular level into food, clothing, medical supplies, and spare parts according to digital blueprints stored in the computer database.',
    realScienceFact: 'REAL SCIENCE: True atomic manipulation is performed using Scanning Tunneling Microscopes (STM) and atomic force microscopy (e.g. IBM\'s "A Boy and His Atom"). Real-world additive manufacturing uses 3D molecular printing and polymer/metal deposition. Total molecular reconfiguration of bulk matter into gourmet meals requires unfeasible energy to break covalent bonds and reassemble complex proteins without thermal decay.',
    technicalSpecs: [
      { label: 'Resolution', value: 'Molecular level (lower than transporter quantum)' },
      { label: 'Energy Requirement', value: 'High EPS power taps from warp/impulse' },
      { label: 'Real Counterpart', value: 'Atomic Force Microscopy & Precision 3D Bio-Printing' },
      { label: 'Scientific Status', value: 'Thermodynamically prohibitive at scale; molecular 3D printing exists' },
    ],
    keyHistoricalMilestone: 'Replaced protein resequencers by the 24th century.',
  },
  {
    id: 'tech-holodecks',
    category: 'technology',
    title: 'Holodecks & Holographic Simulation',
    designation: 'Omni-Directional Holographic Environment',
    affiliation: 'Galaxy-Class Recreation & Research',
    isFictional: true,
    starTrekLore: 'Holodecks combine stereoscopic light projection, shaped magnetic forcefields (giving light tangible physical substance), localized replicators for edible matter, and omni-directional treadmills to produce indistinguishable simulated environments.',
    realScienceFact: 'REAL SCIENCE: Modern spatial computing, virtual reality (VR) headsets, and acoustic/ultrasound levitation can project images and mid-air tactile sensations. True "hard-light" forcefields do not exist, though optical tweezers (Arthur Ashkin, Nobel Prize 2018) use focused laser beams to physically manipulate microscopic biological cells.',
    technicalSpecs: [
      { label: 'Subsystems', value: 'Magnetic forcefield projectors, photon emitters, omni-treads' },
      { label: 'Safeties', value: 'Holodeck Safety Protocols (can fail during power surges!)' },
      { label: 'Real Counterpart', value: 'VR Haptics, Ultrasound Levitation, Optical Tweezers' },
      { label: 'Scientific Status', value: 'Fictional tactile light; spatial projections exist' },
    ],
    keyHistoricalMilestone: 'Standardized on Galaxy-class starships in 2364.',
  },
  {
    id: 'tech-dilithium',
    category: 'technology',
    title: 'Dilithium Crystals & Reactor Matrix',
    designation: 'Element 87 Subspace Moderator',
    affiliation: 'Interstellar Commerce & Starfleet',
    isFictional: true,
    starTrekLore: 'Dilithium (dilitheum) is a rare crystalline mineral with a non-cubic 4D lattice structure. Under intense electromagnetic and subspace fields, high-energy streams of matter (deuterium) and antimatter (antideuterium) pass through the lattice without touching it directly, regulating the reaction into high-energy electro-plasma.',
    realScienceFact: 'REAL SCIENCE: In the real Periodic Table of Elements, element 87 is Francium (Fr), a highly radioactive, unstable alkali metal with a half-life of 22 minutes, not a crystal. In real physics, controlling antimatter reactions relies on electromagnetic Penning-Malmberg traps, quadrupole magnetic fields, and laser cooling, not minerals.',
    technicalSpecs: [
      { label: 'Periodic Table (Canon)', value: 'Hypothetical 24th Century Element 87 allotrope' },
      { label: 'Real Element 87', value: 'Francium (Fr - radioactive alkali metal)' },
      { label: 'Function', value: 'Antimatter reaction regulation' },
      { label: 'Scientific Status', value: 'Completely fictional mineral' },
    ],
    keyHistoricalMilestone: 'Spock develops method to recrystalize dilithium via gamma radiation (2286).',
  },
  {
    id: 'tech-prime-directive',
    category: 'protocols',
    title: 'The Prime Directive (General Order 1)',
    designation: 'Starfleet Non-Interference Mandate',
    affiliation: 'United Federation of Planets',
    isFictional: true,
    starTrekLore: 'Starfleet General Order 1 prohibits any officer or crew from interfering with the natural development of pre-warp civilizations, regardless of whether that civilization faces imminent natural catastrophe or extinction.',
    realScienceFact: 'REAL SCIENCE: The real-world equivalent is NASA/COSPAR Planetary Protection policy, which mandates that space probes visiting Mars, Europa, or Enceladus be thoroughly sterilized to prevent biological cross-contamination of potential alien ecosystems. In anthropology, ethical guidelines prohibit uncontacted tribes from being disturbed by outside industrialized societies.',
    technicalSpecs: [
      { label: 'Scope', value: 'All pre-warp civilizations & evolutionary tracks' },
      { label: 'Penalty', value: 'Court Martial / Dishonorable Discharge' },
      { label: 'Real-World Policy', value: 'COSPAR Planetary Protection & Anthropological Ethics' },
      { label: 'Scientific Status', value: 'Ethical philosophical doctrine with direct real-world scientific parallels' },
    ],
    keyHistoricalMilestone: 'Ratified by Federation Council upon founding in 2161.',
  },

  // --- STARSHIPS ---
  {
    id: 'ship-enterprise-d',
    category: 'starships',
    title: 'USS Enterprise (NCC-1701-D)',
    designation: 'Galaxy-Class Starship',
    affiliation: 'Starfleet / Federation Flagship',
    isFictional: true,
    starTrekLore: 'Commanded by Captain Jean-Luc Picard, the Enterprise-D is 642.5 meters long, features 42 decks, and carries 1,014 crew members and families. It is equipped with saucer separation capability, 12 Type-X phaser arrays, 2 burst torpedo launchers, and extensive stellar cartography laboratories.',
    realScienceFact: 'REAL SCIENCE: Scaling a space habitat to 642 meters with 1G artificial gravity would require either continuous 9.8 m/s² propulsion (exhausting planetary fuel reserves) or centrifugal rotation (O\'Neill cylinder design). The International Space Station (ISS) is 109 meters wide, orbits at 7.66 km/s, and operates in continuous microgravity.',
    technicalSpecs: [
      { label: 'Length / Beam / Height', value: '642.5 m / 463.7 m / 195.3 m' },
      { label: 'Decks', value: '42 Decks' },
      { label: 'Crew Complement', value: '1,014 (Officers, Crew & Families)' },
      { label: 'Cruising Speed', value: 'Warp 6 (392c); Max Warp 9.6' },
      { label: 'Phaser Output', value: '5.1 MW per emitter segment' },
    ],
    keyHistoricalMilestone: 'Launched 2363 from Utopia Planitia Fleet Yards, Mars.',
  },
  {
    id: 'ship-voyager',
    category: 'starships',
    title: 'USS Voyager (NCC-74656)',
    designation: 'Intrepid-Class Starship',
    affiliation: 'Starfleet Deep Space Explorer',
    isFictional: true,
    starTrekLore: 'Commanded by Captain Kathryn Janeway, Voyager features bio-neural gel packs (organic neural circuits) and variable-geometry warp nacelles designed to prevent damage to subspace. It successfully traversed 70,000 light-years across the Delta Quadrant.',
    realScienceFact: 'REAL SCIENCE: Bio-neural computing mirrors modern organoid intelligence and DNA computing, where biological neural networks or synthesized DNA strands process logical calculations with extreme energy efficiency compared to silicon.',
    technicalSpecs: [
      { label: 'Length', value: '344 Meters, 15 Decks' },
      { label: 'Crew Complement', value: '141 Crew' },
      { label: 'Top Speed', value: 'Warp 9.975 (3,053c)' },
      { label: 'Computer Core', value: 'Isolinear + Bio-Neural Gel Packs' },
    ],
    keyHistoricalMilestone: 'Returned to Earth in 2378 after 7-year Delta Quadrant voyage.',
  },

  // --- SPECIES & CIVILIZATIONS ---
  {
    id: 'species-vulcan',
    category: 'species',
    title: 'Vulcans (Homo sapiens vulcanus)',
    designation: 'Founding Federation Civilization',
    affiliation: 'United Federation of Planets',
    isFictional: true,
    starTrekLore: 'Hailing from planet Vulcan (orbiting 40 Eridani A), Vulcans possess green copper-based hemocyanin blood, a secondary inner eyelid, three-chambered hearts beating at 240 bpm, and supreme devotion to logic (Kolinahr) to suppress volcanic emotions. Famous for the Vulcan Mind Meld.',
    realScienceFact: 'REAL SCIENCE: Green/blue copper-based respiratory blood is real: Earth octopuses, horseshoe crabs, and crustaceans use hemocyanin to bind oxygen in low-temperature, low-oxygen marine environments. Furthermore, 40 Eridani A (Keid) is a real orange dwarf star 16.3 light-years from Earth confirmed to host planets.',
    technicalSpecs: [
      { label: 'Homeworld Star', value: '40 Eridani A (Real Star Keid, 16.3 ly)' },
      { label: 'Blood Chemistry', value: 'Copper-based Hemocyanin (Green)' },
      { label: 'Physical Strength', value: '~3x human baseline (due to higher Vulcan gravity)' },
      { label: 'Philosophical Creed', value: 'IDIC (Infinite Diversity in Infinite Combinations)' },
    ],
    keyHistoricalMilestone: 'First Contact with Earth: April 5, 2063 in Bozeman, Montana.',
  },
  {
    id: 'species-klingon',
    category: 'species',
    title: 'Klingons (Klingon Empire)',
    designation: 'Warrior Culture of Qo\'noS',
    affiliation: 'Klingon High Council / Khitomer Accords',
    isFictional: true,
    starTrekLore: 'Klingons possess biological redundancy known as Brak\'lul: redundant organs including 2 livers, 3 lungs, an 8-chambered heart, and 23 ribs, giving them formidable resilience. Governed by a feudal honor code centered on the teachings of Kahless the Unforgettable.',
    realScienceFact: 'REAL SCIENCE: Biological redundancy is widespread in Earth physiology: humans possess paired kidneys, lungs, and cerebral hemispheres; the liver can regenerate up to 70% of lost tissue. Segmental vertebrae and rib structures evolved from Hox gene replication in early chordates.',
    technicalSpecs: [
      { label: 'Homeworld', value: 'Qo\'noS (Kronos, Beta Quadrant)' },
      { label: 'Anatomical Feature', value: 'Brak\'lul (Organ Redundancy) & Cranial Ridges' },
      { label: 'Flagship Weapon', value: 'Bat\'leth ("Sword of Honor") & Disruptors' },
      { label: 'Language', value: 'tlhIngan Hol (constructed linguistics by Marc Okrand)' },
    ],
    keyHistoricalMilestone: 'Signing of the Khitomer Accords (2293) establishing peace with Starfleet.',
  },
  {
    id: 'species-borg',
    category: 'species',
    title: 'The Borg Collective',
    designation: 'Cybernetic Pseudo-Species',
    affiliation: 'Borg Collective / Delta Quadrant',
    isFictional: true,
    starTrekLore: 'A cybernetic hive mind linked by a subspace transceiver network. The Borg assimilate species and technologies through microscopic nanoprobes, striving for technological and biological perfection. "Resistance is futile."',
    realScienceFact: 'REAL SCIENCE: Brain-computer interfaces (BCIs like Neuralink, Utah Arrays), medical nanorobotics, and collective intelligence in eusocial insects (ants, honeybees) mirror Borg mechanics. Superorganism swarms communicate through biochemical pheromones and vibration signals with no central individual authority.',
    technicalSpecs: [
      { label: 'Vessel Types', value: 'Borg Cube (3,000 m/side), Borg Sphere' },
      { label: 'Assimilation Agent', value: 'Nanoprobes (Microscopic nanorobots)' },
      { label: 'Collective Network', value: 'Subspace viniculum & transwarp conduits' },
      { label: 'Real Counterparts', value: 'Neural Interfaces, Synthetic Nanobots & Hive Swarms' },
    ],
    keyHistoricalMilestone: 'Battle of Wolf 359 (2367) where 39 Starfleet vessels were destroyed.',
  },
];
