import { Injectable, Logger, Inject } from '@nestjs/common';
import { Client } from 'minio';
@Injectable()
export class MinioClientService {
  private readonly logger = new Logger(MinioClientService.name);
  constructor(
    @Inject('MINIO_CONNECTION') private readonly minioClient: Client,
  ) {}

  async saveFile(bucket: string, objectName: string, fileBuffer: any) {
    return await this.minioClient.putObject(bucket, objectName, fileBuffer);
  }
  async getBugAttachments(bucketName: string, fileNames: string[]) {
    if (fileNames.length === 0) {
      this.logger.warn(`No images to get from bucket: [${bucketName}]...`);
    }

    const filePromises = fileNames.map(async (fileName) => {
      try {
        return await this.getImageBase64(bucketName, fileName);
      } catch (error) {
        this.logger.error(JSON.stringify(error));
        return null; // возвращаем null для отклоненных промисов
      }
    });

    const files = await Promise.all(filePromises);
    console.log(files);
    return files;
    // return files.filter((image): image is string => image !== null);
  }

  async getImageBase64(bucketName: string, imageName: string) {
    try {
      const dataStream = await this.minioClient.getObject(
        bucketName,
        imageName,
      );

      const chunks = [];
      for await (const chunk of dataStream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      return buffer;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async getAttachmentLink(bucketName: string, objectName: string) {
    return await this.minioClient.presignedGetObject(bucketName, objectName);
  }
}
