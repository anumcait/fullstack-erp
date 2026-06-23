const { Client } = require("pg");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForDB() {
    const dbConfig = {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "hrdb",
        port: process.env.DB_PORT || 5432,
    };

    let connected = false;

    console.log(`🔍 Checking database connectivity at ${dbConfig.host}:${dbConfig.port}...`);

    for (let i = 0; i < 60; i++) {
        const client = new Client(dbConfig);
        try {
            await client.connect();

            // Verification query to ensure DB is actually responding
            await client.query("SELECT 1");

            await client.end();
            console.log("✅ Database is ready and reachable.");
            connected = true;
            break;
        } catch (err) {
            if (err.message.includes("starting up") || err.message.includes("recovery mode")) {
                console.log(`⏳ DB is in recovery mode or starting up. Patience... (${i + 1}/60)`);
            } else if (err.message.includes("ENOTFOUND")) {
                console.log(`⏳ DNS/Network not ready yet... (${i + 1}/60)`);
            } else {
                console.log(`⏳ Waiting for DB... attempt ${i + 1}/60 (${err.message})`);
            }

            // Ensure client is closed on failure
            try { await client.end(); } catch (e) { }
            await sleep(2000);
        }
    }

    if (!connected) {
        console.error("❌ Database not reachable after 60 retries. Exiting.");
        process.exit(1);
    }
}

module.exports = waitForDB;
