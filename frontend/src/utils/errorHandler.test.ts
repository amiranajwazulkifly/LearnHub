import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, test } from "vitest";

import { describeLoadError } from "./errorHandler";

function httpError(status: number, message = "Relation \"users\" violates constraint") {
  const headers = new AxiosHeaders();
  return new AxiosError("Request failed", "ERR_BAD_RESPONSE", { headers }, null, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { success: false, message },
  });
}

describe("describeLoadError", () => {
  test("distinguishes not found from no access", () => {
    expect(describeLoadError(httpError(404), "assignment").title).toBe("Assignment not found");
    expect(describeLoadError(httpError(403), "assignment").title).toBe("Assignment unavailable");
  });

  test("offers no retry where retrying can't help", () => {
    expect(describeLoadError(httpError(403)).canRetry).toBe(false);
    expect(describeLoadError(httpError(404)).canRetry).toBe(false);
  });

  test("offers retry for server and network failures", () => {
    expect(describeLoadError(httpError(503)).canRetry).toBe(true);
    expect(describeLoadError(new Error("Network Error")).canRetry).toBe(true);
  });

  test("never passes a server message through to the user", () => {
    const copy = describeLoadError(httpError(500), "assignment");

    expect(`${copy.title} ${copy.description}`).not.toMatch(/Relation|constraint/);
  });
});
