import { TimeSeriesDuplicatePolicies, TimeSeriesAggregationType } from "redis";
import type { RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts } from "redis";
import type { Clock } from "@substreams/core/proto"
import { logger } from "substreams-sink";
import { toTimestamp } from "./utils.js";
import type { ActionOptions } from "../bin/cli.js";

export type Redis = RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

export declare type Labels = {
    [label: string]: string;
};

export function CREATE(client: Redis, key: string, options: ActionOptions) {
    logger.info("CREATE", { key });
    return client.ts.CREATE(key, { RETENTION: options.kvRetentionPeriod });
}

export function CREATERULE(client: Redis, key: string, options: ActionOptions) {
    const destinationKey = `${key}:${options.kvBucketDuration}:sum`;
    logger.info("CREATERULE", { sourceKey: key, destinationKey, aggregation: TimeSeriesAggregationType.SUM, bucketDuration: options.kvBucketDuration });
    return client.ts.CREATERULE(key, destinationKey, TimeSeriesAggregationType.SUM, options.kvBucketDuration);
}

export function ADD(client: Redis, key: string, value: number, clock: Clock, labels: Labels, options: ActionOptions) {
    const timestamp = toTimestamp(clock);
    logger.info("ADD", { key, timestamp, value, labels });
    return client.ts.ADD(key, timestamp, value, { ON_DUPLICATE: TimeSeriesDuplicatePolicies.SUM, LABELS: labels, RETENTION: options.kvRetentionPeriod });
}

export function SET(client: Redis, key: string, value: string | number) {
    logger.info("SET", { key, value });
    return client.SET(key, value);
}
