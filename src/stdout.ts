import UpdateManager from 'stdout-update';
import type { Clock } from "@substreams/core/proto"

export const manager = UpdateManager.getInstance();
export const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
export function hook() {
    manager.hook();
}

export function frame(clock: Clock) {
    return frames[Number(clock.number) % frames.length];
}

let lastUpdate = Date.now();
let lastBlock = 0;
export function update(clock: Clock, messages?: string[]) {
    const rate = Math.floor((Number(clock.number) - lastBlock) / (Date.now() - lastUpdate) * 1000);
    manager.update([`${frame(clock)} Clock: ${clock.number} (${rate}/block/s)`, ...messages ?? []]);
    lastBlock = Number(clock.number);
    lastUpdate = Date.now();
}
