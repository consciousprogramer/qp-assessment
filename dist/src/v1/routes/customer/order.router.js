import { Router } from "express";
import { createOrderController, listCustomerOrdersController, } from "../../controllers/customer/order.controller.js";
const orderRouter = Router();
orderRouter.get("/", listCustomerOrdersController);
orderRouter.post("/create", createOrderController);
export default orderRouter;
