#!/usr/bin/env node

import { cli } from "substreams-sink";

import { action, DEFAULT_REDIS_HOST, DEFAULT_REDIS_PORT, DEFAULT_REDIS_DB, DEFAULT_REDIS_USERNAME, DEFAULT_REDIS_PASSWORD } from "../index.js"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);

command.option('-H --host <string>', 'Redis instance host', DEFAULT_REDIS_HOST);
command.option('-p --port <string>', 'Redis instance port number', DEFAULT_REDIS_PORT);
command.option('-d --db <string>', 'Redis database', DEFAULT_REDIS_DB);
command.option('-u --username <string>', 'Username to access Redis instance', DEFAULT_REDIS_USERNAME);
command.option('-P --password <string>', 'Password to access Redis instance', DEFAULT_REDIS_PASSWORD);

command.action(action);
program.parse();
