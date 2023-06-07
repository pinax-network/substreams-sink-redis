#!/usr/bin/env node

import { cli } from "substreams-sink";

import { action, DEFAULT_REDIS_HOST, DEFAULT_REDIS_PORT, DEFAULT_REDIS_DB, DEFAULT_REDIS_USERNAME, DEFAULT_REDIS_PASSWORD, DEFAULT_REDIS_TLS, DEFAULT_STORE_INTERVAL, DEFAULT_PREFIX } from "../index.js"
import pkg from "../package.json" assert { type: "json" };

const program = cli.program(pkg);
const command = cli.option(program, pkg);

command.option('-H --host <string>', 'Redis instance host', DEFAULT_REDIS_HOST);
command.option('-P --port <string>', 'Redis instance port number', DEFAULT_REDIS_PORT);
command.option('-d --db <string>', 'Redis database', DEFAULT_REDIS_DB);
command.option('--username <string>', 'Username to access Redis instance', DEFAULT_REDIS_USERNAME);
command.option('--password <string>', 'Password to access Redis instance', DEFAULT_REDIS_PASSWORD);
command.option('-T --tls', 'Use TLS to connect to the Redis instance', DEFAULT_REDIS_TLS);
command.option('-i --store-interval <int>', 'Interval in seconds, based on sf.substreams.v1.Clock, at which the data is stored in the KV database', String(DEFAULT_STORE_INTERVAL));
command.option('--prefix <string>', 'Prefix to add to the key in the KV database', DEFAULT_PREFIX);

command.action(action);
program.parse();
