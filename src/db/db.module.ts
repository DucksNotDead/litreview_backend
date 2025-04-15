import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import { DBService } from './db.service';

@Global()
@Module({
  providers: [
    {
      provide: 'MYSQL_POOL',
      useFactory: async (configService: ConfigService) => {
        return createPool({
          host: configService.get<string>('DB_HOST'),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      },
      inject: [ConfigService],
    },
    DBService,
  ],
  exports: ['MYSQL_POOL', DBService],
})
export class DbModule {}
