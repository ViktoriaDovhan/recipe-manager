import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { parseIdParam } from "../lib/parseId";
import { ingredientSchema } from "../schemas/ingredientSchema";

export const getIngredients = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ingredients = await prisma.ingredient.findMany({
            orderBy: { id: "asc" },
        });

        res.json(ingredients);
    } catch (error) {
        next(error);
    }
};

export const getIngredientById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ingredientId = parseIdParam(req.params.id);

        if (!ingredientId) {
            res.status(400).json({ message: "Invalid ingredient id" });
            return;
        }

        const ingredient = await prisma.ingredient.findUnique({
            where: { id: ingredientId },
            include: {
                recipes: {
                    include: {
                        recipe: true,
                    },
                },
            },
        });

        if (!ingredient) {
            res.status(404).json({ message: "Ingredient not found" });
            return;
        }

        res.json(ingredient);
    } catch (error) {
        next(error);
    }
};

export const createIngredient = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validationResult = ingredientSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const ingredient = await prisma.ingredient.create({
            data: validationResult.data,
        });

        res.status(201).json(ingredient);
    } catch (error) {
        next(error);
    }
};

export const updateIngredient = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ingredientId = parseIdParam(req.params.id);

        if (!ingredientId) {
            res.status(400).json({ message: "Invalid ingredient id" });
            return;
        }

        const validationResult = ingredientSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const ingredient = await prisma.ingredient.update({
            where: { id: ingredientId },
            data: validationResult.data,
        });

        res.json(ingredient);
    } catch (error) {
        next(error);
    }
};

export const deleteIngredient = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ingredientId = parseIdParam(req.params.id);

        if (!ingredientId) {
            res.status(400).json({ message: "Invalid ingredient id" });
            return;
        }

        await prisma.ingredient.delete({
            where: { id: ingredientId },
        });

        res.json({ message: "Ingredient deleted successfully" });
    } catch (error) {
        next(error);
    }
};