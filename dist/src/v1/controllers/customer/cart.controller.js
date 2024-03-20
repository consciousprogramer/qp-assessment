import { sendSuccessResponse } from "../../../utils/responseHandler.utils.js";
import { addToCartService, decrementCartItemQuantityService, getPaginatedCustomerCartItemListService, incrementCartItemQuantityService, } from "../../services/customer/cart.services.js";
export const addToCartController = async (req, res, next) => {
    try {
        const { productId } = req.body;
        let { quantity } = req.body;
        // if fe does not provide initial quantity
        if (!quantity)
            quantity = 1;
        const customerId = res.locals.customer.id;
        await addToCartService(productId, quantity, customerId);
        sendSuccessResponse(res, "item added to you cart");
    }
    catch (error) {
        next(error);
    }
};
export const incrementCartItemQuantityController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const customerId = res.locals.customer.id;
        const { action } = await incrementCartItemQuantityService(productId, quantity, customerId);
        if (action === "Created") {
            return sendSuccessResponse(res, "item added to you cart");
        }
        sendSuccessResponse(res, "item quantity incremented");
    }
    catch (error) {
        next(error);
    }
};
export const decrementCartItemQuantityController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const customerId = res.locals.customer.id;
        const { action } = await decrementCartItemQuantityService(productId, quantity, customerId);
        if (action === "deleted") {
            return sendSuccessResponse(res, "item removed from your cart", {
                productId,
            });
        }
        sendSuccessResponse(res, "item quantity decremented");
    }
    catch (error) {
        next(error);
    }
};
export const listCustomerCartItemsController = async (req, res, next) => {
    try {
        let { page, perPage } = req.query;
        page = +page;
        perPage = +perPage;
        const skip = (page - 1) * perPage;
        const customerId = res.locals.customer.id;
        const orders = await getPaginatedCustomerCartItemListService(skip, perPage, customerId);
        sendSuccessResponse(res, "cart items fetched successfully", orders);
    }
    catch (error) {
        next(error);
    }
};
