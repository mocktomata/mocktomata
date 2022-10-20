# `@mocktomata/io-remote`

`@mocktomata/io-remote` provides IO access for [`mocktomata`] through some remote services.

The remote service is an instance of `@mocktomata/server` which uses various backend (e.g. `@mocktomata/nodejs`).

It implements the `Mocktomata.IO` type defined in `@mocktomata/framework`.

`mocktomata` depends on `@mocktomata/io-remote` for browser usage.
`@mocktomata/framework` does not depend on `@mocktomata/io-remote` directly.

This is a core package of [`mocktomata`] and do not need to be installed separately.

## TO DO

Currently, validation of the data is handled on the server side.
It is needed to avoid bad/extra information send across the wire.

However, client side should perform similar check to prevent getting bad information from rouge server.

This mean similar validation/sanitation logic needs to be used by both server and client.

Currently, the logic is implemented in `@mocktomata/nodejs`.
They should be moved out of it to become platform independent and used on both sides.
