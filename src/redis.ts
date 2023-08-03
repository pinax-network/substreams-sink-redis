import { TimeSeriesDuplicatePolicies } from "redis";
import type { RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts } from "redis";
import type { Clock } from "@substreams/core/proto"
import { logger } from "substreams-sink";
import { toTimestamp } from "./utils.js";

export type Redis = RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

export declare type Labels = {
    [label: string]: string;
};

export function ADD(client: Redis, key: string, value: number, clock: Clock, labels: Labels) {
    const timestamp = toTimestamp(clock);
    logger.info("ADD", {key, timestamp, value, labels});
    return client.ts.ADD(key, timestamp, value, {ON_DUPLICATE: TimeSeriesDuplicatePolicies.SUM, LABELS: labels})
}

export function SET(client: Redis, key: string, value: string|number) {
    logger.info("SET", {key, value});
    return client.SET(key, value);
}
