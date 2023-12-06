import { NextFunction, Request, Response } from 'express';

import { ApiResponse } from 'utils/apiResponse';
import * as service from './service';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await service.login(req, res, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await service.signup(req, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await service.forgotPassword(req, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};
export const recoverPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await service.recoverPassword(req, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await service.refreshToken(req, res, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = await service.logout(req, next);
  if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};
