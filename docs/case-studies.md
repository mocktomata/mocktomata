# Case study

```ts
// <ref:0> create target stub: fn axios() { ... }
// <act:0> you invoke <ref:0>(<ref:1>)
// <ref:1> create input spy: { ... } = Options
// <act:1> I access <ref:1>.host *auto-performed*
// <act:2> <ref:1 act:1> -> <ref:2>
// ... refId = 2 is from `record.getNextRefId()`
// ... so that the log order align with the actual execution order
// <ref:2> create input spy: 'localhost'
// ... assume axios only gets 'host' form Options
// ... during save mode, actual axios call is made
// <act:3> <ref:0 act:0> -> <ref:3>
// <ref:3> create output stub: {} = Promise
// <act:4> plugin invoke <ref:3>.then()
// ... Promise is fulfilled/rejected some time around here
// ... during save mode, `setMeta()` is called to save the resolution
// <act:5> <ref:3 act:4> -> <ref:4>
// <ref:4>: create output stub: { json() { ... } } = response
// ... the handler in the promise is executed
// <act:6> you access <ref:4>.json
// <act:7> <ref:4 act:6> -> <ref:5>
// <ref:5> create output stub: json() { ... }
// ... during simulate mode,
// ... objectPlugin calls `getProperty('json')`.
// ... mocktomata validate and add <act:6>
// ... mocktomata add <act:7> with payload = notDefined
// ... mocktomata create <ref:5> from recorded <act:7> payload
// ... mocktomata adjust <act:7> payload
// ...   this is needed to avoid action order mismatch if creating <ref:5> causes new action to be added
// <act:8> you invoke <ref:5>()
// <act:9> <ref:5 act:7> -> <ref:6>
// <ref:6> create output stub: { a: 1 } = Result
((await spec(axios))({ ... } as Options) as Promise)
  .then((response => response.json() as Result) as Handler)

// disassembled
const ref0 = await spec(axios)
const ref1 = { host: 'localhost' }
const ref2 = ref1.host
const ref3 = ref0(ref1)
ref3.then(ref4 => {
  const ref5 = ref4.json
  const ref6 = ref5()
  return ref6
})
```

```ts
// <ref:0> create target stub: { ajax() { ... } }
// <act:0> you access <ref:0>.ajax
// ... should we collect `thisArg` here and use that in case invoke does not provide `thisArg`?
// <ref:1> create target stub: ajax() { ... }
// <act:1> <ref:0 act:0> -> <ref:1>
// ... remaining is the same as the next example
(await spec($)).ajax({ ... })

// <ref:0> create target stub: ajax() { ... }
// ... if `ajax` needs `$` as `this`, user need to call `bind($)` themselves.
// ... There is no way we can collect that this way
// <act:0> you invoke <ref:0>(<ref:1>)
// <ref:1> create input spy: { success() { ... } } = Options
// <act:1> <ref:0 act:0> -> <ref:2>
// ... in this example, skipping getting other info from Options such as URL
// <ref:2> create output spy: { ... } = Result2
// ... actual ajax call is made before <ref:2> is returned
// <act:2> I access <ref:1>.success
// ... assume accessing `success` only when the call comes back
// <act:3> <ref:1 act:2> -> <ref:3>
// <ref:3> create input spy: success() { ... }
// <act:4> I invoke <ref:3>(<ref:4>)
// <ref:4> create output stub: { json() { ... } } = response
// <act:5> you access <ref:4>.json
// <act:6> <ref:4 act:5> -> <ref:5>
// <ref:5> create output stub: json() { ... }
// <act:7> you invoke <ref:5>(<ref:6>)
// <ref:6> create input spy: { arti: ... } = ArtificialData
// <act:8> <ref:5 act:7> -> <ref:7>
// <ref:7> create output stub: { ... } = json
// <act:9> <ref:3 act:4> -> <ref:8>
// <ref:8> create input spy: {} = Result
// ... it can be existing reference, this is just the case when Result is new
(await spec($.ajax))({
  success(response) {
    const json = response.json({ arti: ... } as ArtificialData)
    return {} as Result
  }
} as Options) as Result2
```

```ts
// <ref:0> create target stub: class Ssh
// <act:0> you instantiate new <ref:0>(<ref:1>)
// <ref:1> create input spy: { ... } = Options
// ... skip over Option access / invocation
// <act:1> <ref:0 act:0> -> <ref:2>
// <ref:2> create output stub: { open: ... } = ssh
// <act:2> you access <ref:2>.open
// <act:3> <ref:2 act:2> -> <ref:3>
// <ref:3> create output stub: open() { ... }
// <act:4> you invoke <ref:3>(<ref:4>)
// <ref:4> create input spy: args => { ... } = Handler
// <act:5> I invoke <ref:4>(<ref:5>)
// <ref:5> create output stub: args
// ... args is artificial for this example.
// ... the handler to perform whatever function
// ... skip over all args access / invoke (if any) actions
// <act:6> <ref:4 act:5> -> <ref:6>
// <ref:6> create output stub: conn
// <act:7> you access <ref:6>.close
// <act:8> <ref:6 act:7> -> <ref:7>
// <ref:7> create output stub: close() { ... }
// <act:9> you invoke <ref:7>()
// <act:10> <ref:7 act:9> -> <ref:8>
// <ref:8> create output stub: undefined
const ssh = new (await spec(Ssh))({ ... } as Options)
const conn = ssh.open((args => { ... } as Result) as Handler)
conn.close()
```

```ts
// <ref:0> create target stub: fs
// <act:0> you access <ref:0>.readdir
// <act:1> <ref:0 act:0> -> <ref:1>
// <ref:1> create target stub: readdir() {}
// <act:2> you invoke <ref:1>(<ref:2>, <ref:3>)
// <ref:2> create input spy: 'path'
// <ref:3> create input spy: (err, result) => ({})
// <act:3> <ref:1 act:2> -> <ref:4>
// <ref:4> create target spy: undefined
// ... access file system and get the file content here
// <act:4> I invoke <ref:3>(<ref:5>, <ref:6>)
// <ref:5> create output stub: null = err
// <ref:6> create output stub: Buff = result
// <act:5> you access <ref:6>.toString
// <act:6> <ref:6 act:5> -> <ref:7>
// <ref:7> create output stub: toString() {}
// <act:7> you invoke <ref:7>()
// <act:8> <ref:7 act:7> -> <ref:8>
// <ref:8> create output stub: 'abc' = file-content
// <act:9> <ref:3 act:4> -> <ref:4>?
// ... <ref:4> is target spy while this should be input spy
// ... does it mean that it should be a different instance (<ref:9>)?
// ... or should it change its behavior along the way?
;(await spec(fs)).readdir('path', (err, result) => console.info(result.toString())) as undefined

// <ref:0> create target stub: fs
// <act:0> you access <ref:0>.readdirSync
// <act:1> <ref:0 act:0> -> <ref:1>
// <ref:1> create target stub: readdirSync() {}
// <act:2> you invoke <ref:1>(<ref:2>, <ref:3>)
// <ref:2> create input spy: 'path'
// <ref:3> create input spy: options
// ... skip over options get/invoke actions
// ... load file and create buffer
// <act:3> <ref:1 act:2> -> <ref:4>
// <ref:4> create output stub: buffer
// <act:4> you access <ref:4>.toString
// <act:5> <ref:4 act:4> -> <ref:5>
// <ref:5> create output stub: toString() {}
// <act:6> you invoke <ref:5>(<ref:6>)
// <ref:6> create output stub: 'utf-8'
// <act:7> <ref:5 act:6> -> <ref:7>
// <ref:7> create output stub: 'abc' = file-content
const buffer = (await spec(fs)).readdirSync('path', options)
buffer.toString('utf-8')
```

```ts
// stream example

// <ref:0> create target stub: fs
// <act:0> you access <ref:0>.createReadStream
// <act:1> <ref:0 act:0> -> <ref:1>
// <ref:1> create target stub: createReadStream() {}
// <act:2> you invoke <ref:1>(<ref:2>)
// <ref:2> create input spy: 'foo.txt'
// <act:3> <ref:1 act:2> -> <ref:3>
// <ref:3> create output stub: rr
// <act:4> you access <ref:3>.on
// <act:5> <ref:3 act:4> -> <ref:4>
// <ref:4> create output stub: on() {}
// <act:6> you invoke <ref:4>(<ref:5>, <ref:6>)
// <ref:5> create input spy: 'readable'
// <ref:6> create input spy: Handler1
// <act:7> <ref:4 act:6> -> <ref:7>
// <ref:7> create output stub: EventEmitter
// ... EventEmitter maybe the same as `rr`
// ... in this example assumes they are different
// <act:8> you access <ref:3>.on
// <act:9> <ref:3 act:8> -> <ref:4>
// <act:10> you invoke <ref:4>(<ref:8>, <ref:9>)
// <ref:8> create input spy: 'end'
// <ref:9> create input spy: Handler2
// <act:11> <ref:4 act:10> -> <ref:7>
// ... in the following, assume readable will be called twice, end called once
// <act:12> I invoke <ref:6>()
// <act:13> you access <ref:3>.read
// <act:14> <ref:3 act:13> -> <ref:10>
// <ref:10> create output stub: read() {}
// <act:15> you invoke <ref:10>()
// <act:16> <ref:10 act:15> -> <ref:11>
// <ref:11> create output stub: 'abc'
// <act:17> <ref:6 act:12> -> <ref:12>
// <ref:12> create active meta spy: undefined
// <act:18> I invoke <ref:6>()
// <act:19> you access <ref:3>.read
// <act:20> <ref:3 act:19> -> <ref:10>
// <act:21> you invoke <ref:10>()
// <act:22> <ref:10 act:21> -> <ref:13>
// <ref:13> create output stub: 'def'
// <act:23> <ref:6 act:18> -> <ref:12>
// <act:24> I invoke <ref:9>()
// <act:25> <ref:9 act:24> -> <ref:12>
const fs = await spec(require('fs'))
const rs = fs.createReadStream('foo.txt')
rs.on('readable', (() => console.log(`readable: ${rs.read()}`)) as Handler1)
rs.on('end', (() => console.log('end')) as Handler2)
```
