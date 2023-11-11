/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';

import { HttpException, StatusCode } from 'exceptions';
import { loginValidate, usersValidate } from 'helpers/validation';
import UserModel from 'models/schemas/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from 'helpers/jwt';
import { RefreshTokenPayload } from 'types/auth';
import configs from 'configs';

export const signup = async (req: Request, next: NextFunction) => {
  const { error } = usersValidate(req.body);
  const { username } = req.body;

  try {
    if (error)
      throw new HttpException(
        'ValidateError',
        StatusCode.BadRequest.status,
        error.details[0].message,
        StatusCode.BadRequest.name
      );

    const isExits = await UserModel.findOne({
      username,
    });

    if (isExits) {
      throw new HttpException(
        'CreateError',
        StatusCode.BadRequest.status,
        'Username is aready',
        StatusCode.BadRequest.name
      );
    }

    const user = new UserModel(req.body);

    const result = await user.save();

    const { password, is_deleted, is_enabled, role, ...res } =
      result.toObject();

    return res;
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const { error } = loginValidate(req.body);

    if (error) {
      throw new HttpException(
        'ValidateError',
        StatusCode.BadRequest.status,
        error.details[0].message.toString(),
        StatusCode.BadRequest.name
      );
    }

    if (!username || !password) {
      return next(
        new HttpException(
          'MissingError',
          StatusCode.BadRequest.status,
          'Missing username or password',
          StatusCode.BadRequest.name
        )
      );
    }

    const lockedUser = await UserModel.findOne({ username });

    if (lockedUser?.is_deleted === true) {
      throw new HttpException(
        'LockedError',
        StatusCode.NotFound.status,
        'Your account has been locked',
        StatusCode.NotFound.name
      );
    }

    if (lockedUser?.is_enabled === false) {
      const accessToken = await signAccessToken(
        lockedUser._id,
        lockedUser.role
      );
      const refreshToken = await signRefreshToken(
        lockedUser._id,
        lockedUser.role
      );
      return {
        tokens: {
          accessToken,
          refreshToken,
        },
        message: 'Your account has been disabled',
        statusCode: 'DISABLED',
      };
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new HttpException(
        'NotFoundError',
        StatusCode.NotFound.status,
        'User not registered!',
        StatusCode.NotFound.name
      );
    }

    const isValid = await user.schema.methods.isCheckPassword(password, user);
    if (!isValid) {
      throw new HttpException(
        'NotFoundError',
        StatusCode.Unauthorized.status,
        'Incorrect password',
        StatusCode.Unauthorized.name
      );
    }

    const accessToken = await signAccessToken(user._id, user.role);
    const refreshToken = await signRefreshToken(user._id, user.role);

    res.cookie('accessToken', accessToken, {
      maxAge: Number(configs.jwt.accessTokenExpireIn),
      httpOnly: false,
    });
    res.cookie('refreshToken', refreshToken, {
      maxAge: Number(configs.jwt.refreshTokenExpireIn),
      httpOnly: false,
    });

    return {
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, next: NextFunction) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      throw new HttpException(
        'NotFoundError',
        StatusCode.NotFound.status,
        'Missing refreshToken',
        StatusCode.NotFound.name
      );
    }

    const payload: RefreshTokenPayload | any = await verifyRefreshToken(
      refreshToken
    );

    const accessToken = await signAccessToken(payload.userID, payload.role);
    return {
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    next(error);
  }
};
