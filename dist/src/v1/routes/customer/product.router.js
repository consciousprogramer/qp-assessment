import { Router } from "express";
import { getProductController, getProductsController, } from "../../controllers/customer/product.controller.js";
const productRouter = Router();
productRouter.get("/", getProductsController);
productRouter.get("/:id", getProductController);
export default productRouter;
