export interface ScienceTopic {
  id: string;
  category: 'astronomy' | 'exoplanets' | 'physics' | 'chemistry' | 'earth_biology' | 'space_exploration';
  title: string;
  subtitle: string;
  realScience: string;
  starTrekCanon?: string;
  keyFacts: { label: string; value: string }[];
  deepDive: string;
  relatedTrekTech?: string;
  tags: string[];
}

export const SCIENCE_DATABASE: ScienceTopic[] = [
  // --- ASTRONOMY & SOLAR SYSTEM ---
  {
    id: 'jupiter-europa',
    category: 'astronomy',
    title: 'Europa & Subsurface Oceans',
    subtitle: 'Jovian Moon with Liquid Water Hypotheses',
    realScience: 'Europa, moon of Jupiter, harbors an ocean containing more liquid water than all Earth oceans combined beneath a 15-25 km ice shell. Tidal flexing from orbital resonance with Io and Ganymede generates internal geothermal heat, making it a primary astrobiology target for NASA Europa Clipper.',
    starTrekCanon: 'In Starfleet Class-M planetary criteria, Europa is classified as Class-P (glacial/cryosphere) harboring potential extremophilic biosignatures prior to Federation terraforming covenants.',
    keyFacts: [
      { label: 'Surface Temperature', value: '-160°C to -220°C' },
      { label: 'Ocean Depth', value: '~60 - 150 km' },
      { label: 'Radiation Environment', value: '540 rem/day (intense)' },
      { label: 'Key Mission', value: 'NASA Europa Clipper (2024)' },
    ],
    deepDive: 'The induced magnetic dipole measured by the Galileo spacecraft confirms a globally continuous saline water layer. Hydrothermal vents on Europa\'s seafloor could support chemosynthetic ecosystems independent of sunlight.',
    relatedTrekTech: 'Sensor arrays tuned to sub-surface neutrino flux and gravimetric tomography.',
    tags: ['Astrobiology', 'Jovian Moons', 'Cryo-Oceans', 'Exobiology'],
  },
  {
    id: 'trappist-1',
    category: 'exoplanets',
    title: 'TRAPPIST-1 Exoplanetary System',
    subtitle: '7 Earth-Sized Terrestrial Worlds',
    realScience: 'Located 39.46 light-years away in Aquarius, TRAPPIST-1 is an ultra-cool red dwarf star orbited by seven Earth-sized rocky planets, three (e, f, g) situated in the circumstellar habitable zone where liquid water could pool.',
    starTrekCanon: 'Starfleet stellar cartography registers the TRAPPIST-1 sector as Sector 004, classified as a pristine multi-system laboratory under Prime Directive observation due to potential proto-evolutionary biomarks.',
    keyFacts: [
      { label: 'Distance from Earth', value: '39.46 Light-Years' },
      { label: 'Habitable Zone Worlds', value: '3 (e, f, g)' },
      { label: 'Star Spectral Class', value: 'M8V Ultra-Cool Dwarf' },
      { label: 'Orbital Period (Planet e)', value: '6.1 Earth Days' },
    ],
    deepDive: 'Because the planets orbit extremely close to their host star, they are likely tidally locked. Atmospheric characterization via transmission spectroscopy by the James Webb Space Telescope (JWST) is testing whether M-dwarf flares strip primordial planetary atmospheres.',
    relatedTrekTech: 'Long-range lateral sensor pallets, atmospheric ionization spectrometers.',
    tags: ['Exoplanets', 'Habitable Zone', 'JWST', 'Red Dwarfs'],
  },
  {
    id: 'black-hole-sagittarius-a',
    category: 'astronomy',
    title: 'Sagittarius A* Supermassive Black Hole',
    subtitle: '4.3 Million Solar Masses at Galactic Center',
    realScience: 'Sagittarius A* sits 26,000 light-years away at the core of the Milky Way. In 2022, the Event Horizon Telescope (EHT) synthesized a radio-interferometric image of its silhouette and photon accretion ring, proving Einstein\'s Kerr metric predictions for spinning black holes.',
    starTrekCanon: 'In 2287, the starship USS Enterprise (NCC-1701-A) navigated the Great Barrier at the galactic core to reach the center, encountering powerful gravimetric shear waves.',
    keyFacts: [
      { label: 'Mass', value: '4.297 × 10⁶ Solar Masses' },
      { label: 'Schwarzschild Radius', value: '~12.7 Million km' },
      { label: 'Distance', value: '26,673 Light-Years' },
      { label: 'Observatory', value: 'Event Horizon Telescope (EHT)' },
    ],
    deepDive: 'Stars in the S-cluster (notably S2) orbit Sag A* at up to 2.5% the speed of light, displaying both gravitational redshift and Schwarzschild precession matching General Relativity.',
    relatedTrekTech: 'Graviton shielding, tachyon detection grids, subspace spatial distortion dampers.',
    tags: ['Relativity', 'Singularities', 'Galactic Core', 'Astrophysics'],
  },
  {
    id: 'antimatter-physics',
    category: 'physics',
    title: 'Antimatter & Annihilation Energetics',
    subtitle: 'E = mc² Matter-Antimatter Reactions',
    realScience: 'Antimatter particles possess equal mass but opposite quantum charges (e.g., antiprotons, positrons). Produced at CERN\'s Antiproton Decelerator, pair annihilation releases 100% of rest mass as pure electromagnetic energy (1.8 × 10¹⁷ J/kg), compared to just 0.7% in hydrogen nuclear fusion.',
    starTrekCanon: 'The Enterprise warp core reacts deuterium and antideuterium in a 1:1 stoichiometric ratio suspended in magnetic containment fields, controlled by non-conductive dilithium crystals to power warp drive and main impulse engines.',
    keyFacts: [
      { label: 'Energy Density', value: '9 × 10¹⁶ J/kg (Annihilation)' },
      { label: 'Real Containment', value: 'Penning-Malmberg Magnetic Traps' },
      { label: 'Natural Sources', value: 'Cosmic Ray Showers, Thunderstorms' },
      { label: 'Current World Production', value: '< 10 Nanograms / year' },
    ],
    deepDive: 'At CERN, the ALPHA and BASE experiments test CPT symmetry and whether antimatter falls downward in Earth\'s gravity with equal acceleration (g). Results in 2023 confirmed antimatter obeys the Weak Equivalence Principle.',
    relatedTrekTech: 'Magnetic intermix chambers, EPS power conduits, warp core ejection system.',
    tags: ['High Energy Physics', 'Antimatter', 'CERN', 'Quantum Field Theory'],
  },
  {
    id: 'quantum-entanglement',
    category: 'physics',
    title: 'Quantum Teleportation & Entanglement',
    subtitle: 'Non-Local Quantum States and Bell Theorems',
    realScience: 'Quantum entanglement links particle wavefunctions such that measuring one instantaneously determines the other across arbitrary distances (Einstein\'s "spooky action"). Real quantum teleportation transfers quantum state information (qubits) using entanglement and classical communication, without moving matter.',
    starTrekCanon: 'Starfleet transporters physically dematerialize biological organisms into energy, buffer the quantum state in a pattern buffer, and reconstruct it using an Annular Confinement Beam (ACB) assisted by fictional "Heisenberg Compensators."',
    keyFacts: [
      { label: 'Nobel Prize (Physics)', value: '2022 (Aspect, Clauser, Zeilinger)' },
      { label: 'No-Cloning Theorem', value: 'Perfect quantum copying is impossible' },
      { label: 'Data for Human Body', value: '~10²⁸ bits of quantum info' },
      { label: 'Real Teleportation Range', value: '1,400+ km (Micius Satellite)' },
    ],
    deepDive: 'Star Trek science consultant Michael Okuda humorously remarked that Heisenberg compensators work "very well, thank you." In real physics, the Heisenberg Uncertainty Principle prevents simultaneous zero-error measurement of position and momentum.',
    relatedTrekTech: 'Molecular imaging scanners, pattern buffers, bio-filters.',
    tags: ['Quantum Mechanics', 'Entanglement', 'Information Theory', 'Optics'],
  },
  // --- EARTH BIOLOGY, SPICES, BIODIVERSITY ---
  {
    id: 'photosynthesis-rubisco',
    category: 'earth_biology',
    title: 'Photosynthetic Biospheres & Rubisco',
    subtitle: 'Earth Flora, Carbon Sequestration & Chemistry',
    realScience: 'Earth’s terrestrial and oceanic flora (chlorophyta, angiosperms) convert solar photons into chemical carbohydrates using Ribulose-1,5-bisphosphate carboxylase-oxygenase (RuBisCO)—the most abundant enzyme on Earth. Earth’s plant kingdom produces ~170 billion tons of biomass annually.',
    starTrekCanon: 'Exobiology officers collect planetary flora specimens for the Enterprise Hydroponics Bay (Deck 12) under the direction of Keiko O’Brien, testing botanical hybrids for oxygen regeneration on long-duration exploratory cruises.',
    keyFacts: [
      { label: 'Global Plant Species', value: '~390,000 vascular species' },
      { label: 'Atmospheric O₂ Source', value: '50-80% Marine Phytoplankton' },
      { label: 'Enzyme Efficiency', value: 'RuBisCO fixes 3-10 CO₂/sec' },
      { label: 'Exhibition Specimen', value: 'Chlorophyll A/B Fluorescence' },
    ],
    deepDive: 'The development of vascular xylem and phloem allowed plants to colonize land during the Silurian Period (430 million years ago), creating oxygen-rich atmospheres that paved the way for animal life.',
    relatedTrekTech: 'Hydroponics life support scrubbers, bio-regenerative atmospheric cycles.',
    tags: ['Botany', 'Biochemistry', 'Ecosystems', 'Photosynthesis'],
  },
  {
    id: 'spices-secondary-metabolites',
    category: 'earth_biology',
    title: 'Terrestrial Spices & Chemical Defense',
    subtitle: 'Capsaicin, Piperine, Curcumin & Secondary Metabolites',
    realScience: 'Earth spices (chili, black pepper, turmeric, cloves) evolved pungent alkaloids and polyphenols not for culinary pleasure, but as evolutionary biochemical defenses against fungal pathogens, insects, and herbivores. Capsaicin targets the mammalian TRPV1 heat-pain receptor.',
    starTrekCanon: 'Replicator molecular synthesis re-encodes Earth spices (such as saffron, star anise, and wasabi) down to chiral stereoisomer conformations, contrasting with Klingon bloodwine spices and Bajoran Hasperat peppers.',
    keyFacts: [
      { label: 'Active in Chili', value: 'Capsaicin (8-methyl-N-vanillyl-6-nonenamide)' },
      { label: 'Black Pepper Active', value: 'Piperine (TRPV1 agonist)' },
      { label: 'Scoville Heat Scale', value: 'Measures capsaicinoid concentration' },
      { label: 'Evolutionary Age', value: '~19 Million Years (Capsicum genus)' },
    ],
    deepDive: 'Plants synthesize secondary metabolites through the shikimate and mevalonate pathways. Humans exploit these phytochemicals for antimicrobials, analgesics, food preservation, and neuropharmacology.',
    relatedTrekTech: 'Replicator molecular synthesis matrices, bio-chemical scanners.',
    tags: ['Phytochemistry', 'Ethnobotany', 'Pharmacology', 'Organic Chemistry'],
  },
  {
    id: 'extremophiles-astrobiology',
    category: 'earth_biology',
    title: 'Extremophiles & Astrobiological Limits',
    subtitle: 'Tardigrades, Deinococcus, & Deep-Sea Chemotrophs',
    realScience: 'Earth extremophiles survive conditions once considered sterile: Deinococcus radiodurans withstands 5,000 Gray of gamma radiation via DNA-repair enzymes; Methanopyrus kandleri thrives at 122°C hydrothermal pressures; Tardigrades endure vacuum and absolute zero cryptobiosis.',
    starTrekCanon: 'Extremophile biochemistry forms the foundational baseline for Starfleet Class-Y (Demon class) and Class-L sensor calibration, guiding away teams searching for non-water-based silicon or methane life.',
    keyFacts: [
      { label: 'Radiation Limit', value: '5,000+ Gy (Deinococcus)' },
      { label: 'Thermal Limit', value: '122°C (Hydrothermal Archaea)' },
      { label: 'Desiccation Limit', value: 'Decades in cryptobiosis (Tardigrada)' },
      { label: 'Astrobiology Target', value: 'Enceladus & Titan plume samplers' },
    ],
    deepDive: 'Extremophile discoveries expanded the Drake Equation parameter fl (fraction of habitable planets where life emerges) by proving life can leverage sulfur, iron, and radiolytic hydrogen instead of sunlight.',
    relatedTrekTech: 'Tricorder bio-spectral resonance probes, environmental containment suits.',
    tags: ['Astrobiology', 'Extremophiles', 'Microbiology', 'DNA Repair'],
  },
  // --- SPACE EXPLORATION & DISCOVERIES ---
  {
    id: 'voyager-interstellar',
    category: 'space_exploration',
    title: 'Voyager 1 & 2 Interstellar Mission',
    subtitle: 'Humanity’s Furthest Robotic Ambassadors',
    realScience: 'Launched in 1977, Voyager 1 crossed the heliopause in August 2012 at 121 AU from the Sun, entering interstellar space. Both probes carry the Golden Record encoded with Earth sounds, languages, and pulsar triangulation coordinates.',
    starTrekCanon: 'In Star Trek: The Motion Picture (2271), the lost probe Voyager 6 fell into a black hole, was upgraded by a machine civilization, and returned to Earth as the colossal living entity "V\'Ger" seeking its creator.',
    keyFacts: [
      { label: 'Voyager 1 Distance', value: '> 160 AU (> 24 Billion km)' },
      { label: 'Radio Signal Lag', value: '~22.5 Hours one-way light time' },
      { label: 'Power Source', value: 'Plutonium-238 RTG' },
      { label: 'Interstellar Medium', value: 'Measures galactic cosmic ray density' },
    ],
    deepDive: 'Voyager 1 detected a forty-fold increase in interstellar cosmic ray flux and a sharp drop in solar wind ions upon crossing the heliopause boundary, directly measuring interstellar space for the first time.',
    relatedTrekTech: 'Federation subspace relay buoys, deep space sensor arrays.',
    tags: ['NASA', 'Deep Space', 'Heliopause', 'Interstellar'],
  },
  {
    id: 'james-webb-cosmology',
    category: 'space_exploration',
    title: 'James Webb Space Telescope (JWST)',
    subtitle: 'Infrared Glimpse into the Cosmic Dawn',
    realScience: 'Operating at the Sun-Earth L2 Lagrange point 1.5 million km from Earth, JWST’s 6.5-meter beryllium gold-coated primary mirror observes infrared wavelengths from 0.6 to 28 microns, detecting galaxies formed less than 350 million years after the Big Bang (redshift z > 13).',
    starTrekCanon: 'Starfleet Command operates subspace observatory arrays at Lagrange points across Sector 001, providing continuous stereoscopic sensor telemetry across the Alpha and Beta Quadrants.',
    keyFacts: [
      { label: 'Orbit', value: 'Sun-Earth L2 Halo Orbit' },
      { label: 'Mirror Diameter', value: '6.5 Meters (18 hexagonal segments)' },
      { label: 'Operating Temp', value: '-233°C (Cryogenic sunshield)' },
      { label: 'Furthest Galaxy', value: 'JADES-GS-z14-0 (z = 14.32)' },
    ],
    deepDive: 'JWST has revolutionized stellar astrophysics by detecting mature, massive early galaxies that challenge traditional hierarchical galaxy assembly models, as well as detecting carbon dioxide and methane in exoplanet atmospheres.',
    relatedTrekTech: 'Subspace radio-telescopes, tachyonic emission sensors.',
    tags: ['JWST', 'Infrared Astronomy', 'Cosmology', 'Early Universe'],
  },
];
