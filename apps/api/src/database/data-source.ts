import { DataSource, DataSourceOptions } from 'typeorm';
import { sharedDatabase } from '../config/database.config';

export const dataSourceOptions: DataSourceOptions = {
  ...sharedDatabase,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
  dropSchema: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
