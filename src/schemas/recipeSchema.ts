import { z } from "zod";

export const recipeIngredientSchema = z.object({
    ingredientId: z.number().int().positive(),
    amount: z.string().min(1),
});

export const createRecipeSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    instructions: z.string().min(5),
    cookingTime: z.number().int().positive(),
    servings: z.number().int().positive(),
    imageUrl: z.string().url().optional(),
    categoryId: z.number().int().positive(),
    ingredients: z.array(recipeIngredientSchema).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();