import { Router, type IRouter } from "express";
import healthRouter from "./health";
import supportRouter from "./support";
import workspaceRouter from "./workspace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(supportRouter);
router.use(workspaceRouter);

export default router;
