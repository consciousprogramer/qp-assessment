import { RequestHandler, Router } from "express"
import adminProductRouter from "./adminProduct.router.js"
import prismaInstance from "../../setup/prisma.setup.js"


const rootAdminRouter = Router()

rootAdminRouter.use("/product", adminProductRouter)

export default rootAdminRouter
