import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  getFileUrl(filename: string): string {
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    return `${appUrl}/uploads/${filename}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (e) {}
  }
}
