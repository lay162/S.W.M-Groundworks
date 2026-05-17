/** Gallery paths under public/images/work/ — ordered prep → finish per job where filenames indicate stages. */

const img = (folder, file, alt, imgClass) => ({
  src: `/images/work/${folder}/${file}`,
  alt,
  ...(imgClass ? { imgClass } : {}),
});

const STEPS_PIC = 'h-full w-full object-cover object-[50%_18%] scale-[1.32]';

const EXTENSIONS = {
  label: 'Extensions & roofing',
  images: [
    img('extensions', 'Exstension roof 1.jpeg', 'Extension roof — stage 1'),
    img('extensions', 'Exstension roof 2.jpeg', 'Extension roof — stage 2'),
    img('extensions', 'Exstension Roof .jpeg', 'Extension roof — in progress'),
    img('extensions', 'Exstension Roof Complete.jpeg', 'Extension roof — complete'),
  ],
};

const FOUNDATIONS = {
  label: 'Foundations & digouts',
  images: [img('foundations', 'Concrete Floor Digout.jpeg', 'Concrete floor digout')],
};

const DRIVEWAYS = {
  label: 'Driveways',
  images: [
    img('driveways', 'Driveway Prep.jpeg', 'Driveway preparation'),
    img('driveways', 'Driveway Prep 1.jpeg', 'Driveway preparation'),
    img('driveways', 'Driveway Prep 3.jpeg', 'Driveway preparation'),
    img('driveways', 'Driveway1.jpeg', 'Driveway preparation'),
    img('driveways', 'Edging Kurb, Driveway prep.jpeg', 'Edging and kerb — driveway prep'),
    img('driveways', 'Block Paving Driveway Prep.jpeg', 'Block paving driveway — preparation'),
    img('driveways', 'Block paving drive.jpeg', 'Block paving driveway'),
    img('driveways', 'Block-Paving-Driveway.jpeg', 'Block paving driveway'),
    img('driveways', 'BlockPaved Driveway.jpeg', 'Block paved driveway'),
    img('driveways', 'Tarmac Drive Prep.jpeg', 'Tarmac driveway — preparation'),
    img('driveways', 'Tarmac Driveway Prep..jpeg', 'Tarmac driveway — preparation'),
    img('driveways', 'Tarmac-Driveway-PREP.jpeg', 'Tarmac driveway — preparation'),
    img('driveways', 'Tarmac Drive Block Edge.jpeg', 'Tarmac driveway — block edging'),
    img('driveways', 'Tarmac Drive Block Edge 1.jpeg', 'Tarmac driveway — block edging'),
    img('driveways', 'driveway pic.jpeg', 'Driveway project'),
    img('driveways', 'tarmac.jpeg', 'Tarmac driveway — finished'),
    img('driveways', 'Tarmac Driveway .jpeg', 'Tarmac driveway — finished'),
    img('driveways', 'Tarmac Driveway. .jpeg', 'Tarmac driveway — finished'),
    img('driveways', 'BlockPaved Path .jpeg', 'Block paved path'),
    img('driveways', 'BlockPaved Path 1.jpeg', 'Block paved path — in progress'),
    img('driveways', 'BlockPaved Path 2.jpeg', 'Block paved path — finished'),
    img('driveways', 'Front Path .jpeg', 'Front path'),
    img('driveways', 'Front Path 2.jpeg', 'Front path — in progress'),
    img('driveways', 'Front Path 3.jpeg', 'Front path — finished'),
    img('driveways', 'Golden Gravel Driveway .jpeg', 'Golden gravel driveway'),
  ],
};

const FENCING = {
  label: 'Fencing & gates',
  images: [
    img('fencing', 'fence pic.jpeg', 'Fencing installation'),
    img('fencing', 'fence pic1.jpeg', 'Fencing installation'),
    img('fencing', 'Batten Fencing.jpeg', 'Batten fencing'),
    img('fencing', 'gate pic .jpeg', 'Gate installation'),
  ],
};

const STEPS = {
  label: 'Steps & stonework',
  images: [
    img('steps', 'steps pic .jpeg', 'Stone steps', STEPS_PIC),
    img('steps', 'Steps 1.jpeg', 'Stone steps — stage 1'),
    img('steps', 'steps 3.jpeg', 'Stone steps — stage 2'),
    img('steps', 'steps 4.jpeg', 'Stone steps — stage 3'),
    img('steps', 'steps 5.jpeg', 'Stone steps — stage 4'),
    img('steps', 'steps 6.jpeg', 'Stone steps — stage 5'),
    img('steps', 'steps 7.jpeg', 'Stone steps — finished'),
    img('steps', 'Keykurb Step .jpeg', 'Kerb and step detail'),
  ],
};

const GARDENS = {
  label: 'Gardens',
  images: [
    img('gardens', 'Garden Dig off .jpeg', 'Garden dig off — preparation'),
    img('gardens', 'garden pic 2.jpeg', 'Garden landscaping'),
    img('gardens', 'garden pic 3.jpeg', 'Garden landscaping — finished'),
  ],
};

const PATIOS = {
  label: 'Patios & paving',
  images: [
    img('patios', 'kanla grey indian stone .jpeg', 'Kandla grey Indian stone — preparation'),
    img('patios', 'kandla grey indian stone 1.jpeg', 'Kandla grey Indian stone — in progress'),
    img('patios', 'Kanlda Grey Indian Stone 3.jpeg', 'Kandla grey Indian stone'),
    img('patios', 'indian stone pic.jpeg', 'Indian stone paving'),
    img('patios', 'indian stone 3.jpeg', 'Indian stone paving'),
    img('patios', 'indian stone 4.jpeg', 'Indian stone paving'),
    img('patios', 'indian stone 5.jpeg', 'Indian stone paving — finished'),
    img('patios', 'tiles pic.jpeg', 'Porcelain patio tiles'),
    img('patios', 'tiles pic 2.jpeg', 'Patio paving'),
    img('patios', 'porcalian tiles with block edge.jpeg', 'Porcelain tiles with block edge'),
    img(
      'patios',
      'white porcalian with charcoal picture frame boarder.jpeg',
      'White porcelain with charcoal picture-frame border',
    ),
  ],
};

const PORCHES = {
  label: 'Porches',
  images: [img('porches', 'porch pic.jpeg', 'Porch')],
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

export const PORTFOLIO_ITEMS = [
  {
    title: 'Extension roof',
    subtitle: 'Build to completion',
    beforeSrc: '/images/work/extensions/Exstension roof 1.jpeg',
    afterSrc: '/images/work/extensions/Exstension Roof Complete.jpeg',
  },
  {
    title: 'Indian stone patio',
    subtitle: 'Kandla grey — prep to finish',
    beforeSrc: '/images/work/patios/kanla grey indian stone .jpeg',
    afterSrc: '/images/work/patios/indian stone 5.jpeg',
  },
  {
    title: 'Tarmac driveway',
    subtitle: 'Prep to finish',
    beforeSrc: '/images/work/driveways/Tarmac Drive Prep.jpeg',
    afterSrc: '/images/work/driveways/Tarmac Driveway .jpeg',
  },
  {
    title: 'Garden',
    subtitle: 'Dig off to finish',
    beforeSrc: '/images/work/gardens/Garden Dig off .jpeg',
    afterSrc: '/images/work/gardens/garden pic 3.jpeg',
  },
];
