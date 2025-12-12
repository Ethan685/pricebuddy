import { Request } from "express";

export interface TypedRequestQuery<T = any> extends Omit<Request, 'query'> {
  query: T;
}

export interface TypedRequestBody<T = any> extends Request {
  body: T;
}

