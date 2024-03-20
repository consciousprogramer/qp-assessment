import express from "express"
import prismaInstance from "./prisma.setup.js"
import { USER_TYPE } from "@prisma/client"

const app = express()

app.use(express.json())

app.listen(process.env.PORT, async () => {
  console.log(`Server running on [PORT :: ${process.env.PORT}]`)

  const admin = await prismaInstance.user.findFirst({
    where: {
      username: "admin",
      userType: USER_TYPE.ADMIN,
    },
  })

  if (!admin) {
    const newAdmin = await prismaInstance.user.create({
      data: {
        name: "admin",
        userType: USER_TYPE.ADMIN,
        username: "admin",
        password: "testing123",
      },
    })
    console.log("Default Admin Created", newAdmin)
  }

  const customer = await prismaInstance.user.findFirst({
    where: {
      username: "customer",
      userType: USER_TYPE.CUSTOMER,
    },
  })

  if (!customer) {
    const newCustomer = await prismaInstance.user.create({
      data: {
        name: "customer one",
        userType: USER_TYPE.CUSTOMER,
        username: "customer",
        password: "testing123",
      },
    })
    console.log("Default customer Created", newCustomer)
  }

  if (admin) console.log("Default admin already exists ✅")
  if (customer) console.log("Default customer already exists ✅")
})

export default app
