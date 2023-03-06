---
'@mocktomata/framework': minor
---

Exports utils functions for plugins.

Adjust `incubator.config()` to accept `SpecPlugin` directly,
instead of `PluginModule`.
This make it easier to use when developing plugins.

Hide unable to locate plugin warning when subject is number or boolean.
These are special cases that works fine.

`SpecPlugin.name` is now a required field.
Since there is no plugin in the wild at the moment,
this is not considered a breaking change.
