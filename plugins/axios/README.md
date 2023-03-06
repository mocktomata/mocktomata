# @mocktomata/plugin-axios

[@mocktomata/plugin-axios] is a [mocktomata] plugin for [axios].

In basic use cases, [mocktomata] works with [axios] and do not need this plugin.

This plugin is needed only if you use additional features in [axios] such as [interceptors].

## Install

```sh
npm install -D @mocktomata/plugin-axios
yarn add -D @mocktomata/plugin-axios
pnpm add -D @mocktomata/plugin-axios
```

## Setup

```js
// mocktomata.json
{
	"plugins": ["@mocktomata/plugin-axios"]
}
```

[@mocktomata/plugin-axios]: https://www.npmjs.com/package/@mocktomata/plugin-axios
[axios]: https://www.npmjs.com/package/axios
[mocktomata]: https://www.npmjs.com/package/mocktomata
[interceptors]: https://axios-http.com/docs/interceptors
