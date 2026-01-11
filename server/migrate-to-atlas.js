import mongoose from 'mongoose';

// Source: Local MongoDB
const LOCAL_DB_URL = 'mongodb://localhost:27017/youtube-clone';

// Destination: MongoDB Atlas
const ATLAS_DB_URL = 'mongodb+srv://modiaastha01_db_user:ansh@cluster0.mmgqkij.mongodb.net/yourtube?appName=Cluster0';

async function migrateData() {
  console.log('🚀 Starting migration from Local MongoDB to Atlas...\n');

  try {
    // Connect to local MongoDB
    console.log('📦 Connecting to LOCAL MongoDB...');
    const localConnection = await mongoose.createConnection(LOCAL_DB_URL).asPromise();
    console.log('✅ Connected to LOCAL MongoDB\n');

    // Connect to Atlas
    console.log('☁️  Connecting to MongoDB ATLAS...');
    const atlasConnection = await mongoose.createConnection(ATLAS_DB_URL).asPromise();
    console.log('✅ Connected to MongoDB ATLAS\n');

    // Get all collection names from local DB
    const collections = await localConnection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections to migrate:\n`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n🔄 Migrating collection: ${collectionName}`);

      // Get all documents from local collection
      const localCollection = localConnection.db.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      
      console.log(`   Found ${documents.length} documents`);

      if (documents.length > 0) {
        // Get atlas collection
        const atlasCollection = atlasConnection.db.collection(collectionName);
        
        // Clear existing data in atlas collection (optional - comment out if you want to keep existing data)
        await atlasCollection.deleteMany({});
        console.log(`   Cleared existing data in Atlas`);
        
        // Insert all documents to atlas
        await atlasCollection.insertMany(documents);
        console.log(`   ✅ Migrated ${documents.length} documents to Atlas`);
      } else {
        console.log(`   ⏭️  Skipping (no documents)`);
      }
    }

    // Close connections
    await localConnection.close();
    await atlasConnection.close();

    console.log('\n\n🎉 Migration completed successfully!');
    console.log('📝 Your MongoDB Atlas now has all the data from your local database.');
    console.log('\n⚡ Restart your server to see the videos!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your local MongoDB is running!');
      console.log('   Run: mongod or start MongoDB Compass');
    }
    
    process.exit(1);
  }
}

migrateData();
