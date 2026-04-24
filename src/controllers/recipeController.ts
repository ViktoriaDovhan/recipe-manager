import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { parseIdParam } from "../lib/parseId";
import {
    createRecipeSchema,
    updateRecipeSchema,
} from "../schemas/recipeSchema";

const recipeInclude = {
    author: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    category: true,
    ingredients: {
        include: {
            ingredient: true,
        },
    },
    reviews: true,
    favorites: true,
};

export const getRecipes = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recipes = await prisma.recipe.findMany({
            include: recipeInclude,
            orderBy: { createdAt: "desc" },
        });

        res.json(recipes);
    } catch (error) {
        next(error);
    }
};

export const getRecipeById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recipeId = parseIdParam(req.params.id);

        if (!recipeId) {
            res.status(400).json({ message: "Invalid recipe id" });
            return;
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: recipeInclude,
        });

        if (!recipe) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        res.json(recipe);
    } catch (error) {
        next(error);
    }
};

export const searchRecipes = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const searchText = String(req.query.q || "");

        const recipes = await prisma.recipe.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: searchText,
                        },
                    },
                    {
                        description: {
                            contains: searchText,
                        },
                    },
                    {
                        instructions: {
                            contains: searchText,
                        },
                    },
                ],
            },
            include: recipeInclude,
            orderBy: { createdAt: "desc" },
        });

        res.json(recipes);
    } catch (error) {
        next(error);
    }
};

export const getRecipesByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = parseIdParam(req.params.categoryId);

        if (!categoryId) {
            res.status(400).json({ message: "Invalid category id" });
            return;
        }

        const recipes = await prisma.recipe.findMany({
            where: { categoryId },
            include: recipeInclude,
            orderBy: { createdAt: "desc" },
        });

        res.json(recipes);
    } catch (error) {
        next(error);
    }
};

export const createRecipe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validationResult = createRecipeSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const currentUserId = (req as any).user.id;
        const { ingredients, ...recipeData } = validationResult.data;

        const recipe = await prisma.recipe.create({
            data: {
                ...recipeData,
                authorId: currentUserId,
                ingredients: {
                    create:
                        ingredients?.map((recipeIngredient) => ({
                            amount: recipeIngredient.amount,
                            ingredient: {
                                connect: {
                                    id: recipeIngredient.ingredientId,
                                },
                            },
                        })) || [],
                },
            },
            include: recipeInclude,
        });

        res.status(201).json(recipe);
    } catch (error) {
        next(error);
    }
};

export const updateRecipe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recipeId = parseIdParam(req.params.id);

        if (!recipeId) {
            res.status(400).json({ message: "Invalid recipe id" });
            return;
        }

        const validationResult = updateRecipeSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const currentUserId = (req as any).user.id;

        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!existingRecipe) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        if (existingRecipe.authorId !== currentUserId) {
            res.status(403).json({ message: "You can update only your own recipes" });
            return;
        }

        const { ingredients, ...recipeData } = validationResult.data;

        const recipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: {
                ...recipeData,
                ingredients:
                    ingredients === undefined
                        ? undefined
                        : {
                            deleteMany: {},
                            create: ingredients.map((recipeIngredient) => ({
                                amount: recipeIngredient.amount,
                                ingredient: {
                                    connect: {
                                        id: recipeIngredient.ingredientId,
                                    },
                                },
                            })),
                        },
            },
            include: recipeInclude,
        });

        res.json(recipe);
    } catch (error) {
        next(error);
    }
};

export const deleteRecipe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recipeId = parseIdParam(req.params.id);

        if (!recipeId) {
            res.status(400).json({ message: "Invalid recipe id" });
            return;
        }

        const currentUserId = (req as any).user.id;

        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!existingRecipe) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        if (existingRecipe.authorId !== currentUserId) {
            res.status(403).json({ message: "You can delete only your own recipes" });
            return;
        }

        await prisma.recipe.delete({
            where: { id: recipeId },
        });

        res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
        next(error);
    }
};