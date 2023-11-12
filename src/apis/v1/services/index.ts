import { Router } from 'express';
import { asyncRouteHandler } from 'middlewares/asyncRouteHandler';
import { getProvince, getProvinceSlug } from './controller';
import { loginAuthMiddleware } from 'middlewares/auth';

const router = Router();

router.use('/getProvince/:slug', loginAuthMiddleware, asyncRouteHandler(getProvince));
router.use('/getProvinceSlug', loginAuthMiddleware, asyncRouteHandler(getProvinceSlug));

export default router;
