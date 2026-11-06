---
"@mocktomata/framework": minor
"mocktomata": minor
"@mocktomata/nodejs": minor
"@mocktomata/cli": minor
"@mocktomata/io-remote": minor
"@mocktomata/service": minor
---

Add opt-in replay of this run's values during simulation. Neither option changes the record.

- `spec.ignoreMismatch(value, { replay: 'substitute' })`: once the value of this run takes the place of the recorded value in a call, `new`, or property assignment, simulation returns it wherever the recorded value comes back unchanged. The default `{ replay: 'recorded' }` keeps returning the recorded value.
- `spec.maskValue(value, { replaceWith, restore: true })`: simulation puts the value of this run back in place of the placeholder in replayed strings. It works only for a string criterion whose placeholder no other criterion uses. Otherwise the value stays masked and a warning is logged. `maskValue()` still accepts the replacement string as its second argument.
- A substituted or restored value that is passed back into a spec'd call matches the recorded value it replaced. When two different values of this run take the place of the same recorded value, it is no longer substituted and a warning is logged.
