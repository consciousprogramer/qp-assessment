import { Router } from "express";
import adminProductRouter from "./adminProduct.router.js";
const rootAdminRouter = Router();
rootAdminRouter.use("/product", adminProductRouter);
export default rootAdminRouter;
