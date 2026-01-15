export const getSearchQuery = (fields, searchTerm) => {
    const arr = Array.isArray(fields) ? fields : [fields];
    return arr.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
    }));
};