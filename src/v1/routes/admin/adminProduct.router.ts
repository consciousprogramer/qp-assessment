import { Router } from "express"

import {
  adminListProductController,
  adminProductCreateController,
  adminReStockManyProductController,
  adminReStockProductController,
  adminRemoveProductController,
  adminUpdateProductController,
} from "../../controllers/admin/adminProduct.controller.js"

const adminProductRouter = Router()

adminProductRouter.get("/", adminListProductController)
adminProductRouter.post("/", adminProductCreateController)
adminProductRouter.patch("/:id", adminUpdateProductController)
adminProductRouter.delete("/:ids", adminRemoveProductController)
adminProductRouter.post("/restock/:id", adminReStockProductController)
adminProductRouter.post("/restock", adminReStockManyProductController)

export default adminProductRouter
