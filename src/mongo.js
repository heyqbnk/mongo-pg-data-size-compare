const {MongoClient} = require('mongodb');
const {generatePackage, ROWS_COUNT, DB_NAME, TABLE_NAME} = require('./shared');

async function init() {
  // Create Mongo client
  const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Connect client to DB
  await client.connect();

  const db = client.db(DB_NAME);

  // Delete previously added data. Drop works faster than deletion
  await db.dropCollection(TABLE_NAME);

  const users = await db.createCollection(TABLE_NAME);

  // Insert data
  const packSize = 100000;
  const iterCount = ROWS_COUNT / packSize;

  for (let i = 0; i < iterCount; i++) {
    // Generate package
    const data = generatePackage(packSize, i);

    // Insert into collection
    await users.insertMany(data);
    console.clear();
    console.log(`Pack inserted. Iteration: ${i + 1} / ${iterCount}`);
  }

  // Get data size stats
  const {size, storageSize} = await users.stats({scale: 1024});

  console.log(`Uncompressed size: ${size}kb`);
  console.log(`Compressed size: ${storageSize}kb`);
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
