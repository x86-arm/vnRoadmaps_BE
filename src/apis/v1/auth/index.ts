import { Router } from 'express';

import { asyncRouteHandler } from 'middlewares/asyncRouteHandler';
import { login, refreshToken, signup } from './controller';

const router = Router();

router.post('/login', asyncRouteHandler(login));
router.post('/signup', asyncRouteHandler(signup));
router.post('/refresh-token', asyncRouteHandler(refreshToken));

export default router;
