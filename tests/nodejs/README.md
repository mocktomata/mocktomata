# @mocktomata/test-nodejs

This is a test package that uses `mocktomata` in NodeJS environment.

It serves as acceptance test for `mocktomata` for NodeJS environment.

It contains tests that call <https://api.mathjs.org/> to perform some calculations.

## websocket

See <https://www.lob.com/blog/websocket-org-is-down-here-is-an-alternative>
on how to setup an echo-server locally to test web socket.

- start docker
- `docker run --detach -p 10000:8080 jmalloc/echo-server`
