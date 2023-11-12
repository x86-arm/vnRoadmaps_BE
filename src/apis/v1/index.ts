import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import servicesRouter from './services';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/services', servicesRouter);

export default router;
