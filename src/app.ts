import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import noCache from 'nocache';
import expressFileupload from 'express-fileupload';
import requestIp from 'request-ip';
import routers from 'apis';
import initializeResources from 'resources';
import configs from 'configs';
import { errorMiddleware } from 'middlewares/errorMiddleware';
import { logger } from 'utils/logger';
import morganMiddleware from 'utils/morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { apiRateLimiter } from 'middlewares/apiRateLimiterMiddleware';
import { signVerifyMiddleware } from 'middlewares/signVerify';

const app = express();

const corsOption = {
  credentials: true,
  origin: ['https://yourdomain.com', 'http://localhost:3000', "http://127.0.0.1:5500"],
};

app.use(cors(corsOption));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '40mb' }));
app.use(bodyParser.urlencoded({ limit: '40mb', extended: true }));
app.use(expressFileupload({ useTempFiles: false }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '100mb',
  })
);

app.set('trust proxy', true);

function initializeSecurity() {
  app.use(noCache());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(requestIp.mw());

  morganMiddleware(app);
}

function initializeMiddlewares() {
  app.use(express.json());

  // use for computing processing time on response
  app.use((req: any, _res: Response, next: NextFunction) => {
    req.startTime = Date.now();
    next();
  });
}

function initializeErrorHandler() {
  app.use(errorMiddleware);
}

function initializeApiLimiter() {
  app.use(apiRateLimiter);
}

function initializeSignVerify() {
  app.use(signVerifyMiddleware);
}


//initialize middleware
initializeSecurity();
initializeMiddlewares();
initializeApiLimiter();
initializeSignVerify();
app.use(routers);
initializeErrorHandler();

const PORT = configs.port || 3000;

export const listen = async () => {
  await initializeResources();
  app.listen(PORT, () => {
    logger.info(`=================================`);
    logger.info(
      `🚀 ⚡️[server]: Server is running at http://localhost:${PORT}`
    );
    logger.info(`=================================`);
  });
};

export default app;
