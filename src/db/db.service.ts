import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, PoolConnection } from 'mysql2/promise';
import { useNormalizedParams } from '../../shared/utils/useNormalizedParams';

@Injectable()
export class DBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DBService.name);
  constructor(@Inject('MYSQL_POOL') private readonly pool: Pool) {}

  async onModuleInit() {
    this.logger.log('MySQL pool initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('MySQL pool closed');
  }

  async query<T extends { id: number }>(
    originalSQL: string,
    originalParams?: unknown[],
  ): Promise<T[]> {
    const normalizedParams = useNormalizedParams(originalSQL, originalParams);

    const mappedSQL = originalSQL.replace(/\$\d/g, '?');

    try {
      const [rows] = await this.pool.query(`${mappedSQL};`, normalizedParams);
      return rows as T[];
    } catch (error) {
      this.logger.debug({
        originalSQL,
        mappedSQL,
        originalParams,
        normalizedParams,
      });
      throw error;
    }
  }

  async item<T extends { id: number }>(
    sql: string,
    params?: any[],
  ): Promise<T> {
    return (await this.query<T>(sql, params))[0];
  }

  async create<T extends { id: number }>(
    sql: string,
    params?: unknown[],
    fields: string = '*',
  ) {
    await this.item(sql, params);
    const { id } = await this.item('SELECT LAST_INSERT_ID() as id');
    const tableName = sql.split('INSERT INTO ')[1].split(' ')[0];
    return this.item<T>(`SELECT ${fields} FROM ${tableName} WHERE id = $1`, [
      id,
    ]);
  }

  async transaction<T>(
    callback: (conn: PoolConnection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
