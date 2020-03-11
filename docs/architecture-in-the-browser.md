# Architecture in the Browser

## Module residency

When `mocktomata` is used in the browser,
some modules are loaded in the browser while others are loaded in the server.

Loaded in browser:

- `mocktomata`
- `@mocktomata/framework`
- `@mocktomata/io-client`

Loaded in server:

- `@mocktomata/file-server`
- `@mocktomata/io-fs`
