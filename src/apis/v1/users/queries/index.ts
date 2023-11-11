import { HttpException, StatusCode } from 'exceptions';
import UserModel from 'models/schemas/User';
import { Request, NextFunction } from 'express';
import { QUERY_IGNORE, QUERY_LOCKED_IGNORE } from 'utils/constants/queries';

export const getUserinfo = async (req: Request, next: NextFunction) => {
  try {
    const _id = req.user.userID;

    const result = await UserModel.findOne({
      _id,
      ...QUERY_LOCKED_IGNORE,
    }).select(QUERY_IGNORE);

    if (!result) {
      throw new HttpException(
        'ForbiddenError',
        StatusCode.BadRequest.status,
        'Your account has been locked',
        'Locked',
        req.startTime
      );
    }

    return result;
  } catch (error) {
    next(error);
  }
};
