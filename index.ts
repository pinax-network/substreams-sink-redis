import { createClient } from 'redis';
import { logger, setup, http } from "substreams-sink";
import type { ActionOptions } from "./bin/cli.js";
import { handleClock, handleCursor, handleOutput } from "./src/handlers.js";
import PQueue from 'p-queue';
import * as stdout from "./src/stdout.js"

export async function action(options: ActionOptions) {
    if (!options.verbose) stdout.manager.hook();

    // Initialize Redis
    const client = createClient({url: options.kvUrl});
    client.on('error', err => logger.error('Redis Client Error', err));

    // Setup substreams
    const { emitter } = await setup(options);

    // Connect to Redis
    await client.connect();
    logger.info("Redis connected");

    // Queue
    const queue = new PQueue({concurrency: 10});
    let lastUpdate = Date.now();
    emitter.on("output", async (message, cursor, clock) => {
        queue.add(async () => handleOutput(client, message, cursor, clock, options));

        // Only update clock/cursor every second (reduces Redis load)
        if (Date.now() - lastUpdate > 1000) {
            stdout.update(clock, [`  Redis queue size: ${queue.size}`]);
            lastUpdate = Date.now();
            queue.add(async () => handleClock(client, clock, options));
            queue.add(async () => handleCursor(client, cursor, options));
        }
    });
    await http.listen(options);
    await emitter.start();
    console.log("Checking if queue is empty...");
    await queue.onEmpty();
    console.log("Disconnecting...");
    await client.disconnect();
    console.log("Exit");
    process.exit();
}
