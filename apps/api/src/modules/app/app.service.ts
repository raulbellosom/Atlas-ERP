import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): { name: string; status: string; version: string } {
    return {
      name: 'Atlas ERP API',
      status: 'ok',
      version: 'v1',
    };
  }
}
