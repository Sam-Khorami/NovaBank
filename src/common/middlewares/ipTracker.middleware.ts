import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from "express";
import { IpService } from '../ip/ip.service';

@Injectable()
export class IpTrackerMiddleware implements NestMiddleware {
  
  constructor (private ipService: IpService) {}

  async use(request: Request, res: Response, next: NextFunction) {
  
    await this.ipService.ipTracker(request.ip!);
    next();
  
  }
}
