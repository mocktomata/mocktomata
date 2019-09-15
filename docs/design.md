# Design

## mode: passive | autonomous

- can we set `passive` as default and skip saving it to the file?
- is there a way for the plugin to indicate `mode` does not apply?
  If we are not doing `get/set`,
  then `invoke` and `instantiate` are the only known operations that will be performed by the simulator.
  Thus `mode` applies "only" to `functionPlugin` and `classPlugin`.
  Can other plugins utilize this?
  I cannot think of a scenario at the moment.
