import prismaInstance from "../../setup/prisma.setup.js";
export function adminCreateProductService(adminId, title, description, price, initialStockCount, media) {
    return prismaInstance.product.create({
        data: {
            title,
            description,
            price,
            stockCount: initialStockCount,
            createdBy: {
                connect: {
                    id: adminId,
                },
            },
            productMedias: {
                createMany: {
                    data: media.map((item) => {
                        return {
                            src: item.src,
                            mediaType: item.type,
                            createdById: adminId,
                        };
                    }),
                },
            },
        },
    });
}
export function adminProductListService(filters, skip, perPage, orderBy) {
    const whereQuery = {};
    // can implement search vector to improve search
    if (filters?.query) {
        whereQuery["AND"] = [
            {
                title: {
                    contains: filters.query,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: filters.query,
                    mode: "insensitive",
                },
            },
        ];
    }
    if (filters?.price) {
        whereQuery["price"] = filters.price;
    }
    if (filters?.stockCount) {
        whereQuery["price"] = filters.price;
    }
    return prismaInstance.product.findMany({
        where: whereQuery,
        skip: skip,
        take: perPage,
        orderBy: { id: "asc" },
        include: {
            reStockingRecords: {
                select: {
                    atCount: true,
                    count: true,
                    createdAt: true,
                    createdBy: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
            productMedias: {
                where: {
                    active: true,
                },
                select: {
                    mediaType: true,
                    src: true,
                    createdBy: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
    });
}
export function adminDeleteProductService(productIds) {
    return prismaInstance.product.deleteMany({
        where: {
            id: {
                in: productIds,
            },
        },
    });
}
export function adminUpdateManyProductService(where, data) {
    return prismaInstance.product.updateMany({
        where,
        data,
    });
}
export function adminReStockProductService(productId, stock, adminId) {
    return prismaInstance.$transaction(async (reStockTxn) => {
        const product = await updateProductStock(reStockTxn, productId, stock);
        await createRestockingRecord(reStockTxn, productId, product.stockCount - stock, stock, adminId);
        return product;
    });
}
export function adminReStockManyProductService(reStockData, reStockingMap, adminId) {
    return prismaInstance.$transaction(async (reStockingTxn) => {
        const products = await updateMultipleProductStock(reStockingTxn, reStockData);
        // create re stoking record after restock
        await createReStockingRecords(reStockingTxn, products, reStockingMap, adminId);
        return products;
    });
}
function createReStockingRecords(reStockingTxn, updatedProducts, reStockingMap, adminId) {
    return reStockingTxn.reStockingRecord.createMany({
        data: updatedProducts.map((product) => {
            return {
                atCount: product.stockCount - reStockingMap[product.id],
                count: reStockingMap[product.id],
                createdById: adminId,
                productId: product.id,
            };
        }),
    });
}
function updateMultipleProductStock(reStockingTxn, reStockData) {
    return Promise.all(reStockData.map((item) => {
        // have to update each product individually
        return reStockingTxn.product.update({
            where: {
                id: item.id,
            },
            data: {
                stockCount: {
                    increment: item.stock,
                },
            },
            select: {
                id: true,
                stockCount: true,
            },
        });
    }));
}
function createRestockingRecord(reStockTxn, productId, atCount, stock, adminId) {
    return reStockTxn.reStockingRecord.create({
        data: {
            productId: productId,
            atCount: atCount,
            count: stock,
            createdById: adminId,
        },
    });
}
function updateProductStock(reStockTxn, productId, incrementBy) {
    return reStockTxn.product.update({
        where: {
            id: productId,
        },
        data: {
            stockCount: {
                increment: incrementBy,
            },
        },
    });
}
