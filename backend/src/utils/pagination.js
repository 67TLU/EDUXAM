export function getPagination(query = {}) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);

    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 10)
    );

    const offset = (page - 1) * limit;

    return {
        page,
        limit,
        offset
    };
}

export function getPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
}