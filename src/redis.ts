import { TimeSeriesDuplicatePolicies, TimeSeriesAggregationType } from "redis";
import type { RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts, ErrorReply } from "redis";
import type { Clock } from "@substreams/core/proto"
import { logger } from "substreams-sink";
import { toTimestamp } from "./utils.js";
import type { ActionOptions } from "../bin/cli.js";

export type Redis = RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

export declare type Labels = {
    [label: string]: string;
};

export function TS_CREATE(client: Redis, key: string, options: ActionOptions) {
    logger.info("TS.CREATE", { key });
    return client.ts.CREATE(key, { RETENTION: options.kvRetentionPeriod });
}

export function TS_CREATERULE(client: Redis, sourceKey: string, destinationKey: string, options: ActionOptions) {
    logger.info("TS.CREATERULE", { sourceKey, destinationKey, aggregation: TimeSeriesAggregationType.SUM, bucketDuration: options.kvBucketDuration });
    return client.ts.CREATERULE(sourceKey, destinationKey, TimeSeriesAggregationType.SUM, options.kvBucketDuration);
}

export async function TS_ADD(client: Redis, key: string, value: number, clock: Clock, labels: Labels, options: ActionOptions) {
    const timestamp = toTimestamp(clock);

    if (options.kvCreateRules) {
        const destinationKey = `${key}:${options.kvBucketDuration}:sum`;

        if (!(await client.EXISTS(destinationKey))) {
            await TS_CREATE(client, destinationKey, options);
        }
        try {
            await TS_CREATERULE(client, key, destinationKey, options);
        } catch (error: any) {
            logger.warn(error);
        }
    }

    logger.info("TS.ADD", { key, timestamp, value, labels });
    return client.ts.ADD(key, timestamp, value, { ON_DUPLICATE: TimeSeriesDuplicatePolicies.SUM, LABELS: labels, RETENTION: options.kvRetentionPeriod });
}

// https://redis.io/commands/set/
export function SET(client: Redis, key: string, value: string | number) {
    logger.info("SET", { key, value });
    return client.SET(key, value);
}

// https://redis.io/commands/get/
export function GET(client: Redis, params: URLSearchParams) {
    const key = params.get("key");
    if (!key) throw new Error(`[key] is required`);
    logger.info("GET", { key });
    return client.GET(key);
}

// https://redis.io/commands/info/
export function INFO(client: Redis) {
    logger.info("INFO");
    return client.INFO();
}

// https://redis.io/commands/ts.info/
export async function TS_INFO(client: Redis, params: URLSearchParams) {
    const key = params.get("key");
    if (!key) throw new Error(`[key] is required`);
    logger.info("TS.INFO", { key });
    return client.ts.INFO(key);
}

// https://redis.io/commands/ts.range/
export function TS_RANGE(client: Redis, params: URLSearchParams) {
    const key = params.get("key");
    const fromTimestamp = params.get("fromTimestamp");
    const toTimestamp = params.get("toTimestamp");
    if (!key) throw new Error(`[key] is required`);
    if (!fromTimestamp) throw new Error(`[fromTimestamp] is required`);
    if (!toTimestamp) throw new Error(`[toTimestamp] is required`);
    logger.info("TS.RANGE", params);
    return client.ts.RANGE(key, fromTimestamp, toTimestamp);
}
