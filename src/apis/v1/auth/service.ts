/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';

import { HttpException, StatusCode } from 'exceptions';
import { forgotPasswordValidate, loginValidate, recoverPasswordValidate, usersValidate } from 'helpers/validation';
import UserModel from 'models/schemas/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from 'helpers/jwt';
import { RefreshTokenPayload } from 'types/auth';
import configs from 'configs';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { clear, get, set } from 'resources/redis';
import { uuid } from "uuidv4"
import bcrypt from 'bcrypt';


export const signup = async (req: Request, next: NextFunction) => {
  const { error } = usersValidate(req.body);
  const { email } = req.body;

  try {
    if (error)
      throw new HttpException(
        'ValidateError',
        StatusCode.BadRequest.status,
        error.details[0].message,
        StatusCode.BadRequest.name
      );

    const isExits = await UserModel.findOne({
      email,
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


export const logout = async (req: Request, next: NextFunction) => {
  try {
    await clear(req.user.userID)
    return {
      message: "Đăng xuất thành công!"
    };
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

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

    if (!email || !password) {
      return next(
        new HttpException(
          'MissingError',
          StatusCode.BadRequest.status,
          'Missing email or password',
          StatusCode.BadRequest.name
        )
      );
    }

    const lockedUser = await UserModel.findOne({ email });

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

    const user = await UserModel.findOne({ email });
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

export const forgotPassword = async (
  req: Request,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const { error } = forgotPasswordValidate(req.body);

    if (error) {
      throw new HttpException(
        'ValidateError',
        StatusCode.BadRequest.status,
        error.details[0].message.toString(),
        StatusCode.BadRequest.name
      );
    }

    if (!email) {
      return next(
        new HttpException(
          'MissingError',
          StatusCode.BadRequest.status,
          'Missing email',
          StatusCode.BadRequest.name
        )
      );
    }

    const lockedUser = await UserModel.findOne({ email });

    if (lockedUser?.is_deleted === true) {
      throw new HttpException(
        'LockedError',
        StatusCode.NotFound.status,
        'Your account has been locked',
        StatusCode.NotFound.name
      );
    }

    if (lockedUser?.is_enabled === false) {
      return {
        message: 'Your account has been disabled',
        statusCode: 'DISABLED',
      };
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new HttpException(
        'NotFoundError',
        StatusCode.NotFound.status,
        'User not registered!',
        StatusCode.NotFound.name
      );
    }

    const clientOptions = {
      username: 'DuongNamPhong', key: '602ad1ff291a27b28b80e48a558f5c48-8c9e82ec-a2784360', url: "https://api.eu.mailgun.net"
    }
    const mailgun = new Mailgun(formData);
    const mailgunClient = mailgun.client(clientOptions);
    const forgotPasswordRequestID = uuid()

    await mailgunClient.messages.create('vnroadmaps.com', {
      from: "vnRoadmaps <noreply@vnroadmaps.com>",
      to: [user.email],
      subject: "Lấy lại mật khẩu",
      html: `Liên kết lấy lại mật khẩu của bạn là: <b><a href="http://localhost:5173/recoverPassword?reqID=${forgotPasswordRequestID.toString()}">Nhấp vào đây</a></b><br>Liên kết có hiệu lực trong 60 phút`,
    })

    await set("forgotPassword:" + forgotPasswordRequestID, user._id, 3600000)

    return {
      message: "Gửi thành công link lấy lại mật khẩu đến email!"
    };
  } catch (error) {
    next(error);
  }
};

export const recoverPassword = async (
  req: Request,
  next: NextFunction
) => {
  const { reqID, newPassword } = req.body;
  try {
    const { error } = recoverPasswordValidate(req.body);

    if (error) {
      throw new HttpException(
        'ValidateError',
        StatusCode.BadRequest.status,
        error.details[0].message.toString(),
        StatusCode.BadRequest.name
      );
    }
    const forgotPasswordRequestID = await get("forgotPassword:" + reqID)
    if (!forgotPasswordRequestID) throw new HttpException(
      'NotFoundError',
      StatusCode.NotFound.status,
      'reqID không tồn tại!',
      StatusCode.NotFound.name
    );
    console.log(newPassword)

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    const user = await UserModel.findByIdAndUpdate(forgotPasswordRequestID, { password: hashPassword })

    await clear("forgotPassword:" + reqID)
    return user
  } catch (error) {
    next(error)
  }

}

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
