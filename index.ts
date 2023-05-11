import { Clock, download, KVOperations } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import { Redis } from "./src/redis";

import pkg from "./package.json";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default redis options
export const DEFAULT_REDIS_HOST = 'localhost';
export const DEFAULT_REDIS_PORT = '6379';
export const DEFAULT_REDIS_DB = '0';
export const DEFAULT_REDIS_USERNAME = '';
export const DEFAULT_REDIS_PASSWORD = '';
export const DEFAULT_STORE_INTERVAL = 30;

// Custom user options interface
interface ActionOptions extends RunOptions {
    host: string,
    port: string,
    db: string,
    username: string,
    password: string,
    storeInterval: number,
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { host, port, db, username, password, storeInterval } = options;

    // Initialize Redis
    const redis = new Redis(host, port, db, username, password);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    let cache: any = {};

    substreams.on("anyMessage", async (messages: KVOperations, clock: Clock) => {
        for (const operation of messages.operations || []) {

            let key = operation.key;
            let value = new TextDecoder().decode(operation.value);
            cache[key] = value;

            if (clock.timestamp) {
                const epoch = clock.timestamp.toDate().valueOf();
                if (epoch / 1000 % storeInterval === 0) {
                    await redis.mset(cache);
                    logger.info(JSON.stringify(cache));
                    cache = {};
                }
            }
        };
    });

    substreams.start(options.delayBeforeStart);
}
