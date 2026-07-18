export const SORT_OPTIONS = {
  price_asc: { field: 'price', direction: 1 },
  price_desc: { field: 'price', direction: -1 },
  name_asc: { field: 'name', direction: 1 },
  newest: { field: '_id', direction: -1 },
} as const;
