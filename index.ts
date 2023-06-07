import { fetchSubstream } from "@substreams/core";
import { run, logger, cli } from "substreams-sink";

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
interface ActionOptions extends cli.RunOptions {
    host: string,
    port: string,
    db: string,
    username: string,
    password: string,
    tls: boolean,
    storeInterval: number,
    prefix: string,
}

export async function action(options: ActionOptions) {
    const spkg = await fetchSubstream(options.manifest!);

    // Get command options
    const { host, port, db, username, password, storeInterval, tls } = options;

    // Initialize Redis
    const redis = new Redis(host, port, db, username, password, tls);

    // Run substreams
    const substreams = run(spkg, options);

    let tempStore: any = {};

    substreams.on("anyMessage", async (messages: any, _: any, clock: any) => {
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

    substreams.start(options.delayBeforeStart);
}
