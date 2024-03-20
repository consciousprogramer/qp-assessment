import { Response } from "express"

export const sendSuccessResponse = (
  res: Response,
  message: string,
  data: any = {},
  status: 200 | 201 = 200 // will update as required
) => {
  res.status(status).json({
    message,
    data,
  })
}
