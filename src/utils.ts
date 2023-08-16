import type { ActionOptions } from "../bin/cli.js";
import type { Labels } from "./redis.js";
import type { Clock } from "@substreams/core/proto"

export function toTimestamp(clock: Clock) {
    if (!clock.timestamp) throw new Error("Clock is required");
    const seconds = Number(clock.timestamp.seconds) * 1000;
    const nanos = Number(clock.timestamp.nanos) / 1000000;
    return seconds + nanos;
}

export function parseKeyPrefix(key: string, prefix?: string) {
    if (!prefix) return key;
    return `${prefix}:${key}`
}

export function parseKeyLabels(key: string, labels: Labels) {
    const suffix = Object.keys(labels).map(label => `${label}:${labels[label]}`).join(":")
    if ( suffix ) return `${key}:${suffix}`
    return key;
}

export function parseKey(name: string, options: ActionOptions, labels?: Labels) {
    let prefix = parseKeyPrefix(name, options.kvPrefix);
    if (labels && Object.keys(labels).length) return parseKeyLabels(prefix, labels);
    return prefix;
}