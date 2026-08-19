import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger('UploadService');
  private configured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.configured = true;
    } else {
      this.logger.warn('Cloudinary credentials not set — file uploads will fail until configured.');
    }
  }

  async uploadBuffer(buffer: Buffer, folder = 'task-management'): Promise<string> {
    if (!this.configured) {
      throw new InternalServerErrorException(
        'File upload is not configured on the server (missing Cloudinary credentials).',
      );
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException(error?.message || 'Upload failed'),
            );
          }
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }
}
