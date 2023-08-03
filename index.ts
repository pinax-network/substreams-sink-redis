import { createClient } from 'redis';
import { logger, setup, http } from "substreams-sink";
import type { ActionOptions } from "./bin/cli.js";
import { handleClock, handleCursor, handleOutput } from "./src/handlers.js";
import PQueue from 'p-queue';

export async function action(options: ActionOptions) {
    // Initialize Redis
    const client = createClient({url: options.kvUrl});
    client.on('error', err => logger.error('Redis Client Error', err));

    // Setup substreams
    const { emitter } = await setup(options);

    // Connect to Redis
    await client.connect();
    logger.info("Redis connected");

    // Queue
    const queue = new PQueue({concurrency: 1});
    emitter.on("output", async (message, cursor, clock) => {
        queue.add(async () => {
            await handleOutput(client, message, cursor, clock, options);
            await handleClock(client, clock, options);
            await handleCursor(client, cursor, options);
        })
    });
    await http.listen(options);
    await emitter.start();
    logger.info("Checking if queue is empty...");
    // await queue.onEmpty();
    logger.info("Disconnecting...");
    await client.disconnect();
    logger.info("Exit");
    process.exit();
}
