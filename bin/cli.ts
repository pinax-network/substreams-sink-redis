#!/usr/bin/env node

import pkg from "../package.json" assert { type: "json" };
import { commander, logger } from "substreams-sink";
import { Option } from "commander";
import { action } from "../index.js"
import { DEFAULT_KV_URL } from "../src/config.js";

// Custom user options interface
export interface ActionOptions extends commander.RunOptions {
    // kvUrl: string;
    // kvRestApiUrl: number;
    // kvRestApiToken: string;
    // kvRestApiReadOnlyToken: string;
    // kvPrefix: string;
    // concurrency: number;
    kvUrl: string;
    kvPrefix: string;
}

const program = commander.program(pkg);
commander.run(program, pkg)
    .addOption(new Option("--kv-url <string>", "KV_URL").env("KV_URL").default(DEFAULT_KV_URL))
    .addOption(new Option('--kv-prefix <string>', 'Prefix to add to the key in the KV database').env("KV_PREFIX"))
    // .addOption(new Option("--kv-rest-api-url <string>", "KV_REST_API_URL").env("KV_REST_API_URL"))
    // .addOption(new Option("--kv-rest-api-token <string>", "KV_REST_API_TOKEN").env("KV_REST_API_TOKEN"))
    // .addOption(new Option("--kv-rest-api-read-only-token <string>", "KV_REST_API_READ_ONLY_TOKEN").env("KV_REST_API_READ_ONLY_TOKEN"))
    // .addOption(new Option('--kv-store-interval <int>', 'Interval in seconds, based on sf.substreams.v1.Clock, at which the data is stored in the KV database').default(1).env("KV_STORE_INTERVAL"))
    // .addOption(new Option("--concurrency <number>", "Concurrency of requests").env("CONCURRENCY").default(1))

    // .option('-H --redis-host <string>', 'Redis instance host', DEFAULT_REDIS_HOST)
    // .option('-P --redis-port <string>', 'Redis instance port number', DEFAULT_REDIS_PORT)
    // .option('-d --db <string>', 'Redis database', DEFAULT_REDIS_DB)
    // .option('--username <string>', 'Username to access Redis instance', DEFAULT_REDIS_USERNAME)
    // .option('--password <string>', 'Password to access Redis instance', DEFAULT_REDIS_PASSWORD)
    // .option('-T --tls', 'Use TLS to connect to the Redis instance', DEFAULT_REDIS_TLS)
    .action(action);
logger.setName(pkg.name);
program.parse();
