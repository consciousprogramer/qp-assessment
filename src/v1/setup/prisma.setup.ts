import { PrismaClient } from "@prisma/client"

let prismaInstance = new PrismaClient({
  errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
  transactionOptions: {
    isolationLevel: "ReadUncommitted", // set default as ReadUncommitted
  },
})

export default prismaInstance
