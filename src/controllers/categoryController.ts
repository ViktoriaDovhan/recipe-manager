import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { parseIdParam } from "../lib/parseId";
import { categorySchema } from "../schemas/categorySchema";

export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { id: "asc" },
        });

        res.json(categories);
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = parseIdParam(req.params.id);

        if (!categoryId) {
            res.status(400).json({ message: "Invalid category id" });
            return;
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                recipes: true,
            },
        });

        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validationResult = categorySchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const category = await prisma.category.create({
            data: validationResult.data,
        });

        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = parseIdParam(req.params.id);

        if (!categoryId) {
            res.status(400).json({ message: "Invalid category id" });
            return;
        }

        const validationResult = categorySchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: "Invalid data",
                errors: validationResult.error.issues,
            });
            return;
        }

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: validationResult.data,
        });

        res.json(category);
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = parseIdParam(req.params.id);

        if (!categoryId) {
            res.status(400).json({ message: "Invalid category id" });
            return;
        }

        await prisma.category.delete({
            where: { id: categoryId },
        });

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        next(error);
    }
};