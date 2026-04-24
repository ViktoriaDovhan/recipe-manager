export const parseIdParam = (id: string | string[] | undefined): number | null => {
    if (!id || Array.isArray(id)) {
        return null;
    }

    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return null;
    }

    return parsedId;
};