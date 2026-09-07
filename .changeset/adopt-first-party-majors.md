---
"@mocktomata/cli": minor
"@mocktomata/framework": minor
"@mocktomata/nodejs": minor
"@mocktomata/io-remote": minor
"@mocktomata/service": minor
"mocktomata": minor
---

Adopt current first-party majors: `standard-log-color@^13.2.0`, `iso-error@^7.0.0`, `iso-error-web@^3.0.0`, `iso-error-google-cloud-api@^7.0.0`, `async-fp@^10.0.0`, `clibuilder@^11.0.0`, and `@unional/fixture@^5.0.0`.

This removes stale transitive `type-plus@5.6.0` and `tersify@3.12.1` copies that a fresh install used to resolve through these siblings, alongside the `type-plus@8.0.0-beta.10` line already pinned throughout this repo.

- `iso-error@7`, `iso-error-web@3`, `iso-error-google-cloud-api@7`, and `async-fp@10` raised their own `engines.node` floor to `>= 20` — a non-event here since every published package in this repo already required `>= 20`. No API changes.
- `standard-log-color@13` drops ES5 build output; its types are not part of any public API here.
- `clibuilder@11` pins `type-plus@8.0.0-beta.10` internally. Its `10.1.0` release also made a usage error (unknown option, missing argument, wrong-type config value) exit non-zero instead of `0`, and print a named error ahead of the help text — so `mtmt` invoked with a bad argument now reports failure via its exit code, matching the underlying `clibuilder` command it wraps.
