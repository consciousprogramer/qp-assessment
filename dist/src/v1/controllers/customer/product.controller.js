import { getPaginatedProductListService, getProduct, } from "../../services/customer/product.services.js";
import { sendSuccessResponse } from "../../../utils/responseHandler.utils.js";
export const getProductsController = async (req, res, next) => {
    try {
        let { page, perPage } = req.query;
        page = +page;
        perPage = +perPage;
        const skip = (page - 1) * perPage;
        const products = await getPaginatedProductListService(skip, perPage);
        sendSuccessResponse(res, "products fetched successfully", products);
    }
    catch (error) {
        next(error);
    }
};
export const getProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const products = await getProduct(id);
        sendSuccessResponse(res, "products fetched successfully", products);
    }
    catch (error) {
        next(error);
    }
};
