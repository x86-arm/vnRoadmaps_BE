import { Response } from 'express';

export class ApiResponse<T> {
  data: T = {} as T;
  message = 'Successfully!';
  status = 200;
  time = Date.now();

  constructor(data?: T, message?: string, status?: number, startTime?: number) {
    data && (this.data = data);
    message && (this.message = message);
    status && (this.status = status);
    startTime && (this.time -= startTime);
  }

  public send(res: Response): void {
    res.status(this.status).json({
      data: this.data,
      message: this.message,
      status: this.status,
      time: this.time,
    });
  }
}
