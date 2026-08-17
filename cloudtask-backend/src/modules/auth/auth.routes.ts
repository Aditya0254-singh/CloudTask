import { Router, Request, Response } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../middleware/error.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));

// A minimal protected route to demonstrate/verify that authMiddleware works.
// Returns the identity embedded in the caller's JWT.
router.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Authenticated",
    data: { user: req.user },
  });
});

export default router;
