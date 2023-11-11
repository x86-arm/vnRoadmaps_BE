import configs from '../configs';
import connectMongoDB from './mongodb';
import { redis } from './redis';
import { logger } from 'utils/logger';

export default async () => {
  if (configs.mongodb.host || configs.mongodb.uri) {
    await connectMongoDB();
  } else {
    logger.info('MongoDB will not connect! Api may response incorrectly');
  }
  if (configs.redisHost) {
    logger.info(`Redis status: ${redis.status}`);
  }
};
