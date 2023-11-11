import { Router } from 'express';

import { asyncRouteHandler } from 'middlewares/asyncRouteHandler';
import { getUserinfo } from './controller';
import { loginAuthMiddleware } from 'middlewares/auth';

const router = Router();

router.post('/info', loginAuthMiddleware, asyncRouteHandler(getUserinfo));

export default router;
