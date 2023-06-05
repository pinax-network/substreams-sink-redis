import { Clock, download, KVOperations } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import { Redis } from "./src/redis";

import pkg from "./package.json";

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
interface ActionOptions extends RunOptions {
    host: string,
    port: string,
    db: string,
    username: string,
    password: string,
    tls: boolean,
    storeInterval: number,
    prefix: string,
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { host, port, db, username, password, storeInterval, tls } = options;

    // Initialize Redis
    const redis = new Redis(host, port, db, username, password, tls);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    let tempStore: any = {};

    substreams.on("anyMessage", async (messages: KVOperations, clock: Clock) => {
        for (const operation of messages.operations || []) {

            let key = options.prefix + ":" + operation.key;
            let value = new TextDecoder().decode(operation.value);
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

    substreams.start(options.delayBeforeStart);
}
