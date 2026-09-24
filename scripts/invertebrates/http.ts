import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CACHE_DIR, USER_AGENT } from "./config";

/**
 * JSON GET with a disk cache and a per-host pause between live requests, so
 * reruns are free and the public APIs are not hammered (iNaturalist asks for
 * about one request per second).
 */

const PAUSE_MS: Record<string, number> = {
  "api.inaturalist.org": 1100,
  "de.wikipedia.org": 250,
};
const lastRequest = new Map<string, number>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function throttle(host: string) {
  const pause = PAUSE_MS[host] ?? 500;
  const wait = (lastRequest.get(host) ?? 0) + pause - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest.set(host, Date.now());
}

export async function getJson<T>(url: string): Promise<T> {
  const file = path.join(CACHE_DIR, `${createHash("sha1").update(url).digest("hex")}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    // Not cached yet.
  }

  const host = new URL(url).host;
  for (let attempt = 1; ; attempt++) {
    await throttle(host);
    let response: Response;
    try {
      response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
    } catch (error) {
      // Dropped connections happen on long runs; retry like a 5xx.
      if (attempt >= 5) throw error;
      await sleep(attempt * 5000);
      continue;
    }
    if (response.ok) {
      const body = (await response.json()) as T;
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(file, JSON.stringify(body));
      return body;
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 5) {
      throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    }
    await sleep(attempt * 5000);
  }
}

/** Downloads a binary file once; later runs read it from `file`. */
export async function download(url: string, file: string): Promise<Buffer> {
  try {
    return await readFile(file);
  } catch {
    // Not downloaded yet.
  }
  const host = new URL(url).host;
  await throttle(host);
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Download ${url} failed: ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return data;
}
