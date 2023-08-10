#!/usr/bin/env node

import pkg from "../package.json" assert { type: "json" };
import { commander, logger } from "substreams-sink";
import { Option } from "commander";
import { action } from "../index.js"
import { DEFAULT_KV_BUCKET_DURATION, DEFAULT_KV_RETENTION_PERIOD, DEFAULT_KV_URL } from "../src/config.js";

// Custom user options interface
export interface ActionOptions extends commander.RunOptions {
    kvUrl: string;
    kvPrefix: string;
    kvRetentionPeriod: number;
    kvBucketDuration: number;
}

const program = commander.program(pkg);
commander.run(program, pkg)
    .addOption(new Option("--kv-url <string>", "KV_URL").env("KV_URL").default(DEFAULT_KV_URL))
    .addOption(new Option('--kv-prefix <string>', 'Prefix to add to the key in the KV database').env("KV_PREFIX"))
    .addOption(new Option('--kv-retention-period <number>', 'Is maximum retention period, compared to the maximum existing timestamp, in milliseconds.').env("KV_RETENTION_PERIOD").default(DEFAULT_KV_RETENTION_PERIOD))
    .addOption(new Option('--kv-bucket-duration <number>', 'Is duration of each timeseries bucket, in milliseconds.').env("KV_BUCKET_DURATION").default(DEFAULT_KV_BUCKET_DURATION))
    .action(action);
logger.setName(pkg.name);
program.parse();
