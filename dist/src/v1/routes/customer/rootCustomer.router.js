import { Router } from "express";
import productRouter from "./product.router.js";
import cartRouter from "./cart.router.js";
import orderRouter from "./order.router.js";
const rootCustomerRouter = Router();
rootCustomerRouter.use("/product", productRouter);
rootCustomerRouter.use("/cart", cartRouter);
rootCustomerRouter.use("/order", orderRouter);
export default rootCustomerRouter;
