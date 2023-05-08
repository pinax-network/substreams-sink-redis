import { download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import pkg from "./package.json";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default redis options

// Custom user options interface
interface ActionOptions extends RunOptions { }

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { } = options;

    // Redis options

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (messages: any) => { });

    substreams.start(options.delayBeforeStart);
}
