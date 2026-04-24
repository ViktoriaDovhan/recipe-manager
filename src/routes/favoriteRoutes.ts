import { Router } from "express";
import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "../controllers/favoriteController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getFavorites);
router.post("/:recipeId", authMiddleware, addFavorite);
router.delete("/:recipeId", authMiddleware, removeFavorite);

export default router;