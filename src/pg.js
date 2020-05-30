const knex = require('knex');
const {generatePackage, ROWS_COUNT, DB_NAME, TABLE_NAME} = require('./shared');

function formatData(data) {
  return data.map(({createdAt, ...rest}) => ({
    ...rest,
    createdAt: createdAt.toISOString()
  }));
}

async function init() {
  // Create pg client
  const client = knex({
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: '1',
      database: DB_NAME
    }
  });

  const isAlreadyCreated = await client.schema.hasTable(TABLE_NAME);

  if (!isAlreadyCreated) {
    await client.schema.createTableIfNotExists(TABLE_NAME, table => {
      table.increments('_id');
      table.integer('vkUserId').notNullable();
      table.text('name').notNullable();
      table.text('profileImageUrl').notNullable();
      table.boolean('isBanned').notNullable();
      table.dateTime('createdAt').notNullable();
    });
  }

  // Delete previously added data
  await client.delete().from(TABLE_NAME);

  // Insert data
  const packSize = 10000;
  const iterCount = ROWS_COUNT / packSize;

  for (let i = 0; i < iterCount; i++) {
    // Generate package
    const data = generatePackage(packSize, i);
    const formatted = formatData(data);

    // Insert into table
    await client.insert(formatted).into(TABLE_NAME);
    console.clear();
    console.log(`Pack inserted. Iteration: ${i + 1} / ${iterCount}`);
  }

  // Get data size
  const {
    rows: [{size}]
  } = await client.raw(`select pg_relation_size('${TABLE_NAME}') as size`);

  console.log(`Uncompressed size: ${Math.floor(size / 1024)}kb`);
}

init()
  .then(() => {
    console.log('Script completed!');
    process.exit(0);
  })
  .catch(e => {
    console.log('Script failed', e);
    process.exit(1);
  });
