import prismaInstance from "../../setup/prisma.setup.js"

export async function addToCartService(
  productId: number,
  quantity: number,
  customerId: number
) {
  const product = await fetchProductStock(productId)

  if (!product) {
    throw new Error("product does not exists!")
  }

  const cartItem = await fetchCartItemQuantity(productId, customerId)

  if (cartItem) {
    throw new Error("product already exists in your cart!")
  }

  // if stock is less than required quantity, throw error
  if (product.stockCount < quantity) {
    throw new Error(`Only ${product.stockCount} item are available.`)
  }

  await createCartItem(productId, quantity, customerId)
}

export async function incrementCartItemQuantityService(
  productId: number,
  quantity: number,
  customerId: number
) {
  // fetch the product, for latest stock count
  const product = await fetchProductStock(productId)

  if (!product) {
    throw new Error("product does not exists!")
  }

  const cartItem = await fetchCartItemQuantity(productId, customerId)

  // if the product was not in the cart then add into the cart
  if (!cartItem) {
    if (product.stockCount < quantity) {
      throw new Error(`Only ${product.stockCount} item are available.`)
    }

    await createCartItem(productId, quantity, customerId)

    return {
      action: "Created",
    }
  }

  if (product.stockCount < quantity + cartItem.quantity) {
    throw new Error(`Only ${product.stockCount} item are available.`)
  }

  await changeCartItemQuantity(productId, quantity, customerId, "INCREMENT")

  return {
    action: "Incremented",
  }
}

export async function decrementCartItemQuantityService(
  productId: number,
  quantity: number,
  customerId: number
) {
  const cartItem = await fetchCartItemQuantity(productId, customerId)

  if (!cartItem) {
    throw new Error("product not is it your cart!")
  }

  // if quantity become less than 1, than remove the product
  if (cartItem.quantity - quantity <= 0) {
    await deleteCartItem(productId, customerId)

    return {
      action: "deleted",
    }
  }

  // decrease quantity
  await changeCartItemQuantity(productId, quantity, customerId, "DECREMENT")

  return {
    action: "decrement",
  }
}

export function getPaginatedCustomerCartItemListService(
  skip: number,
  perPage: number,
  customerId: number
) {
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
  })
}

export function deleteCartItem(productId: number, customerId: number) {
  return prismaInstance.cartItem.delete({
    where: {
      productId_userId: {
        productId,
        userId: customerId,
      },
    },
  })
}

export function changeCartItemQuantity(
  productId: number,
  quantity: number,
  customerId: number,
  action: "INCREMENT" | "DECREMENT"
) {
  return prismaInstance.cartItem.update({
    where: {
      productId_userId: {
        productId,
        userId: customerId,
      },
    },
    data: {
      quantity:
        action === "INCREMENT"
          ? {
              increment: quantity,
            }
          : {
              decrement: quantity,
            },
    },
  })
}

export function fetchCartItemQuantity(productId: number, customerId: number) {
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
  })
}

export function createCartItem(
  productId: number,
  quantity: number,
  customerId: number
) {
  return prismaInstance.cartItem.create({
    data: {
      productId,
      userId: customerId,
      quantity,
    },
  })
}

export function fetchProductStock(productId: number) {
  return prismaInstance.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      stockCount: true,
    },
  })
}
