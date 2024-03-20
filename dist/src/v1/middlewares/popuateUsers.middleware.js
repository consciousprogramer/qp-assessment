import prismaInstance from "../setup/prisma.setup.js";
export const populateCustomerInRequest = async (req, res, next) => {
    try {
        const customer = await prismaInstance.user.findUnique({
            where: {
                username: "customer",
            },
        });
        res.locals.customer = customer;
        next();
    }
    catch (error) {
        next(error);
    }
};
export const populateAdminInRequest = async (req, res, next) => {
    try {
        const admin = await prismaInstance.user.findUnique({
            where: {
                username: "admin",
            },
        });
        res.locals.admin = admin;
        next();
    }
    catch (error) {
        next(error);
    }
};
