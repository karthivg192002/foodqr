import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    constructor(configService: ConfigService);
    getFileUrl(filename: string): string;
    deleteFile(filePath: string): Promise<void>;
}
