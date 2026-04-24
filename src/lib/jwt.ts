import jwt from "jsonwebtoken";

export const getJwtSecret = (): string => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwtSecret;
};

export const createToken = (userId: number): string => {
    return jwt.sign({ userId }, getJwtSecret(), {
        expiresIn: "7d",
    });
};