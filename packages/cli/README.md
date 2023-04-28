# `@mocktomata/cli`

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][npm-url]

[![GitHub NodeJS][github-nodejs]][github-action-url]
[![Codecov][codecov-image]][codecov-url]

[@mocktomata/cli] is the CLI tools for [mocktomata].

## Install

```sh
npm install --dev @mocktomata/cli

yarn add -D @mocktomata/cli

pnpm add -D @mocktomata/cli
```

## Usage

It provides the `mocktomata` command (also aliased as `mt`).

Right now it has only one command: `mt serve`,
which starts a server for [mocktomata].

The server is needed for [mocktomata] to work when running in browser environment,
including [jsdom].

[@mocktomata/cli]: https://github.com/mocktomata/mocktomata/tree/main/packages/cli
[mocktomata]: https://github.com/mocktomata/mocktomata
[codecov-image]: https://codecov.io/gh/mocktomata/mocktomata/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/mocktomata/mocktomata
[downloads-image]: https://img.shields.io/npm/dm/@mocktomata/cli.svg?style=flat
[github-action-url]: https://github.com/mocktomata/mocktomata/actions
[github-nodejs]: https://github.com/mocktomata/mocktomata/workflows/release/badge.svg
[npm-image]: https://img.shields.io/npm/v/@mocktomata/cli.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@mocktomata/cli
[jsdom]: https://github.com/jsdom/jsdom
