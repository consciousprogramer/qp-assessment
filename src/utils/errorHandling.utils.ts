import { Prisma } from "@prisma/client"
import { ErrorRequestHandler } from "express"

export const expressErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  console.error("Error Caught :\n", error)
  if (process.env.NODE_ENV === "development") {
    return res.json({ message: error?.message })
  } else {
    return res.json("something went wrong.")
  }
}
