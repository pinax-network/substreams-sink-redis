import { logger } from "substreams-sink";
import { Redis as IoRedis } from "ioredis";

export class Redis {
    private readonly client: IoRedis;

    constructor(host: string, port: string, db: string, username: string, password: string) {
        this.client = new IoRedis(`redis://${username}:${password}@${host}:${port}/${db}`);
        this.client.on('error', (err) => {
            logger.error(err);
            throw err;
        });
    }

    public async set(key: string, value: any) {
        await this.client.set(key, value);
    }
}