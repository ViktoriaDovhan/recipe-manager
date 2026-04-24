import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getJwtSecret } from "../lib/jwt";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: "Authorization header is missing" });
        return;
    }

    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        res.status(401).json({ message: "Invalid authorization format" });
        return;
    }

    const token = tokenParts[1];

    try {
        const decodedToken = jwt.verify(token, getJwtSecret()) as JwtPayload & {
            userId?: number;
        };

        if (!decodedToken.userId) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }

        (req as any).user = {
            id: decodedToken.userId,
        };

        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};