---
"@mocktomata/framework": minor
"mocktomata": minor
"@mocktomata/nodejs": minor
"@mocktomata/cli": minor
"@mocktomata/io-remote": minor
"@mocktomata/service": minor
---

Add the opt-in `argumentMatching` setting. Set it to `'strings'` in `Spec.Options` or in `mocktomata.json` to also compare string arguments of function calls and `new` during simulation. The default `'behavior'` keeps the current rules.

- The comparison masks the value with the `maskValue()` criteria of the current run first.
- `ignoreMismatch()` now accepts strings.
- `ActionMismatch` names the `argumentMatching` level and the argument that differs, with strings masked.
- A string assigned to a property now matches its recorded value when both are masked, and a string with no recorded reference throws `ActionMismatch` instead of a `TypeError`.
