import dataSource from './data-source';
import { seedPermissions, seedRoles, seedUsers } from './seeder/user.seeder';

async function main() {
  try {
    await dataSource.initialize();
    console.log('Database connected for seeding...\n');

    await seedPermissions(dataSource);
    await seedRoles(dataSource);
    await seedUsers(dataSource);

    console.log('\nAll seeds completed!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

void main();
