import { NextFunction, Request, Response } from 'express';

import { ApiResponse } from 'utils/apiResponse';
import * as service from './service';

export const getProvince = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const result = await service.getProvince(req, next);
    if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};
export const getProvinceSlug = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const result = await service.getProvinceSlug(req, next);
    if (result) new ApiResponse(result, 'OK', 200, req.startTime).send(res);
};