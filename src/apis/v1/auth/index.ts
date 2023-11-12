import { Router } from 'express';

import { asyncRouteHandler } from 'middlewares/asyncRouteHandler';
import { login, refreshToken, signup, forgotPassword, recoverPassword, logout } from './controller';
import { loginAuthMiddleware } from 'middlewares/auth';

const router = Router();

router.post('/login', asyncRouteHandler(login));
router.post('/signup', asyncRouteHandler(signup));
router.post('/logout', loginAuthMiddleware, asyncRouteHandler(logout));
router.post('/refresh-token', asyncRouteHandler(refreshToken));
router.post('/forgotPassword', asyncRouteHandler(forgotPassword));
router.post('/recoverPassword', asyncRouteHandler(recoverPassword));

export default router;
