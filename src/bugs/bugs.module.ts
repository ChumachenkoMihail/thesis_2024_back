import { Module } from '@nestjs/common';
import { BugsService } from './bugs.service';
import { BugsController } from './bugs.controller';
import { MinioClientModule } from '../minio-client/minio-client.module';

@Module({
  providers: [BugsService],
  controllers: [BugsController],
  imports: [MinioClientModule],
})
export class BugsModule {}
