import { TimeSeriesDuplicatePolicies } from "redis";
import type { RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts } from "redis";
import type { Clock } from "@substreams/core/proto"
import type { Message, AnyMessage } from "@bufbuild/protobuf"
import type { KVOperation, KVOperations } from "./generated/sf/substreams/sink/kv/v1/kv_pb.js";
import type { PrometheusOperation, PrometheusOperations, PrometheusCounter, PrometheusGauge } from "substreams-sink-prometheus";
import type { ActionOptions } from "../bin/cli.js";

export type Redis = RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

export async function handleOutput(client: Redis, message: Message<AnyMessage>, cursor: string, clock: Clock, options: ActionOptions ) {
    const type = await message.getType();
    switch (type.typeName.toString()) {
        case "pinax.substreams.sink.prometheus.v1.PrometheusOperations":
            handlePrometheusOperations(client, message as any, clock);
            break;
        case "sf.substreams.sink.kv.v1.KVOperations":
            handleKVOperations(client, message as any, clock);
            break;
    }
}

export async function handlePrometheusOperations(client: Redis, message: PrometheusOperations, clock: Clock) {
    for ( const operation of message?.operations || []) {
        await handlePrometheusOperation(client, operation, clock);
    }
}

export async function handlePrometheusOperation(client: Redis, operation: PrometheusOperation, clock: Clock) {
    switch (operation.operation.case) {
        case "counter":
            handlePrometheusCounter(client, operation.toJson() as any, clock);
            break;
        case "gauge":
            handlePrometheusGauge(client, operation.toJson() as any, clock);
            break;
    }
}

export async function handlePrometheusCounter(client: Redis, operation: PrometheusCounter, clock: Clock) {
    console.log("COUNTER", operation);
    // https://github.com/pinax-network/substreams-sink-prometheus.rs/blob/main/proto/substreams/sink/prometheus/v1/prometheus.proto#L48
    switch (operation.counter.operation) {
        case "OPERATION_ADD":
            ADD(client, operation.name, operation.counter.value, clock);
            break;
        case "OPERATION_INC":
            ADD(client, operation.name, 1, clock);
    }
}

export async function handlePrometheusGauge(client: Redis, operation: PrometheusGauge, clock: Clock) {
    console.log("GAUGE", operation);
    // https://github.com/pinax-network/substreams-sink-prometheus.rs/blob/main/proto/substreams/sink/prometheus/v1/prometheus.proto#L23
    switch (operation.gauge.operation) {
        case "OPERATION_ADD":
            ADD(client, operation.name, operation.gauge.value, clock);
            break;
        case "OPERATION_INC":
            ADD(client, operation.name, 1, clock);
    }
}

export async function handleKVOperations(client: Redis, message: KVOperations, clock: Clock) {
    for ( const operation of message?.operations || []) {
        await handleKVOperation(client, operation, clock);
    }
}

export async function handleKVOperation(client: Redis, operation: KVOperation, clock: Clock) {
    const value = Buffer.from(operation.value).toString();
    SET(client, operation.key, value);
}
function toTimestamp(clock: Clock) {
    if ( !clock.timestamp ) throw new Error("Clock is required");
    console.log(clock);
    const seconds = Number(clock.timestamp.seconds) * 1000;
    const nanos = Number(clock.timestamp.nanos) / 1000000;
    return seconds + nanos;
}

export function ADD(client: Redis, key: string, value: number, clock: Clock) {
    const timestamp = toTimestamp(clock);
    console.log("ADD", {key, timestamp, value});
    client.ts.ADD(key, timestamp, value, {ON_DUPLICATE: TimeSeriesDuplicatePolicies.SUM})
}

export function SET(client: Redis, key: string, value: string) {
    console.log("SET", {key, value});
    client.SET(key, value);
}

export function parseKeyPrefix(key: string, prefix?: string) {
    if ( !prefix ) return key;
    return `${prefix}:${key}`
}