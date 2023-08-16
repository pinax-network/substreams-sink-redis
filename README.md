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

Substreams Redis sink module

Options:
  -e --substreams-endpoint <string>    Substreams gRPC endpoint to stream data from (env: SUBSTREAMS_ENDPOINT)
  --manifest <string>                  URL of Substreams package (env: MANIFEST)
  --module-name <string>               Name of the output module (declared in the manifest) (env: MODULE_NAME)
  -s --start-block <int>               Start block to stream from (defaults to -1, which means the initialBlock of the first module you are streaming) (default: "-1", env: START_BLOCK)
  -t --stop-block <int>                Stop block to end stream at, inclusively (env: STOP_BLOCK)
  -p, --params <string...>             Set a params for parameterizable modules. Can be specified multiple times. (ex: -p module1=valA -p module2=valX&valY) (default: [], env: PARAMS)
  --substreams-api-token <string>      API token for the substream endpoint or API key if '--auth-issue-url' is specified (default: "", env: SUBSTREAMS_API_TOKEN)
  --auth-issue-url <string>            URL used to issue a token (default: "https://auth.pinax.network/v1/auth/issue", env: AUTH_ISSUE_URL)
  --delay-before-start <int>           Delay (ms) before starting Substreams (default: 0, env: DELAY_BEFORE_START)
  --cursor-path <string>               File path or URL to cursor lock file (default: "cursor.lock", env: CURSOR_PATH)
  --disable-production-mode            Disable production mode, allows debugging modules logs, stops high-speed parallel processing (default: false, env: DISABLE_PRODUCTION_MODE)
  --restart-inactivity-seconds <int>   If set, the sink will restart when inactive for over a certain amount of seconds (default: 300, env: RESTART_INACTIVITY_SECONDS)
  --hostname <string>                  The process will listen on this hostname for any HTTP and Prometheus metrics requests (default: "localhost", env: HOSTNAME)
  --port <int>                         The process will listen on this port for any HTTP and Prometheus metrics requests (default: 9102, env: PORT)
  --metrics-labels [string...]         To apply generic labels to all default metrics (ex: --labels foo=bar) (default: {}, env: METRICS_LABELS)
  --collect-default-metrics <boolean>  Collect default metrics (default: false, env: COLLECT_DEFAULT_METRICS)
  --headers [string...]                Set headers that will be sent on every requests (ex: --headers X-HEADER=headerA) (default: [], env: HEADERS)
  --verbose                            Enable verbose logging (default: false, env: VERBOSE)
  --kv-url <string>                    KV_URL (default: "redis://127.0.0.1:6379", env: KV_URL)
  --kv-prefix <string>                 Prefix to add to the key in the KV database. (env: KV_PREFIX)
  --kv-retention-period <number>       Is maximum retention period, compared to the maximum existing timestamp, in milliseconds. (default: 604800000, env: KV_RETENTION_PERIOD)
  --kv-bucket-duration <number>        Is duration of each timeseries bucket, in milliseconds. (default: 86400000, env: KV_BUCKET_DURATION)
  --kv-create-rules                    Create timeseries bucket and rules. (default: false, env: KV_CREATE_RULES)
  -h, --help                           display help for command
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