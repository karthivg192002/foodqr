import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: Express.Multer.File): {
        filename: string;
        url: string;
    };
    uploadImages(files: Express.Multer.File[]): {
        filename: string;
        url: string;
    }[];
}
