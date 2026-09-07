---
'@mocktomata/framework': major
---

Depend on `type-plus` `8.0.0-beta.10` exactly, up from `^7.0.0`.

This is a **major** for this package because `type-plus` types leak into the published
declarations: `esm/**/*.d.ts` imports `AnyFunction`, `AnyRecord`, `JSONTypes` and
`RequiredPick` from `type-plus`. `type-plus@8` declares
`peerDependencies: { typescript: '>= 5.6.0' }` where 5, 6 and 7 declared no TypeScript peer at
all, so consumers of `@mocktomata/framework` inherit a TypeScript floor they did not have
before. The last published `@mocktomata/framework` (9.2.4) declares `type-plus: ^7.0.0`, so
that is the jump consumers actually see.

`type-plus@8` also brings `unpartial@^1.0.7`, whose `engines` require Node `>= 20`. This
package already declares `>= 20`, so nothing changes there.

The version is **pinned exactly rather than caret-ranged**. `^8.0.0-beta.10` resolves to
`>=8.0.0-beta.10 <9.0.0-0`, which admits every later `8.0.0` prerelease plus `8.0.0` and
`8.1.0`. `type-plus` 8 is a prerelease line where breaking changes land between betas —
beta.10 to beta.11 changed `Equal`'s signature and removed `isType.f`. An exact version makes
each bump a reviewable pull request instead of something a lockfile refresh can do silently.
This reverts to a caret once 8.0.0 is stable.
