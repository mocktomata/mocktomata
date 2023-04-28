# `@mocktomata/service`

`@mocktomata/service` starts a running service to handle requests from [@mocktomata/io-remote].

## Used by

- [@mocktomata/cli]: `mocktomata server <action>` to `start/stop` the service.

## Depends on

- [@mocktomata/nodejs]: Currently depends on it directly. In the future,\
  [@mocktomata/cli] will depend on it, and it is injected into `@mocktomata/service`.
- 🚧 `@mocktomata/data`: The future package extracted from [@mocktomata/nodejs]\
  to handle various data validation and sanitization.

[@mocktomata/cli]: https://www.npmjs.com/package/@mocktomata/cli
[@mocktomata/nodejs]: ../nodejs/README.md
[@mocktomata/io-remote]: ../io-remote/README.md
