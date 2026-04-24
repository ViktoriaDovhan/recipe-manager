import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { parseIdParam } from "../lib/parseId";
import { reviewSchema } from "../schemas/reviewSchema";

export const getRecipeReviews = async (
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

        const reviews = await prisma.review.findMany({
            where: {
                recipeId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

export const createReview = async (
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

        const validationResult = reviewSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        const currentUserId = (req as any).user.id;

        const review = await prisma.review.create({
            data: {
                ...validationResult.data,
                userId: currentUserId,
                recipeId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const reviewId = parseIdParam(req.params.id);

        if (!reviewId) {
            res.status(400).json({ message: "Invalid review id" });
            return;
        }

        const currentUserId = (req as any).user.id;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            res.status(404).json({ message: "Review not found" });
            return;
        }

        if (review.userId !== currentUserId) {
            res.status(403).json({ message: "You can delete only your own reviews" });
            return;
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        next(error);
    }
};