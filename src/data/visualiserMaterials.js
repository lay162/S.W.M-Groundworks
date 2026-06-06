/**
 * Material previews use textures from S.W.M job photos (public/images/work/).
 * Names follow standard UK trade labels (Raj Green, Kandla Grey, Country Cream porcelain, etc.)
 * so customers can pick a finish like they would at a paving supplier.
 */

const COBBLED_EDGE_PATH = '/images/work/patios/porcalian tiles with block edge.jpeg';

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
        id: 'kandla-grey',
        name: 'Kandla Grey',
        supplierLabel: 'Kandla Grey Indian sandstone patio flags',
        texture: '/images/work/patios/kandla grey indian stone 1.jpeg',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'kandla-grey-2',
        name: 'Kandla Grey (mixed)',
        supplierLabel: 'Kandla Grey Indian sandstone — mixed grey tones',
        texture: '/images/work/patios/Kanlda Grey Indian Stone 3.jpeg',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'kandla-grey-3',
        name: 'Kandla Grey (natural)',
        supplierLabel: 'Kandla Grey Indian sandstone — natural riven finish',
        texture: '/images/work/patios/kanla grey indian stone .jpeg',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'raj-green',
        name: 'Raj Green',
        supplierLabel: 'Raj Green Indian sandstone patio paving',
        texture: '/images/work/patios/indian stone 5.jpeg',
        cobbledEdge: true,
      },
      {
        id: 'raj-green-alt',
        name: 'Raj Green (natural)',
        supplierLabel: 'Raj Green Indian sandstone — green & buff tones',
        texture: '/images/work/patios/indian stone pic.jpeg',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'delamere',
        name: 'Delamere / warm tones',
        supplierLabel: 'Warm buff & tan Indian sandstone (Delamere style)',
        texture: '/images/work/patios/indian stone 3.jpeg',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'autumn-brown',
        name: 'Autumn Brown',
        supplierLabel: 'Autumn Brown Indian sandstone — earthy browns',
        texture: '/images/work/patios/indian stone 4.jpeg',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
    ],
  },
  {
    id: 'porcelain',
    label: 'Porcelain paving',
    materials: [
      {
        id: 'kandla-grey-porcelain',
        name: 'Kandla Grey porcelain',
        supplierLabel: 'Light grey porcelain paving (Kandla Grey style)',
        texture: '/images/work/patios/tiles pic 2.jpeg',
        cobbledEdge: false,
      },
      {
        id: 'country-cream',
        name: 'Country Cream',
        supplierLabel: 'Cream porcelain patio paving',
        texture: '/images/work/patios/tiles pic.jpeg',
        cobbledEdge: false,
      },
      {
        id: 'cream-frame',
        name: 'Cream + charcoal border',
        supplierLabel: 'Cream porcelain with charcoal cobbled picture-frame edge',
        texture: '/images/work/patios/white porcalian with charcoal picture frame boarder.jpeg',
        cobbledEdge: true,
      },
      {
        id: 'porcelain-block-edge',
        name: 'Porcelain + block border',
        supplierLabel: 'Porcelain patio with cobbled block-paved edge',
        texture: '/images/work/patios/porcalian tiles with block edge.jpeg',
        cobbledEdge: true,
      },
    ],
  },
  {
    id: 'cobbled-borders',
    label: 'Cobbled edges & borders',
    materials: [
      {
        id: 'cobble-block-edge',
        name: 'Block cobble border',
        supplierLabel: 'Cobbled block edge around patio flags',
        texture: '/images/work/patios/porcalian tiles with block edge.jpeg',
        cobbledEdge: true,
      },
      {
        id: 'cobble-charcoal-frame',
        name: 'Charcoal cobble frame',
        supplierLabel: 'Charcoal sett border framing light paving',
        texture: '/images/work/patios/white porcalian with charcoal picture frame boarder.jpeg',
        cobbledEdge: true,
      },
      {
        id: 'cobble-drive',
        name: 'Cobble-style driveway',
        supplierLabel: 'Cobble-effect block paving edge & drive',
        texture: '/images/work/driveways/Block paving drive.jpeg',
        cobbledEdge: true,
      },
      {
        id: 'cobble-path',
        name: 'Cobbled path edge',
        supplierLabel: 'Block paved path with raised kerb edge',
        texture: '/images/work/driveways/BlockPaved Path 1.jpeg',
        cobbledEdge: true,
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
        cobbledEdge: false,
      },
      {
        id: 'block-brindle',
        name: 'Brindle block',
        supplierLabel: 'Brindle block paving',
        texture: '/images/work/driveways/Block-Paving-Driveway.jpeg',
        cobbledEdge: false,
      },
      {
        id: 'block-path',
        name: 'Block path',
        supplierLabel: 'Block paved front path',
        texture: '/images/work/driveways/BlockPaved Path 2.jpeg',
        cobbledEdge: false,
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
        cobbledEdge: false,
      },
      {
        id: 'stone-steps-2',
        name: 'Stone treads',
        supplierLabel: 'Cut stone treads and risers',
        texture: '/images/work/steps/Steps 1.jpeg',
        cobbledEdge: false,
      },
      {
        id: 'stone-steps-3',
        name: 'Grey stone flags',
        supplierLabel: 'Grey natural stone paving flags',
        texture: '/images/work/steps/steps 5.jpeg',
        cobbledEdge: false,
      },
      {
        id: 'keykurb-step',
        name: 'Kerb & step',
        supplierLabel: 'Key kerb with stone step finish',
        texture: '/images/work/steps/Keykurb Step .jpeg',
        cobbledEdge: true,
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
        cobbledEdge: false,
      },
      {
        id: 'turf-fresh',
        name: 'Fresh green',
        supplierLabel: 'Fresh green artificial turf',
        texture: '/images/work/gardens/garden before 4.jpeg',
        cobbledEdge: false,
      },
      {
        id: 'turf-lawn',
        name: 'Landscape lawn',
        supplierLabel: 'Landscape artificial grass',
        texture: '/images/work/gardens/garden before 3.jpeg',
        cobbledEdge: false,
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

export function materialShowsCobbledEdge(material) {
  return Boolean(material?.cobbledEdge);
}
