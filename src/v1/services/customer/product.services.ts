import prismaInstance from "../../setup/prisma.setup.js"

export function getPaginatedProductListService(skip: number, perPage: number) {
  return prismaInstance.product.findMany({
    skip: skip,
    take: perPage,
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      visualDiscount: true,
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
  })
}

export function getProduct(id: number) {
  return prismaInstance.product.findUnique({
    where: {
      id,
    },
    select: {
      createdById: false,
      productMedias: {
        where: {
          active: true,
        },
        select: {
          id: true,
          mediaType: true,
          src: true,
        },
      },
    },
  })
}
