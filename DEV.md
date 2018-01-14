# Development note

## file writers

If concurency becomes an issue,
use `dnode`, `get-port` to start a server to do the writing,
and each `Spec` and `Scenario` will send message to it for read/write.

The server will save a temp file to remember the last used port (which will be the current port if server is running),
and client will use that file to determine which port to connect to.
The server will have a `isKomondor()` function to make sure we are dealing with the right server.

Initial code was written and can look up in git history.

## expectation with context

Currently `expectation` must be pure,
it cannot reference values from outside because it will be serialized and run in different context.
The scope can't be preserved.

May be it is possible to create a construct to capture the necessary context to make the `expectation` aware of its surrounding.
Maybe a class instance passing in the context, and analyze the expectation to stripe out value when saved?
Or the function, when deserialized, can be called with `f.call(this, ...args)`.
