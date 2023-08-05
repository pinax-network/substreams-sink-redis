import type { RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts } from "redis";
import type { Clock } from "@substreams/core/proto"
import type { Message, AnyMessage } from "@bufbuild/protobuf"
import type { KVOperation, KVOperations } from "./generated/sf/substreams/sink/kv/v1/kv_pb.js";
import type { PrometheusOperation, PrometheusOperations, PrometheusCounter, PrometheusGauge } from "substreams-sink-prometheus";
import type { ActionOptions } from "../bin/cli.js";
import { ADD, SET } from "./redis.js";
import { parseKey, toTimestamp } from "./utils.js";

export type Redis = RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

export async function handleOutput(client: Redis, message: Message<AnyMessage>, cursor: string, clock: Clock, options: ActionOptions ) {
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

export async function handlePrometheusOperation(client: Redis, operation: PrometheusOperation, clock: Clock, options: ActionOptions) {
    switch (operation.operation.case) {
        case "counter":
            return handlePrometheusCounter(client, operation.toJson() as any, clock, options);
        case "gauge":
            return handlePrometheusGauge(client, operation.toJson() as any, clock, options);
    }
}

export async function handlePrometheusCounter(client: Redis, operation: PrometheusCounter, clock: Clock, options: ActionOptions) {
    const key = parseKey(operation.name, options, operation.labels);
    // https://github.com/pinax-network/substreams-sink-prometheus.rs/blob/main/proto/substreams/sink/prometheus/v1/prometheus.proto#L48
    switch (operation.counter.operation) {
        case "OPERATION_ADD":
            return ADD(client, key, operation.counter.value, clock, operation.labels, options);
        case "OPERATION_INC":
            return ADD(client, key, 1, clock, operation.labels, options);
    }
}

export async function handlePrometheusGauge(client: Redis, operation: PrometheusGauge, clock: Clock, options: ActionOptions) {
    const key = parseKey(operation.name, options, operation.labels);
    // https://github.com/pinax-network/substreams-sink-prometheus.rs/blob/main/proto/substreams/sink/prometheus/v1/prometheus.proto#L23
    switch (operation.gauge.operation) {
        case "OPERATION_ADD":
            return ADD(client, key, operation.gauge.value, clock, operation.labels, options);
        case "OPERATION_INC":
            return ADD(client, key, 1, clock, operation.labels, options);
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
