import { RequestHandler, Request, Response, NextFunction } from "express"

export type IAdminRequestHandler<
  A = any,
  B = any,
  C = any,
  D = any,
  E = any
> = (
  req: Request<A, B, C, D>,
  res: Response<
    any,
    {
      admin: {
        id: number
      }
    }
  >,
  next: NextFunction
) => any

export type IAuthedUserRequestHandler<
  A = any,
  B = any,
  C = any,
  D = any,
  E = any
> = (
  req: Request<A, B, C, D>,
  res: Response<
    any,
    {
      customer: {
        id: number
      }
    }
  >,
  next: NextFunction
) => any
