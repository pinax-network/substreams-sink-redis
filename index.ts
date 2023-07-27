import { createClient } from 'redis';
import { logger, setup } from "substreams-sink";
import pkg from "./package.json" assert { type: "json" };
import type { ActionOptions } from "./bin/cli.js";
import { handleOutput } from "./src/redis.js";
import PQueue from 'p-queue';

export async function action(options: ActionOptions) {
    // Initialize Redis
    const url = "redis://127.0.0.1:6379"
    const client = createClient({url});
    client.on('error', err => logger.error('Redis Client Error', err));
    await client.connect();
    logger.info("Redis connected");

    // Setup substreams
    const { emitter } = await setup(options, pkg);

    // Queue
    const queue = new PQueue({concurrency: options.concurrency});

    emitter.on("output", async (message, cursor, clock) => {
        queue.add(async () => {
            await handleOutput(client, message, cursor, clock, options);
            // logger.info("OUTPUT", message);
        })
    });
    await emitter.start();
    logger.info("Checking if queue is empty...");
    await queue.onEmpty();
    logger.info("Disconnecting...");
    await client.disconnect();
    logger.info("Exit");
    process.exit();
}
