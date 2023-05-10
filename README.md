# [`Substreams`](https://substreams.streamingfast.io/) [Redis](https://redis.com/) CLI `Node.js`

<!-- [<img alt="github" src="" height="20">](https://github.com/pinax-network/substreams-sink-redis) -->
<!-- [<img alt="npm" src="" height="20">](https://www.npmjs.com/package/substreams-sink-redis) -->
<!-- [<img alt="GitHub Workflow Status" src="" height="20">](https://github.com/pinax-network/substreams-sink-redis/actions?query=branch%3Amain) -->

> `substreams-sink-redis` is a tool that allows developers to pipe data extracted from a blockchain to a Redis KV store.

## 📖 Documentation

<!-- ### https://www.npmjs.com/package/substreams-sink-redis -->

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)
- [**Redis** documentation](https://redis.io/docs/about/)

### Protobuf

- [`sf.substreams.sink.kv.v1.KVOperations`](https://github.com/streamingfast/substreams-sink-kv/blob/develop/proto/substreams/sink/kv/v1/kv.proto)

## CLI
[**Use pre-built binaries**](https://github.com/pinax-network/substreams-sink-redis/releases)
- [x] MacOS
- [x] Linux
- [x] Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-redis
```

**Run**
```
$ substreams-sink-redis run [options] <spkg>
```
## Features

### Substreams

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart

<!-- ### Redis -->