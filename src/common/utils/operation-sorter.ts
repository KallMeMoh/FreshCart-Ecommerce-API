interface SortableOperation {
  get(key: 'method'): string;
}

export const operationsSorter = (
  a: SortableOperation,
  b: SortableOperation,
) => {
  const methodOrder = ['post', 'get', 'put', 'patch', 'delete'];
  const indexA = methodOrder.indexOf(a.get('method'));
  const indexB = methodOrder.indexOf(b.get('method'));
  return indexA - indexB;
};
