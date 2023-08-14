import { URLSearchParams } from "url";
import * as http from "../substreams-sink/http.js"
import { banner } from './banner.js';
import type { Redis } from './redis.js';
import { TS_INFO, INFO, TS_RANGE, GET } from './redis.js';
import type { IncomingMessage, ServerResponse } from "http";

export function serve(client: Redis) {
    http.server.on("request", async (req, res) => {
        if (!req.url) return;
        const params = new URLSearchParams(req.url.split("?")[1] ?? "");
        try {
            if (req.method == "GET") {
                if (req.url === "/") return toText(res, banner());
                if (req.url.startsWith("/GET")) return toText(res, await GET(client, params));
                if (req.url.startsWith("/INFO")) return toJSON(res, await INFO(client));
                if (req.url.startsWith("/TS/INFO")) return toJSON(res, await TS_INFO(client, params));
                if (req.url.startsWith("/TS/RANGE")) return toJSON(res, await TS_RANGE(client, params));
            }
            throw new Error(`invalid request`);
        } catch (err: any) {
            res.statusCode = 400;
            return res.end(err.message);
        }
    });
}

function toText(res: ServerResponse<IncomingMessage>, data: any) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(data);
}

function toJSON(res: ServerResponse<IncomingMessage>, data: any) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data, null, 2));
}