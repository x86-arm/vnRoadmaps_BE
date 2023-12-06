import express from 'express';
import Mailgun from 'mailgun-js';

declare global {
  namespace Express {
    interface Request {
      startTime: number;
      user: any;
      files: any;
    }
  }
}

declare module NodeJS {
  interface Global {
    mailgunClient: any
  }
}
