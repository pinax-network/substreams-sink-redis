import { createClient } from 'redis';
import { logger, setup, http } from "substreams-sink";
import type { ActionOptions } from "./bin/cli.js";
import { handleOutput } from "./src/redis.js";
import PQueue from 'p-queue';

export async function action(options: ActionOptions) {
    // Initialize Redis
    const url = "redis://127.0.0.1:6379"
    const client = createClient({url});
    client.on('error', err => logger.error('Redis Client Error', err));

    // Setup substreams
    const { emitter } = await setup(options);

    // Connect to Redis
    await client.connect();
    logger.info("Redis connected");

    // Queue
    const queue = new PQueue({concurrency: options.concurrency});
    emitter.on("output", async (message, cursor, clock) => {
        queue.add(async () => {
            await handleOutput(client, message, cursor, clock, options);
            // logger.info("OUTPUT", message);
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
