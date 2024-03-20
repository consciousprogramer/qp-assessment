import { Prisma, PrismaClient } from "@prisma/client"
import prismaInstance from "../../setup/prisma.setup.js"
import { DefaultArgs } from "@prisma/client/runtime/library"

export type IPrismaTxn = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export function createOrderService(
  customerId: number
): { createdOrder: any } | PromiseLike<{ createdOrder: any }> {
  return prismaInstance.$transaction(
    async (orderTxn) => {
      const cartItems = await getCartItems(orderTxn, customerId)

      const createdOrder = await createOrder(orderTxn, cartItems, customerId)

      await clearCart(orderTxn, customerId)

      return { createdOrder }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    }
  )
}

export function getPaginatedOrderListService(
  skip: number,
  perPage: number,
  customerId: number
) {
  return prismaInstance.order.findMany({
    where: {
      userId: customerId,
    },
    skip: skip,
    take: perPage,
    orderBy: { id: "asc" },
    include: {
      orderItems: {
        select: {
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
          quantity: true,
        },
      },
    },
  })
}

async function clearCart(orderTxn: IPrismaTxn, customerId: number) {
  return orderTxn.cartItem.deleteMany({
    where: {
      userId: customerId,
    },
  })
}

async function createOrder(
  orderTxn: IPrismaTxn,
  cartItems: {
    quantity: number
    productId: number
  }[],
  customerId: number
) {
  return orderTxn.order.create({
    data: {
      userId: customerId,
      orderItems: {
        createMany: {
          data: cartItems.map((item) => {
            return {
              productId: item.productId,
              quantity: item.quantity,
            }
          }),
        },
      },
    },
  })
}

async function getCartItems(orderTxn: IPrismaTxn, customerId: number) {
  return orderTxn.cartItem.findMany({
    where: {
      userId: customerId,
    },
    select: {
      productId: true,
      quantity: true,
    },
  })
}
