import morgan from 'morgan';
import { Express, Request } from 'express';

morgan.token('ip', function getIp(req: Request) {
  return req.clientIp;
});

const developmentEnvironment = (app: Express) => {
  return app.use(
    morgan(
      'dev'
    )
  );
};

const productionEnvironment = (app: Express) => {
  return app.use(
    morgan(
      ':ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    )
  );
};

const morganMiddleware = (app: Express) => {
  return process.env.NODE_ENV === 'production'
    ? productionEnvironment(app)
    : developmentEnvironment(app);
};

export default morganMiddleware;
