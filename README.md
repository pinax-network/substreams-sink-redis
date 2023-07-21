# [`Substreams`](https://substreams.streamingfast.io/) [Redis](https://redis.com/) CLI `Node.js`

[<img alt="github" src="https://img.shields.io/badge/Github-substreams.redis-8da0cb?style=for-the-badge&logo=github" height="20">](https://github.com/pinax-network/substreams-sink-redis)
[<img alt="npm" src="https://img.shields.io/npm/v/substreams-sink-redis.svg?style=for-the-badge&color=CB0001&logo=npm" height="20">](https://www.npmjs.com/package/substreams-sink-redis)
[<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/pinax-network/substreams-sink-redis/ci.yml?branch=main&style=for-the-badge" height="20">](https://github.com/pinax-network/substreams-sink-redis/actions?query=branch%3Amain)

> `substreams-sink-redis` is a tool that allows developers to pipe data extracted from a blockchain to a Redis KV store.

## 📖 Documentation

### https://www.npmjs.com/package/substreams-sink-redis

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)
- [**Redis** documentation](https://redis.io/docs/about/)

### Protobuf

- [`sf.substreams.sink.kv.v1.KVOperations`](https://github.com/streamingfast/substreams-sink-kv/blob/develop/proto/substreams/sink/kv/v1/kv.proto)

## [Pre-built binaries**](https://github.com/pinax-network/substreams-sink-redis/releases)
- MacOS
- Linux
- Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-redis
```

**Run**
```
$ substreams-sink-redis run --help

Usage: substreams-sink-redis run [options]

Substreams redis sink module

Options:
  Usage: substreams-sink-redis run [options]

Substreams redis sink module

Options:
  -e --substreams-endpoint <string>       Substreams gRPC endpoint to stream data from
  --manifest <string>                     URL of Substreams package
  --module-name <string>                  Name of the output module (declared in the manifest)
  -s --start-block <int>                  Start block to stream from (defaults to -1, which means the initialBlock of the first module you are streaming)
  -t --stop-block <int>                   Stop block to end stream at, inclusively
  -p, --params <string...>                Set a params for parameterizable modules. Can be specified multiple times. (ex: -p module1=valA -p module2=valX&valY)
  --substreams-api-token <string>         API token for the substream endpoint
  --substreams-api-token-envvar <string>  Environnement variable name of the API token for the substream endpoint (ex: SUBSTREAMS_API_TOKEN)
  --delay-before-start <int>              [OPERATOR] Amount of time in milliseconds (ms) to wait before starting any internal processes, can be used to perform to maintenance on the pod before actually letting it starts
  --cursor-file <string>                  cursor lock file (ex: cursor.lock)
  --disable-production-mode               Disable production mode, allows debugging modules logs, stops high-speed parallel processing
  --restart-inactivity-seconds <int>      If set, the sink will restart when inactive for over a certain amount of seconds (ex: 60)
  --hostname <string>                     The process will listen on this hostname for any HTTP and Prometheus metrics requests (ex: localhost)
  --port <int>                            The process will listen on this port for any HTTP and Prometheus metrics requests (ex: 9102)
  --verbose                               Enable verbose logging
  -H --redis-host <string>                Redis instance host (default: "localhost")
  -P --redis-port <string>                Redis instance port number (default: "6379")
  -d --db <string>                        Redis database (default: "0")
  --username <string>                     Username to access Redis instance (default: "")
  --password <string>                     Password to access Redis instance (default: "")
  -T --tls                                Use TLS to connect to the Redis instance (default: false)
  -i --store-interval <int>               Interval in seconds, based on sf.substreams.v1.Clock, at which the data is stored in the KV database (default: "30")
  --prefix <string>                       Prefix to add to the key in the KV database (default: "")
  -h, --help                              display help for command
```

## Features

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart

### Redis

- [x] set
- [x] mset