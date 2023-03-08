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

## Usage

This plugin will ignore the calls under `interceptors`.
They will not be saved and simulated.

```ts
import axios from 'axios'

axios.interceptors.request.use(v => v) // ignored
axios.interceptors.response.use(v => v, e => e) // ignored
```

Note that you should not use any "speced" code inside these calls.
Since the callbacks are ignored,
any action triggered within will not be triggered during simulation.
If there are actions triggered within,
the simulation will time out as [mocktomata] will be waiting for those actions.

[@mocktomata/plugin-axios]: https://www.npmjs.com/package/@mocktomata/plugin-axios
[axios]: https://www.npmjs.com/package/axios
[mocktomata]: https://www.npmjs.com/package/mocktomata
[interceptors]: https://axios-http.com/docs/interceptors
