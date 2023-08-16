import type { RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts } from "redis";
import type { Clock } from "@substreams/core/proto"
import type { Message, AnyMessage } from "@bufbuild/protobuf"
import type { KVOperation, KVOperations } from "./generated/sf/substreams/sink/kv/v1/kv_pb.js";
import type { PrometheusOperation, PrometheusOperations, PrometheusCounter, PrometheusGauge } from "substreams-sink-prometheus";
import type { ActionOptions } from "../bin/cli.js";
import { TS_ADD, SET, TS_CREATE, TS_CREATERULE } from "./redis.js";
import { parseKey, toTimestamp } from "./utils.js";
import { logger } from "substreams-sink";

export type Redis = RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

export async function handleOutput(client: Redis, message: Message<AnyMessage>, cursor: string, clock: Clock, options: ActionOptions) {
    const type = await message.getType();
    switch (type.typeName.toString()) {
        case "pinax.substreams.sink.prometheus.v1.PrometheusOperations":
            return handlePrometheusOperations(client, message as any, clock, options);
        case "sf.substreams.sink.kv.v1.KVOperations":
            return handleKVOperations(client, message as any, clock, options);
    }
}

export function handleClock(client: Redis, clock: Clock, options: ActionOptions) {
    return Promise.all([
        SET(client, parseKey("clock:timestamp", options), toTimestamp(clock)),
        SET(client, parseKey("clock:number", options), Number(clock.number))
    ]);
}

export function handleCursor(client: Redis, cursor: string, options: ActionOptions) {
    return SET(client, parseKey("cursor", options), cursor);
}

export async function handlePrometheusOperations(client: Redis, message: PrometheusOperations, clock: Clock, options: ActionOptions) {
    const operations = message?.operations || [];
    return Promise.all(operations.map(operation => {
        handlePrometheusOperation(client, operation, clock, options)
    }));
}

// global cache, stores all newly created keys
const keys = new Set<string>();

export async function createRules(client: Redis, key: string, options: ActionOptions) {
    if (options.kvCreateRules) {
        const destinationKey = `${key}:${options.kvBucketDuration}:sum`;

        // Check if key already exists
        if (keys.has(destinationKey)) return;
        if (await client.EXISTS(destinationKey)) {
            keys.add(destinationKey);
            return;
        }
        // Create Key
        await TS_CREATE(client, destinationKey, options);

        // Create Rule
        try {
            await TS_CREATERULE(client, key, destinationKey, options);
        } catch (error: any) {
            logger.warn(error);
        }
        keys.add(destinationKey);
    }
}

export async function handlePrometheusOperation(client: Redis, operation: PrometheusOperation, clock: Clock, options: ActionOptions) {
    const key = parseKey(operation.name, options, operation.labels);
    await createRules(client, key, options);
    switch (operation.operation.case) {
        case "counter":
            return await handlePrometheusCounter(client, key, operation.toJson() as any, clock, options);
        case "gauge":
            return await handlePrometheusGauge(client, key, operation.toJson() as any, clock, options);
    }
}

export async function handlePrometheusCounter(client: Redis, key: string, operation: PrometheusCounter, clock: Clock, options: ActionOptions) {
    // https://github.com/pinax-network/substreams-sink-prometheus.rs/blob/main/proto/substreams/sink/prometheus/v1/prometheus.proto#L48
    switch (operation.counter.operation) {
        case "OPERATION_ADD":
            return await TS_ADD(client, key, operation.counter.value, clock, operation.labels, options);
        case "OPERATION_INC":
            return await TS_ADD(client, key, 1, clock, operation.labels, options);
    }
}

export async function handlePrometheusGauge(client: Redis, key: string, operation: PrometheusGauge, clock: Clock, options: ActionOptions) {
    // https://github.com/pinax-network/substreams-sink-prometheus.rs/blob/main/proto/substreams/sink/prometheus/v1/prometheus.proto#L23
    switch (operation.gauge.operation) {
        case "OPERATION_ADD":
            return TS_ADD(client, key, operation.gauge.value, clock, operation.labels, options);
        case "OPERATION_INC":
            return TS_ADD(client, key, 1, clock, operation.labels, options);
        // TO-DO: Set gauge value
        // TO-DO: Remove gauge value
    }
}

export async function handleKVOperations(client: Redis, message: KVOperations, clock: Clock, options: ActionOptions) {
    const operations = message?.operations || [];
    return Promise.all(operations.map(operation => {
        handleKVOperation(client, operation, clock, options)
    }));
}

export async function handleKVOperation(client: Redis, operation: KVOperation, clock: Clock, options: ActionOptions) {
    const key = parseKey(operation.key, options);
    const value = Buffer.from(operation.value).toString();
    return SET(client, key, value);
}
