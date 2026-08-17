import { Router } from "express";
import { tasksController } from "./tasks.controller";
import { asyncHandler } from "../../middleware/error.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Every task route requires a valid JWT.
router.use(authMiddleware);

router.post("/", asyncHandler(tasksController.create));
router.get("/", asyncHandler(tasksController.list));
router.get("/:id", asyncHandler(tasksController.getOne));
router.put("/:id", asyncHandler(tasksController.update));
router.patch("/:id/status", asyncHandler(tasksController.changeStatus));
router.delete("/:id", asyncHandler(tasksController.remove));

export default router;
