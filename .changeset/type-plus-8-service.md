---
'@mocktomata/service': minor
---

Depend on `type-plus` `8.0.0-beta.10` exactly, up from `^7.0.0`.

**Minor**, not major: `type-plus` is a runtime dependency here (`ts/test_server.ts` uses
`required`) but it does not leak into the published declarations — no emitted `.d.ts` in this
package imports from `type-plus`, so consumers do not inherit `type-plus@8`'s new
`typescript >= 5.6.0` peer through this package's own types. The last published
`@mocktomata/service` (9.2.4) declares `type-plus: ^7.0.0`, so that is the jump consumers see.

The version is **pinned exactly rather than caret-ranged**. `^8.0.0-beta.10` resolves to
`>=8.0.0-beta.10 <9.0.0-0`, which admits every later `8.0.0` prerelease plus `8.0.0` and
`8.1.0`. `type-plus` 8 is a prerelease line where breaking changes land between betas —
beta.10 to beta.11 changed `Equal`'s signature and removed `isType.f`. An exact version makes
each bump a reviewable pull request instead of something a lockfile refresh can do silently.
This reverts to a caret once 8.0.0 is stable.
