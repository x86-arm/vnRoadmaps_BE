// import rateLimit from "express-rate-limit"
import { Request, Response, NextFunction } from 'express';
import { HttpException, StatusCode } from 'exceptions';
import configs from 'configs';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: Number(configs.rateLimit.limitRequestsPerSeconds),
  duration: Number(configs.rateLimit.limitPerSeconds),
  blockDuration: Number(configs.rateLimit.blockTime),
});

const apiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.clientIp || req.ip)
    .then((rateLimiterRes: RateLimiterRes) => {
      res.set({
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Limit': rateLimiter.points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next();
    })
    .catch((rateLimiterRes: RateLimiterRes) => {
      res.set({
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Limit': rateLimiter.points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next(
        new HttpException(
          'TooManyRequestError',
          StatusCode.TooManyRequests.status,
          'Too many request. Try again later',
          StatusCode.TooManyRequests.name,
          req.startTime
        )
      );
    });
};

export { apiRateLimiter };
