import JWT from 'jsonwebtoken';
import configs from 'configs';
import { get, set } from 'resources/redis';

export const signAccessToken = async (userID: string, role: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userID,
      role,
    };

    const secret = configs.jwt.accessTokenSecret;

    const options = {
      expiresIn: configs.jwt.accessTokenExpireIn,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      return resolve(token);
    });
  });
};

export const signRefreshToken = async (userID: string, role: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userID,
      role,
    };

    const secret = configs.jwt.refreshTokenSecret;

    const options = {
      expiresIn: configs.jwt.refreshTokenExpireIn,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      set(userID, token, Number(configs.jwt.refreshTokenExpireIn) * 1000)
      return resolve(token);
    });
  });
};

export const verifyRefreshToken = (refreshToken: string) => {
  return new Promise((resolve, reject) => {
    const secret = configs.jwt.refreshTokenSecret;
    JWT.verify(refreshToken, secret, (err, payload: any) => {
      if (err) reject(err);
      try {
        get(payload.userID)
        return resolve(payload);
      }
      catch {
        reject("RefeshToken not in redis!!")
      }
    });
  });
};
