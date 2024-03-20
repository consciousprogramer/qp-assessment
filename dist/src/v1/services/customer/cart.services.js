import prismaInstance from "../../setup/prisma.setup.js";
export async function addToCartService(productId, quantity, customerId) {
    const product = await fetchProductStock(productId);
    if (!product) {
        throw new Error("product does not exists!");
    }
    const cartItem = await fetchCartItemQuantity(productId, customerId);
    if (cartItem) {
        throw new Error("product already exists in your cart!");
    }
    // if stock is less than required quantity, throw error
    if (product.stockCount < quantity) {
        throw new Error(`Only ${product.stockCount} item are available.`);
    }
    await createCartItem(productId, quantity, customerId);
}
export async function incrementCartItemQuantityService(productId, quantity, customerId) {
    // fetch the product, for latest stock count
    const product = await fetchProductStock(productId);
    if (!product) {
        throw new Error("product does not exists!");
    }
    const cartItem = await fetchCartItemQuantity(productId, customerId);
    // if the product was not in the cart then add into the cart
    if (!cartItem) {
        if (product.stockCount < quantity) {
            throw new Error(`Only ${product.stockCount} item are available.`);
        }
        await createCartItem(productId, quantity, customerId);
        return {
            action: "Created",
        };
    }
    if (product.stockCount < quantity + cartItem.quantity) {
        throw new Error(`Only ${product.stockCount} item are available.`);
    }
    await changeCartItemQuantity(productId, quantity, customerId, "INCREMENT");
    return {
        action: "Incremented",
    };
}
export async function decrementCartItemQuantityService(productId, quantity, customerId) {
    const cartItem = await fetchCartItemQuantity(productId, customerId);
    if (!cartItem) {
        throw new Error("product not is it your cart!");
    }
    // if quantity become less than 1, than remove the product
    if (cartItem.quantity - quantity <= 0) {
        await deleteCartItem(productId, customerId);
        return {
            action: "deleted",
        };
    }
    // decrease quantity
    await changeCartItemQuantity(productId, quantity, customerId, "DECREMENT");
    return {
        action: "decrement",
    };
}
export function getPaginatedCustomerCartItemListService(skip, perPage, customerId) {
    return prismaInstance.cartItem.findMany({
        where: {
            userId: customerId,
        },
        skip: skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
        include: {
            product: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    productMedias: {
                        where: {
                            active: true,
                        },
                        select: {
                            mediaType: true,
                            src: true,
                        },
                    },
                },
            },
        },
    });
}
export function deleteCartItem(productId, customerId) {
    return prismaInstance.cartItem.delete({
        where: {
            productId_userId: {
                productId,
                userId: customerId,
            },
        },
    });
}
export function changeCartItemQuantity(productId, quantity, customerId, action) {
    return prismaInstance.cartItem.update({
        where: {
            productId_userId: {
                productId,
                userId: customerId,
            },
        },
        data: {
            quantity: action === "INCREMENT"
                ? {
                    increment: quantity,
                }
                : {
                    decrement: quantity,
                },
        },
    });
}
export function fetchCartItemQuantity(productId, customerId) {
    return prismaInstance.cartItem.findUnique({
        where: {
            productId_userId: {
                productId,
                userId: customerId,
            },
        },
        select: {
            quantity: true,
        },
    });
}
export function createCartItem(productId, quantity, customerId) {
    return prismaInstance.cartItem.create({
        data: {
            productId,
            userId: customerId,
            quantity,
        },
    });
}
export function fetchProductStock(productId) {
    return prismaInstance.product.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true,
            stockCount: true,
        },
    });
}
