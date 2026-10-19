// Production entry (`npm start`): make sure the database is set up (see setup-db.mjs), then start the standalone server.
await import("./setup-db.mjs");
await import("./start-standalone.mjs");
