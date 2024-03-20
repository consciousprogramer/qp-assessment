import { PRODUCT_MEDIA_TYPE, Prisma, Product } from "@prisma/client"
import { IAdminRequestHandler } from "../../interfaces/requestHandlers.js"
import {
  adminCreateProductService,
  adminDeleteProductService,
  adminProductListService,
  adminReStockManyProductService,
  adminReStockProductService,
  adminUpdateManyProductService,
} from "../../services/admin/adminProduct.services.js"

export const adminProductCreateController: IAdminRequestHandler<
  {},
  {},
  {
    title: string
    description: string
    price: number
    initialStockCount: number
    media: { type: PRODUCT_MEDIA_TYPE; src: string }[]
  }
> = async (req, res, next) => {
  try {
    const adminId = res.locals.admin.id

    const { title, description, initialStockCount, price, media } = req.body

    const createdProduct = await adminCreateProductService(
      adminId,
      title,
      description,
      price,
      initialStockCount,
      media
    )

    return res.json({
      message: "products created successfully",
      data: createdProduct,
    })
  } catch (error) {
    next(error)
  }
}

export const adminListProductController: IAdminRequestHandler<
  {},
  {},
  {},
  {
    filters: {
      query: string
      price: { gte: number; lte: number } | undefined
      stockCount: { gte: number; lte: number } | undefined
    }
    sortOn: keyof Pick<Product, "id" | "createdAt" | "price" | "stockCount">
    sortOrder: "asc" | "desc"
    page: number
    perPage: number
  }
> = async (req, res, next) => {
  try {
    let { filters, page, perPage, sortOn, sortOrder } = req.query

    page = +page
    perPage = +perPage

    const skip = (page - 1) * perPage
    const orderBy = { [sortOn]: sortOrder }

    const products = await adminProductListService(
      filters,
      skip,
      perPage,
      orderBy
    )

    return res.status(200).json({
      message: "products fetched successfully",
      data: products,
      page,
      perPage,
      sortOn,
      sortOrder,
    })
  } catch (error) {
    next(error)
  }
}

export const adminRemoveProductController: IAdminRequestHandler<{
  ids: string
}> = async (req, res, next) => {
  try {
    const productIds = req.params.ids.split(",").map((id) => +id) as number[]

    const deletedProducts = await adminDeleteProductService(productIds)

    return res.status(200).json({
      message: "products deleted successfully.",
      data: deletedProducts,
    })
  } catch (error) {
    next(error)
  }
}

export const adminUpdateProductController: IAdminRequestHandler<
  {},
  {},
  {
    where: Prisma.ProductWhereInput
    data: Omit<
      Prisma.ProductCreateInput,
      "productMedias" | "reStockingRecords" | "createdBy"
    >
  }
> = async (req, res, next) => {
  try {
    const { where, data } = req.body

    const deletedProduct = await adminUpdateManyProductService(where, data)

    return res.status(200).json({
      message: "products deleted successfully.",
      data: deletedProduct,
    })
  } catch (error) {
    next(error)
  }
}

export const adminReStockProductController: IAdminRequestHandler<
  { id: number },
  {},
  { stock: number }
> = async (req, res, next) => {
  try {
    const { stock } = req.body
    const { id: productId } = req.params

    const adminId = res.locals.admin.id

    const updatedProduct = await adminReStockProductService(
      +productId,
      stock,
      adminId
    )

    return res.status(200).json({
      message: "product re-stocked successfully.",
      data: updatedProduct,
    })
  } catch (error) {
    next(error)
  }
}

export const adminReStockManyProductController: IAdminRequestHandler<
  {},
  {},
  [{ id: number; stock: number }]
> = async (req, res, next) => {
  try {
    const reStockData = req.body

    // id to stock map for efficient product stock lookup
    const reStockingMap = req.body.reduce((acc, curr) => {
      acc[curr.id] = curr.stock
      return acc
    }, {} as Record<string, number>)

    const adminId = res.locals.admin.id

    // product stock update and re-stocking record creation in a transaction
    const updatedProducts = await adminReStockManyProductService(
      reStockData,
      reStockingMap,
      adminId
    )

    return res.status(200).json({
      message: "products re-stocked successfully.",
      data: updatedProducts,
    })
  } catch (error) {
    next(error)
  }
}
