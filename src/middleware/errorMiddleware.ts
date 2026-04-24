import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export const errorMiddleware = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            res.status(409).json({ message: "This value already exists" });
            return;
        }

        if (error.code === "P2025") {
            res.status(404).json({ message: "Record not found" });
            return;
        }
    }

    res.status(500).json({
        message: "Internal server error",
    });
};