---
"@mocktomata/framework": patch
---

Use `@ungap/structured-clone` directly.

Usage of `@ungap/structured-clone/json` error in `jest` env,
getting:

```sh
Cannot find module '@ungap/structured-clone/json'
```

Running form Node is working fine.
So it is probably a bug on `jest` side.

Chaning to build the function locally should fix the problem.

