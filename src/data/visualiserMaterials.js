/**
 * Visualiser material swatches — clean AI-generated texture images (public/images/visualiser/).
 * No company branding in images. Names follow standard UK trade labels.
 */

const COBBLED_EDGE_PATH = '/images/visualiser/cobbled-edge-border.png';

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
        texture: '/images/visualiser/kandla-grey-sandstone.png',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'raj-green',
        name: 'Raj Green',
        supplierLabel: 'Raj Green Indian sandstone patio paving',
        texture: '/images/visualiser/raj-green-sandstone.png',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'delamere',
        name: 'Delamere / warm tones',
        supplierLabel: 'Warm buff & tan Indian sandstone (Delamere style)',
        texture: '/images/visualiser/warm-sandstone.png',
        cobbledEdge: true,
        cameraEdgeOverlay: true,
      },
      {
        id: 'autumn-brown',
        name: 'Autumn Brown',
        supplierLabel: 'Autumn Brown Indian sandstone — earthy browns',
        texture: '/images/visualiser/autumn-brown-sandstone.png',
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
        texture: '/images/visualiser/grey-porcelain.png',
        cobbledEdge: false,
      },
      {
        id: 'country-cream',
        name: 'Country Cream',
        supplierLabel: 'Cream porcelain patio paving',
        texture: '/images/visualiser/cream-porcelain.png',
        cobbledEdge: false,
      },
      {
        id: 'cream-cobble-border',
        name: 'Cream + cobbled border',
        supplierLabel: 'Cream porcelain with charcoal cobbled edge border',
        texture: '/images/visualiser/porcelain-cobbled-border.png',
        cobbledEdge: true,
      },
    ],
  },
  {
    id: 'cobbled-borders',
    label: 'Cobbled edges & borders',
    materials: [
      {
        id: 'cobble-charcoal-frame',
        name: 'Charcoal cobble border',
        supplierLabel: 'Dark charcoal sett border around patio flags',
        texture: '/images/visualiser/cobbled-edge-border.png',
        cobbledEdge: true,
      },
      {
        id: 'porcelain-cobble-combo',
        name: 'Porcelain + cobble edge',
        supplierLabel: 'Cream porcelain centre with cobbled perimeter',
        texture: '/images/visualiser/porcelain-cobbled-border.png',
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
        supplierLabel: 'Charcoal herringbone block paving',
        texture: '/images/visualiser/charcoal-block-paving.png',
        cobbledEdge: false,
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
        texture: '/images/visualiser/artificial-turf.png',
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
