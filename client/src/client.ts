import { BackoffOptions, backOff } from "exponential-backoff";
import type { TypedDocumentString } from "./__generated__/graphql";

class RetriableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetriableError";
  }
}

class RateLimitError extends RetriableError {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export const DefaultBackoffOptions: BackoffOptions = {
  jitter: "full",
  maxDelay: 5 * 1000,
  numOfAttempts: 10,
  retry: (e: any, attempt: number) => {
    console.log(
      `call failed attempt ${attempt}${
        e instanceof RetriableError ? ", retrying..." : ""
      }: ${e}`
    );
    return e instanceof RetriableError;
  },
};

const REQUEST_TIMEOUT = 408;
const TOO_MANY_REQUESTS = 429;
const BAD_GATEWAY = 502;
const SERVICE_UNAVAILABLE = 503;
const GATEWAY_TIMEOUT = 504;
// Cloudflare origin web server timed out
const ORIGIN_WEB_SERVER_TIMEOUT = 524;

const retriableStatusCodes = new Set([
  REQUEST_TIMEOUT, // Request Timeout
  TOO_MANY_REQUESTS, // Too Many Requests
  BAD_GATEWAY, // Bad Gateway
  SERVICE_UNAVAILABLE, // Service Unavailable
  GATEWAY_TIMEOUT, // Gateway Timeout
  ORIGIN_WEB_SERVER_TIMEOUT,
]);

// IsRetriableStatusCode returns true if the given http status code can
// generally be retried without causing issues.
const IsRetriableStatusCode = (code: number) => retriableStatusCodes.has(code);

export class HttpClient {
  constructor(
    private apiBase: string,
    private backoffOptions: BackoffOptions
  ) {}

  async execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    controller: AbortController,
    variables?: TVariables
  ) {
    const f = async () => {
      let res: Response;
      try {
        res = await fetch(this.apiBase, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/graphql-response+json",
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          throw e;
        }
        throw new RetriableError(`fetch failed: ${e}`);
      }
      if (res.status == 429) {
        throw new RateLimitError("rate limit exceeded");
      }
      if (IsRetriableStatusCode(res.status)) {
        throw new RetriableError(`http status ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`bad http status: got ${res.status} expected 200`);
      }
      return (await res.json()).data as TResult;
    };
    return backOff(f, this.backoffOptions);
  }
}

export const httpClient = new HttpClient(
  "http://localhost:4000/",
  DefaultBackoffOptions
);
