import { Router } from "express";
import {
    createReview,
    deleteReview,
    getRecipeReviews,
} from "../controllers/reviewController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/recipes/:recipeId/reviews", getRecipeReviews);
router.post("/recipes/:recipeId/reviews", authMiddleware, createReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;