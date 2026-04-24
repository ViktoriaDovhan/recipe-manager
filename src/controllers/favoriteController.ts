import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { parseIdParam } from "../lib/parseId";

export const getFavorites = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const currentUserId = (req as any).user.id;

        const favorites = await prisma.favorite.findMany({
            where: {
                userId: currentUserId,
            },
            include: {
                recipe: {
                    include: {
                        category: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(favorites);
    } catch (error) {
        next(error);
    }
};

export const addFavorite = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recipeId = parseIdParam(req.params.recipeId);

        if (!recipeId) {
            res.status(400).json({ message: "Invalid recipe id" });
            return;
        }

        const currentUserId = (req as any).user.id;

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: currentUserId,
                recipeId,
            },
            include: {
                recipe: true,
            },
        });

        res.status(201).json(favorite);
    } catch (error) {
        next(error);
    }
};

export const removeFavorite = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recipeId = parseIdParam(req.params.recipeId);

        if (!recipeId) {
            res.status(400).json({ message: "Invalid recipe id" });
            return;
        }

        const currentUserId = (req as any).user.id;

        await prisma.favorite.delete({
            where: {
                userId_recipeId: {
                    userId: currentUserId,
                    recipeId,
                },
            },
        });

        res.json({ message: "Favorite removed successfully" });
    } catch (error) {
        next(error);
    }
};