import { Router } from "express";
import {
    createRecipe,
    deleteRecipe,
    getRecipeById,
    getRecipes,
    getRecipesByCategory,
    searchRecipes,
    updateRecipe,
} from "../controllers/recipeController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/search", searchRecipes);
router.get("/category/:categoryId", getRecipesByCategory);
router.get("/", getRecipes);
router.get("/:id", getRecipeById);
router.post("/", authMiddleware, createRecipe);
router.put("/:id", authMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

export default router;