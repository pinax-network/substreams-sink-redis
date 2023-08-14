import http from "node:http";
import { logger, prometheus, commander } from "substreams-sink";

// Create a local server to serve Prometheus metrics
export const server = http.createServer(async (req, res) => {
    if (!req.url) return;
    if (req.method == "GET") {
        if (req.url === "/metrics") {
            res.writeHead(200, { 'Content-Type': prometheus.registry.contentType });
            return res.end(await prometheus.registry.metrics());
        }
    }
});

export async function listen(options: commander.RunOptions) {
    const hostname = options.hostname;
    const port = options.port;
    return new Promise(resolve => {
        server.listen(port, hostname, () => {
            logger.info("prometheus server", { hostname, port });
            resolve(true);
        });
    })
}