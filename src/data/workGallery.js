/** Auto-synced from public/images/work/ — run: npm run sync-gallery */
/** Removing files from a folder removes them from the site. Order: prep→finish overrides, then A–Z. */

const img = (folder, file, alt, imgClass) => ({
  src: `/images/work/${folder}/${file}`,
  alt,
  ...(imgClass ? { imgClass } : {}),
});

const STEPS_PIC = 'h-full w-full object-cover object-[50%_18%] scale-[1.32]';

const EXTENSIONS = {
  label: 'Extensions & roofing',
  images: [
    img('extensions', 'Exstension roof 1.jpeg', 'Exstension roof 1'),
    img('extensions', 'Exstension roof 2.jpeg', 'Exstension roof 2'),
    img('extensions', 'Exstension Roof .jpeg', 'Exstension Roof'),
    img('extensions', 'Exstension Roof Complete.jpeg', 'Exstension Roof Complete'),
  ],
};

const FOUNDATIONS = {
  label: 'Foundations & digouts',
  images: [
    img('foundations', 'Concrete Floor Digout.jpeg', 'Concrete Floor Digout'),
  ],
};

const DRIVEWAYS = {
  label: 'Driveways',
  images: [
    img('driveways', 'Driveway Prep.jpeg', 'Driveway Prep'),
    img('driveways', 'Driveway Prep 1.jpeg', 'Driveway Prep 1'),
    img('driveways', 'Driveway Prep 3.jpeg', 'Driveway Prep 3'),
    img('driveways', 'Driveway1.jpeg', 'Driveway1'),
    img('driveways', 'Edging Kurb, Driveway prep.jpeg', 'Edging Kurb, Driveway prep'),
    img('driveways', 'Block Paving Driveway Prep.jpeg', 'Block Paving Driveway Prep'),
    img('driveways', 'Block paving drive.jpeg', 'Block paving drive'),
    img('driveways', 'Block-Paving-Driveway.jpeg', 'Block Paving Driveway'),
    img('driveways', 'BlockPaved Driveway.jpeg', 'BlockPaved Driveway'),
    img('driveways', 'Tarmac Drive Prep.jpeg', 'Tarmac Drive Prep'),
    img('driveways', 'Tarmac Driveway Prep..jpeg', 'Tarmac Driveway Prep.'),
    img('driveways', 'Tarmac-Driveway-PREP.jpeg', 'Tarmac Driveway PREP'),
    img('driveways', 'Tarmac Drive Block Edge.jpeg', 'Tarmac Drive Block Edge'),
    img('driveways', 'Tarmac Drive Block Edge 1.jpeg', 'Tarmac Drive Block Edge 1'),
    img('driveways', 'driveway pic.jpeg', 'Driveway pic'),
    img('driveways', 'tarmac.jpeg', 'Tarmac'),
    img('driveways', 'Tarmac Driveway .jpeg', 'Tarmac Driveway'),
    img('driveways', 'Tarmac Driveway. .jpeg', 'Tarmac Driveway.'),
    img('driveways', 'BlockPaved Path .jpeg', 'BlockPaved Path'),
    img('driveways', 'BlockPaved Path 1.jpeg', 'BlockPaved Path 1'),
    img('driveways', 'BlockPaved Path 2.jpeg', 'BlockPaved Path 2'),
    img('driveways', 'Front Path .jpeg', 'Front Path'),
    img('driveways', 'Front Path 2.jpeg', 'Front Path 2'),
    img('driveways', 'Front Path 3.jpeg', 'Front Path 3'),
    img('driveways', 'Golden Gravel Driveway .jpeg', 'Golden Gravel Driveway'),
  ],
};

const FENCING = {
  label: 'Fencing & gates',
  images: [
    img('fencing', 'Batten Fencing.jpeg', 'Batten Fencing'),
    img('fencing', 'fence pic.jpeg', 'Fence pic'),
    img('fencing', 'fence pic1.jpeg', 'Fence pic1'),
    img('fencing', 'gate pic .jpeg', 'Gate pic'),
  ],
};

const STEPS = {
  label: 'Steps & stonework',
  images: [
    img('steps', 'steps pic .jpeg', 'Steps pic', STEPS_PIC),
    img('steps', 'Steps 1.jpeg', 'Steps 1'),
    img('steps', 'steps 3.jpeg', 'Steps 3'),
    img('steps', 'steps 4.jpeg', 'Steps 4'),
    img('steps', 'steps 5.jpeg', 'Steps 5'),
    img('steps', 'steps 6.jpeg', 'Steps 6'),
    img('steps', 'steps 7.jpeg', 'Steps 7'),
    img('steps', 'Keykurb Step .jpeg', 'Keykurb Step'),
  ],
};

const GARDENS = {
  label: 'Gardens',
  images: [
    img('gardens', 'garden before 1.jpeg', 'Garden before 1'),
    img('gardens', 'garden before 2.jpeg', 'Garden before 2'),
    img('gardens', 'garden before 3.jpeg', 'Garden before 3'),
    img('gardens', 'garden before 4.jpeg', 'Garden before 4'),
    img('gardens', 'garden before 5.jpeg', 'Garden before 5'),
    img('gardens', 'Garden Dig off .jpeg', 'Garden Dig off'),
    img('gardens', 'garden pic 2.jpeg', 'Garden pic 2'),
    img('gardens', 'garden pic 3.jpeg', 'Garden pic 3'),
  ],
};

const PATIOS = {
  label: 'Patios & paving',
  images: [
    img('patios', 'kanla grey indian stone .jpeg', 'Kanla grey indian stone'),
    img('patios', 'kandla grey indian stone 1.jpeg', 'Kandla grey indian stone 1'),
    img('patios', 'Kanlda Grey Indian Stone 3.jpeg', 'Kanlda Grey Indian Stone 3'),
    img('patios', 'indian stone pic.jpeg', 'Indian stone pic'),
    img('patios', 'indian stone 3.jpeg', 'Indian stone 3'),
    img('patios', 'indian stone 4.jpeg', 'Indian stone 4'),
    img('patios', 'indian stone 5.jpeg', 'Indian stone 5'),
    img('patios', 'tiles pic.jpeg', 'Tiles pic'),
    img('patios', 'tiles pic 2.jpeg', 'Tiles pic 2'),
    img('patios', 'porcalian tiles with block edge.jpeg', 'Porcalian tiles with block edge'),
    img('patios', 'white porcalian with charcoal picture frame boarder.jpeg', 'White porcalian with charcoal picture frame boarder'),
  ],
};

const PORCHES = {
  label: 'Porches',
  images: [
    img('porches', 'porch pic.jpeg', 'Porch pic'),
  ],
};

const CATEGORY_ORDER = [
  'extensions',
  'foundations',
  'driveways',
  'fencing',
  'steps',
  'gardens',
  'patios',
  'porches',
];

const CATEGORIES = {
  extensions: EXTENSIONS,
  foundations: FOUNDATIONS,
  driveways: DRIVEWAYS,
  fencing: FENCING,
  steps: STEPS,
  gardens: GARDENS,
  patios: PATIOS,
  porches: PORCHES,
};

export const WORK_GALLERY_ORDER = ['all', ...CATEGORY_ORDER];

export const WORK_GALLERY = {
  all: {
    label: 'All work',
    images: CATEGORY_ORDER.flatMap((id) => CATEGORIES[id].images),
  },
  ...CATEGORIES,
};

/** Before/after only when both photos are the same job. Other work: use category tabs below. */
export const PORTFOLIO_ITEMS = [
  {
    title: 'Extension roof',
    subtitle: 'Same extension — stage 1 to completion',
    beforeSrc: '/images/work/extensions/Exstension roof 1.jpeg',
    afterSrc: '/images/work/extensions/Exstension Roof Complete.jpeg',
  },
];
