import { logger } from "substreams-sink";
import { Redis as IoRedis } from "ioredis";

export class Redis {
    private readonly client: IoRedis;
    private readonly host: string;
    private readonly port: string;
    private readonly db: string;

    private isInit: boolean = false;

    constructor(host: string, port: string, db: string, username: string, password: string) {
        this.host = host;
        this.port = port;
        this.db = db;
        this.client = new IoRedis(`redis://${username}:${password}@${host}:${port}/${db}`, { maxRetriesPerRequest: 1, });
    }

    public async init() {
        this.isInit = true;
    }

}