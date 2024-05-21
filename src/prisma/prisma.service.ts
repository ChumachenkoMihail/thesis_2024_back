import { execSync } from 'child_process';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      const isAutoMigrateDisabled = process.env.IS_AUTO_MIGRATE === 'false';
      if (!isAutoMigrateDisabled) {
        console.log('Перед попыткой конекта к бд');
        await this.$connect();
        console.log('Connected to database');

        // apply migrations synchronously
        console.log('Applying migrations...');
        execSync('npx prisma migrate deploy');
        console.log('Migrations applied');
      }
    } catch (error) {
      console.error('Error connecting to database', error);
    }
  }

  async enableShutdownHooks() {
    process.on('beforeExit', async () => {
      console.log('Перед beforeExit PRISMA');
      await this.$disconnect();
      console.log('AFTER beforeExit PRISMA');
      console.log('Disconnected from database');
    });
  }
}
