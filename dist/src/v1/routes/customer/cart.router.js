import { Router } from "express";
import { addToCartController, decrementCartItemQuantityController, incrementCartItemQuantityController, listCustomerCartItemsController, } from "../../controllers/customer/cart.controller.js";
const cartRouter = Router();
cartRouter.get("/items", listCustomerCartItemsController);
cartRouter.post("/item/add", addToCartController);
cartRouter.patch("/item/increment-quantity", incrementCartItemQuantityController);
cartRouter.patch("/item/decrement-quantity", decrementCartItemQuantityController);
export default cartRouter;
