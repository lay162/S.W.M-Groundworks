/**
 * Material previews use textures from S.W.M job photos (public/images/work/).
 * Paths are stored with readable spaces; materialImageUrl() encodes them for mobile browsers.
 */

const COBBLED_EDGE_PATH = '/images/work/driveways/Block paving drive.jpeg';

export function materialImageUrl(texture) {
  if (!texture) return '';
  const relative = texture.replace(/^\//, '');
  const encoded = relative.split('/').map((part) => encodeURIComponent(part)).join('/');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/${encoded}`;
  }
  const base = import.meta.env.BASE_URL || './';
  return `${base}${encoded}`;
}

export const COBBLED_EDGE_TEXTURE = COBBLED_EDGE_PATH;
export const VISUALISER_CATEGORIES = [
  {
    id: 'indian-stone',
    label: 'Indian sandstone',
    materials: [
      {
        id: 'raj-green',
        name: 'Raj Green',
        supplierLabel: 'Raj Green Indian sandstone — cobbled edge as shown',
        texture: '/images/work/patios/indian stone 5.jpeg',
      },
      {
        id: 'raj-green-alt',
        name: 'Raj Green (natural)',
        supplierLabel: 'Raj Green Indian sandstone — natural finish',
        texture: '/images/work/patios/indian stone pic.jpeg',
      },
      {
        id: 'kandla-grey',
        name: 'Kandla Grey',
        supplierLabel: 'Kandla Grey Indian sandstone — cobbled edge as shown',
        texture: '/images/work/patios/kandla grey indian stone 1.jpeg',
      },
      {
        id: 'kandla-grey-2',
        name: 'Kandla Grey (mixed)',
        supplierLabel: 'Kandla Grey Indian sandstone — mixed tones',
        texture: '/images/work/patios/Kanlda Grey Indian Stone 3.jpeg',
      },
      {
        id: 'autumn-brown',
        name: 'Autumn Brown',
        supplierLabel: 'Autumn Brown Indian sandstone',
        texture: '/images/work/patios/indian stone 3.jpeg',
      },
      {
        id: 'indian-mix',
        name: 'Mixed tones',
        supplierLabel: 'Indian sandstone — mixed natural tones',
        texture: '/images/work/patios/indian stone 4.jpeg',
      },
    ],
  },
  {
    id: 'porcelain',
    label: 'Porcelain tiles',
    materials: [
      {
        id: 'cream-porcelain',
        name: 'Cream',
        supplierLabel: 'Cream porcelain paving',
        texture: '/images/work/patios/tiles pic.jpeg',
      },
      {
        id: 'cream-frame',
        name: 'Cream (charcoal frame)',
        supplierLabel: 'Cream porcelain with charcoal cobbled border',
        texture: '/images/work/patios/white porcalian with charcoal picture frame boarder.jpeg',
      },
      {
        id: 'grey-porcelain',
        name: 'Light grey',
        supplierLabel: 'Light grey porcelain paving',
        texture: '/images/work/patios/tiles pic 2.jpeg',
      },
      {
        id: 'porcelain-block-edge',
        name: 'Porcelain & block edge',
        supplierLabel: 'Porcelain with cobbled block edge',
        texture: '/images/work/patios/porcalian tiles with block edge.jpeg',
      },
    ],
  },
  {
    id: 'block-paving',
    label: 'Block paving',
    materials: [
      {
        id: 'block-charcoal',
        name: 'Charcoal block',
        supplierLabel: 'Charcoal block paving driveway',
        texture: '/images/work/driveways/BlockPaved Driveway.jpeg',
      },
      {
        id: 'block-brindle',
        name: 'Brindle block',
        supplierLabel: 'Brindle block paving',
        texture: '/images/work/driveways/Block-Paving-Driveway.jpeg',
      },
      {
        id: 'block-path',
        name: 'Block path',
        supplierLabel: 'Block paved path',
        texture: '/images/work/driveways/BlockPaved Path 1.jpeg',
      },
      {
        id: 'cobble-style',
        name: 'Cobble-style',
        supplierLabel: 'Cobble-style block paving',
        texture: '/images/work/driveways/Block paving drive.jpeg',
      },
    ],
  },
  {
    id: 'natural-stone',
    label: 'Stone flags & steps',
    materials: [
      {
        id: 'stone-steps-1',
        name: 'Natural stone steps',
        supplierLabel: 'Natural stone step flags',
        texture: '/images/work/steps/steps pic .jpeg',
      },
      {
        id: 'stone-steps-2',
        name: 'Stone treads',
        supplierLabel: 'Cut stone treads and risers',
        texture: '/images/work/steps/Steps 1.jpeg',
      },
      {
        id: 'stone-steps-3',
        name: 'Grey stone flags',
        supplierLabel: 'Grey natural stone paving flags',
        texture: '/images/work/steps/steps 5.jpeg',
      },
      {
        id: 'keykurb-step',
        name: 'Kerb & step',
        supplierLabel: 'Key kerb with stone step finish',
        texture: '/images/work/steps/Keykurb Step .jpeg',
      },
    ],
  },
  {
    id: 'turf',
    label: 'Artificial turf',
    materials: [
      {
        id: 'turf-mid',
        name: 'Mid green',
        supplierLabel: 'Mid green artificial lawn',
        texture: '/images/work/gardens/garden before 5.jpeg',
      },
      {
        id: 'turf-fresh',
        name: 'Fresh green',
        supplierLabel: 'Fresh green artificial turf',
        texture: '/images/work/gardens/garden before 4.jpeg',
      },
      {
        id: 'turf-lawn',
        name: 'Landscape lawn',
        supplierLabel: 'Landscape artificial grass',
        texture: '/images/work/gardens/garden before 3.jpeg',
      },
    ],
  },
];

export const ALL_VISUALISER_MATERIALS = VISUALISER_CATEGORIES.flatMap((c) =>
  c.materials.map((m) => ({ ...m, category: c.label, categoryId: c.id })),
);

export function findMaterial(id) {
  return ALL_VISUALISER_MATERIALS.find((m) => m.id === id) || ALL_VISUALISER_MATERIALS[0];
}
