const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

let mongoServer;
let client;
let db;

// Setup before all tests
async function setupTestDB() {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to the in-memory database
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('COP4331Cards');

    return { client, db };
}

// Teardown after all tests
async function teardownTestDB() {
    if (client) {
        await client.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
}

// Clear all collections between tests
async function clearDatabase() {
    if (db) {
        const collections = await db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
}

module.exports = {
    setupTestDB,
    teardownTestDB,
    clearDatabase
};
