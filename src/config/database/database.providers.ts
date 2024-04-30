import { DatabaseConfig } from './../config';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'typeorm';
import { DATABASE_CONNECTION } from 'src/constant/provider';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (config: ConfigService) => {
      const dbConfig = config.get<DatabaseConfig>('database');
      return await createConnection({
        type: 'oracle',
        username: dbConfig.username,
        password: dbConfig.password,
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: false,
        // database: dbConfig.name,
        sid: dbConfig.sid,
        host: dbConfig.host,
        port: dbConfig.port,
        logging: true,
      });
    },
    inject: [ConfigService],
  },
];
