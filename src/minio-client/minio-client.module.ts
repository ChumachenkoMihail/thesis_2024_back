import { Module, Global, DynamicModule } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { MinioClientController } from './minio-client.controller';
import { MinioClientService } from './minio-client.service';

@Global()
@Module({
  controllers: [MinioClientController],
  providers: [
    {
      provide: 'MINIO_CONNECTION',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Client => {
        return new Client({
          endPoint: configService.get('MINIO_ENDPOINT'),
          port: parseInt(configService.get('MINIO_PORT')),
          useSSL: configService.get('MINIO_USE_SSL') === 'true',
          accessKey: configService.get('MINIO_ACCESS_KEY'),
          secretKey: configService.get('MINIO_SECRET_KEY'),
        });
      },
    },
    MinioClientService,
  ],
  exports: [MinioClientService],
})
export class MinioClientModule {}
