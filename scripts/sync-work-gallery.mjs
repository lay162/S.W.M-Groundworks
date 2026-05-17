/**
 * Builds src/data/workGallery.js from public/images/work/* folders.
 * Run after adding or removing photos: npm run sync-gallery
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const workRoot = path.join(root, 'public', 'images', 'work');
const outFile = path.join(root, 'src', 'data', 'workGallery.js');

const CATEGORY_META = {
  extensions: 'Extensions & roofing',
  foundations: 'Foundations & digouts',
  driveways: 'Driveways',
  fencing: 'Fencing & gates',
  steps: 'Steps & stonework',
  gardens: 'Gardens',
  patios: 'Patios & paving',
  porches: 'Porches',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_META);
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

/** Preferred prep → finish order; unknown/new files append after (sorted A–Z). */
const ORDER_OVERRIDE = {
  extensions: [
    'Exstension roof 1.jpeg',
    'Exstension roof 2.jpeg',
    'Exstension Roof .jpeg',
    'Exstension Roof Complete.jpeg',
  ],
  driveways: [
    'Driveway Prep.jpeg',
    'Driveway Prep 1.jpeg',
    'Driveway Prep 3.jpeg',
    'Driveway1.jpeg',
    'Edging Kurb, Driveway prep.jpeg',
    'Block Paving Driveway Prep.jpeg',
    'Block paving drive.jpeg',
    'Block-Paving-Driveway.jpeg',
    'BlockPaved Driveway.jpeg',
    'Tarmac Drive Prep.jpeg',
    'Tarmac Driveway Prep..jpeg',
    'Tarmac-Driveway-PREP.jpeg',
    'Tarmac Drive Block Edge.jpeg',
    'Tarmac Drive Block Edge 1.jpeg',
    'driveway pic.jpeg',
    'tarmac.jpeg',
    'Tarmac Driveway .jpeg',
    'Tarmac Driveway. .jpeg',
    'BlockPaved Path .jpeg',
    'BlockPaved Path 1.jpeg',
    'BlockPaved Path 2.jpeg',
    'Front Path .jpeg',
    'Front Path 2.jpeg',
    'Golden Gravel Driveway .jpeg',
  ],
  steps: [
    'steps pic .jpeg',
    'Steps 1.jpeg',
    'steps 3.jpeg',
    'steps 4.jpeg',
    'steps 5.jpeg',
    'steps 6.jpeg',
    'steps 7.jpeg',
    'Keykurb Step .jpeg',
  ],
  gardens: [
    'garden before 1.jpeg',
    'garden before 2.jpeg',
    'garden before 3.jpeg',
    'garden before 4.jpeg',
    'garden before 5.jpeg',
    'Garden Dig off .jpeg',
    'garden pic 2.jpeg',
    'garden pic 3.jpeg',
  ],
  patios: [
    'kanla grey indian stone .jpeg',
    'kandla grey indian stone 1.jpeg',
    'Kanlda Grey Indian Stone 3.jpeg',
    'indian stone pic.jpeg',
    'indian stone 3.jpeg',
    'indian stone 4.jpeg',
    'indian stone 5.jpeg',
    'tiles pic.jpeg',
    'tiles pic 2.jpeg',
    'porcalian tiles with block edge.jpeg',
    'white porcalian with charcoal picture frame boarder.jpeg',
  ],
};

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function orderFiles(folder, files) {
  const override = ORDER_OVERRIDE[folder];
  if (!override) return [...files].sort(naturalCompare);
  const ordered = override.filter((f) => files.includes(f));
  const extra = files.filter((f) => !override.includes(f)).sort(naturalCompare);
  return [...ordered, ...extra];
}

function altFromFilename(file) {
  const base = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function listImages(folder) {
  const dir = path.join(workRoot, folder);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f));
  return orderFiles(folder, files);
}

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let total = 0;
const constBlocks = [];

for (const id of CATEGORY_ORDER) {
  const files = listImages(id);
  total += files.length;
  const lines = files.map((file) => {
    const alt = altFromFilename(file);
    const isStepsPic = id === 'steps' && file.toLowerCase().includes('steps pic');
    if (isStepsPic) {
      return `    img('${id}', '${escapeJs(file)}', '${escapeJs(alt)}', STEPS_PIC),`;
    }
    return `    img('${id}', '${escapeJs(file)}', '${escapeJs(alt)}'),`;
  });
  constBlocks.push(`const ${id.toUpperCase()} = {
  label: '${CATEGORY_META[id]}',
  images: [
${lines.join('\n')}
  ],
};`);
}

const categoriesObj = CATEGORY_ORDER.map((id) => `  ${id}: ${id.toUpperCase()},`).join('\n');

// Only pair images that are clearly the same job (numbered / named sequence).
const portfolioPaths = [
  ['extensions', 'Exstension roof 1.jpeg'],
  ['extensions', 'Exstension Roof Complete.jpeg'],
];

const missingPortfolio = portfolioPaths.filter(([folder, file]) => !listImages(folder).includes(file));
if (missingPortfolio.length) {
  console.warn('Warning: update PORTFOLIO_ITEMS — missing featured image(s):');
  missingPortfolio.forEach(([f, file]) => console.warn(`  - ${f}/${file}`));
}

const file = `/** Auto-synced from public/images/work/ — run: npm run sync-gallery */
/** Removing files from a folder removes them from the site. Order: prep→finish overrides, then A–Z. */

const img = (folder, file, alt, imgClass) => ({
  src: \`/images/work/\${folder}/\${file}\`,
  alt,
  ...(imgClass ? { imgClass } : {}),
});

const STEPS_PIC = 'h-full w-full object-cover object-[50%_18%] scale-[1.32]';

${constBlocks.join('\n\n')}

const CATEGORY_ORDER = [
${CATEGORY_ORDER.map((id) => `  '${id}',`).join('\n')}
];

const CATEGORIES = {
${categoriesObj}
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
`;

fs.writeFileSync(outFile, file, 'utf8');
console.log(`Synced ${total} images → ${path.relative(root, outFile)}`);
