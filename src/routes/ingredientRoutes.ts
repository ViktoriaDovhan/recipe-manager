import { Router } from "express";
import {
    createIngredient,
    deleteIngredient,
    getIngredientById,
    getIngredients,
    updateIngredient,
} from "../controllers/ingredientController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getIngredients);
router.get("/:id", getIngredientById);
router.post("/", authMiddleware, createIngredient);
router.put("/:id", authMiddleware, updateIngredient);
router.delete("/:id", authMiddleware, deleteIngredient);

export default router;