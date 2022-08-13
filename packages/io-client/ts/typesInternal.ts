export type Context = {
  fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>,
  location: {
    protocol: string,
    hostname: string
  }
}

