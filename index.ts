import { setup, logger, commander } from "substreams-sink";

import { Redis } from "./src/redis.js";

import pkg from "./package.json" assert { type: "json" };

logger.setName(pkg.name);
export { logger };

// default redis options
export const DEFAULT_REDIS_HOST = 'localhost';
export const DEFAULT_REDIS_PORT = '6379';
export const DEFAULT_REDIS_DB = '0';
export const DEFAULT_REDIS_USERNAME = '';
export const DEFAULT_REDIS_PASSWORD = '';
export const DEFAULT_REDIS_TLS = false;
export const DEFAULT_STORE_INTERVAL = 30;
export const DEFAULT_PREFIX = '';

// Custom user options interface
interface ActionOptions extends commander.RunOptions {
    redisHost: string,
    redisPort: number,
    db: string,
    username: string,
    password: string,
    tls: boolean,
    storeInterval: number,
    prefix: string,
}

export async function action(options: ActionOptions) {
    // Get command options
    const { redisHost, redisPort, db, username, password, storeInterval, tls } = options;

    // Initialize Redis
    const redis = new Redis(redisHost, redisPort, db, username, password, tls);

    // Setup substreams
    const { emitter } = await setup(options, pkg);

    let tempStore: any = {};

    emitter.on("anyMessage", async (messages: any, _: any, clock: any) => {
        for (const operation of messages.operations || []) {

            let key = options.prefix ? options.prefix + ":" + operation.key : operation.key;
            let value = operation.value;
            tempStore[key] = value;

            if (clock.timestamp) {
                const epoch = clock.timestamp.toDate().valueOf();
                if (storeInterval <= 0 || epoch / 1000 % storeInterval === 0) {
                    await redis.mset(tempStore);
                    logger.info(JSON.stringify(tempStore));
                    tempStore = {};
                }
            }
        };
    });

    emitter.start();
}
