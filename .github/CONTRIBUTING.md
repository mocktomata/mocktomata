# Contributing

## Testing CI Locally

Currently, there are issue with the CI in Windows, getting timeout.

- <https://github.com/nektos/act>

## Online specs

A spec named `*.online.spec.ts` calls a live third-party endpoint (for example `api.mathjs.org` or `postman-echo.com`).
Its result depends on that service, so the default `test`, `coverage`, and `verify` runs (and CI) leave these specs out.
Each one has an offline counterpart that runs the same scenario against a local stub server.

Run the online specs on demand with `pnpm test:online` (from the root, or inside `packages/framework` or `plugins/axios`).
