# @mocktomata/io-fs

[`mocktomata`](https://www.npmjs.com/package/mocktomata) file system IO package.

This module provides the implementation to interact with the file system.
Its signature is string based and not doing any parsing.

This is because in browser testing, the data is read through `file-server` which send the data to `io-client` as JSON string.

There is no need to parse and convert the string to object.

Validation of the data is done in respective code (`config`, `plugin`, `spec` and `scenario`).
