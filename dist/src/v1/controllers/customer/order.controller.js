import { sendSuccessResponse } from "../../../utils/responseHandler.utils.js";
import { createOrderService, getPaginatedOrderListService, } from "../../services/customer/order.services.js";
export const createOrderController = async (req, res, next) => {
    try {
        const customerId = res.locals.customer.id;
        const { createdOrder } = await createOrderService(customerId);
        sendSuccessResponse(res, "order was created successfully", createdOrder);
    }
    catch (error) {
        next(error);
    }
};
export const listCustomerOrdersController = async (req, res, next) => {
    try {
        let { page, perPage } = req.query;
        page = +page;
        perPage = +perPage;
        const skip = (page - 1) * perPage;
        const customerId = res.locals.customer.id;
        const orders = await getPaginatedOrderListService(skip, perPage, customerId);
        sendSuccessResponse(res, "orders fetched successfully", orders);
    }
    catch (error) {
        next(error);
    }
};
