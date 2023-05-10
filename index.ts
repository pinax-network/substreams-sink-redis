import { download, KVOperations } from "substreams";
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

// Custom user options interface
interface ActionOptions extends RunOptions {
    host: string,
    port: string,
    db: string,
    username: string,
    password: string,
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { host, port, db, username, password } = options;

    // Initialize Redis
    const redis = new Redis(host, port, db, username, password);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (messages: KVOperations) => {
        for (const operation of messages.operations || []) {
            console.log(operation);
        };
    });

    substreams.start(options.delayBeforeStart);
}
