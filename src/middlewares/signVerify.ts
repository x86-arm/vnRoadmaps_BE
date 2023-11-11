import { NextFunction, Request, Response } from 'express';

import { HttpException, StatusCode } from 'exceptions';

import md5 from "md5"
import configs from 'configs';

export const signVerifyMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.url.includes("/auth")) {
            const genSign = (body: any) => {
                var newBody = JSON.parse(JSON.stringify(body));
                const sortKeys = [];
                let bodyHolder = "";
                newBody.secret = configs.requestBodySignSecret;
                newBody.v = "v1";
                for (const key in newBody) {
                    if (key !== "sign") {
                        sortKeys.push(key);
                    }
                }
                sortKeys.sort();
                sortKeys.forEach((key) => {
                    bodyHolder += key + newBody[key];
                });
                return md5(bodyHolder).toString();
            };

            const serverSign = genSign(req.body)
            if (serverSign !== req.body.sign || Math.floor((Date.now() - req.body.e) / 1000) > 30) {
                throw new HttpException(
                    'BadRequestError',
                    StatusCode.BadRequest.status,
                    'Sign invalid!',
                    StatusCode.BadRequest.name,
                    req.startTime
                )
            }
            const { e, n, sign, v, ...body } = req.body
            req.body = body
            next()
        }
        else {
            next()
        }
    } catch (error: any) {
        next(error)
    }
};
