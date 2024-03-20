import { PRODUCT_MEDIA_TYPE, Prisma } from "@prisma/client"
import prismaInstance from "../../setup/prisma.setup.js"
import { IPrismaTxn } from "../customer/order.services.js"

export function adminCreateProductService(
  adminId: number,
  title: string,
  description: string,
  price: number,
  initialStockCount: number,
  media: { type: PRODUCT_MEDIA_TYPE; src: string }[]
) {
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
            }
          }),
        },
      },
    },
  })
}

export function adminProductListService(
  filters: {
    query: string
    price: { gte: number; lte: number } | undefined
    stockCount: { gte: number; lte: number } | undefined
  },
  skip: number,
  perPage: number,
  orderBy: { [x: string]: "asc" | "desc" }
) {
  const whereQuery: Prisma.ProductWhereInput = {}

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
    ]
  }

  if (filters?.price) {
    whereQuery["price"] = filters.price
  }

  if (filters?.stockCount) {
    whereQuery["price"] = filters.price
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
  })
}

export function adminDeleteProductService(productIds: number[]) {
  return prismaInstance.product.deleteMany({
    where: {
      id: {
        in: productIds,
      },
    },
  })
}

export function adminUpdateManyProductService(
  where: Prisma.ProductWhereInput,
  data: Omit<
    Prisma.ProductCreateInput,
    "productMedias" | "reStockingRecords" | "createdBy"
  >
) {
  return prismaInstance.product.updateMany({
    where,
    data,
  })
}

export function adminReStockProductService(
  productId: number,
  stock: number,
  adminId: number
) {
  return prismaInstance.$transaction(async (reStockTxn) => {
    const product = await updateProductStock(reStockTxn, productId, stock)

    await createRestockingRecord(
      reStockTxn,
      productId,
      product.stockCount - stock,
      stock,
      adminId
    )

    return product
  })
}

export function adminReStockManyProductService(
  reStockData: [{ id: number; stock: number }],
  reStockingMap: Record<string, number>,
  adminId: number
) {
  return prismaInstance.$transaction(async (reStockingTxn) => {
    const products = await updateMultipleProductStock(
      reStockingTxn,
      reStockData
    )
    // create re stoking record after restock
    await createReStockingRecords(
      reStockingTxn,
      products,
      reStockingMap,
      adminId
    )

    return products
  })
}

function createReStockingRecords(
  reStockingTxn: IPrismaTxn,
  updatedProducts: {
    id: number
    stockCount: number
  }[],
  reStockingMap: Record<string, number>,
  adminId: number
) {
  return reStockingTxn.reStockingRecord.createMany({
    data: updatedProducts.map((product) => {
      return {
        atCount: product.stockCount - reStockingMap[product.id],
        count: reStockingMap[product.id],
        createdById: adminId,
        productId: product.id,
      }
    }),
  })
}

function updateMultipleProductStock(
  reStockingTxn: IPrismaTxn,
  reStockData: [{ id: number; stock: number }]
) {
  return Promise.all(
    reStockData.map((item) => {
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
      })
    })
  )
}

function createRestockingRecord(
  reStockTxn: IPrismaTxn,
  productId: number,
  atCount: number,
  stock: number,
  adminId: number
) {
  return reStockTxn.reStockingRecord.create({
    data: {
      productId: productId,
      atCount: atCount,
      count: stock,
      createdById: adminId,
    },
  })
}

function updateProductStock(
  reStockTxn: IPrismaTxn,
  productId: number,
  incrementBy: number
) {
  return reStockTxn.product.update({
    where: {
      id: productId,
    },
    data: {
      stockCount: {
        increment: incrementBy,
      },
    },
  })
}
