import * as queries from './queries';
import { ApiResponse } from 'utils/apiResponse';
import { NextFunction, Request, Response } from 'express';

export const getUserinfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await queries.getUserinfo(req, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};
