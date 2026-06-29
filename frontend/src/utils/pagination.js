export const paginate = (items, requestedPage, pageSize) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (page - 1) * pageSize;

  return {
    page,
    totalPages,
    startIndex,
    items: items.slice(startIndex, startIndex + pageSize)
  };
};
