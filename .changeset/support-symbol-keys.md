---
"@mocktomata/cli": minor
"@mocktomata/framework": minor
"@mocktomata/nodejs": minor
"@mocktomata/io-remote": minor
"@mocktomata/service": minor
"mocktomata": minor
---

Support symbol property keys. Reading and writing a property keyed by a well-known symbol (such as `Symbol.iterator`), a registered symbol (`Symbol.for(key)`), or a unique symbol is now recorded and simulated, so a spec'd object can be iterated with `for...of`.
