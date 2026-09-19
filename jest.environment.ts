import JSDOMEnvironment from "jest-environment-jsdom";

/**
 * jsdom builds a fresh global object that lacks the WHATWG fetch primitives.
 * Importing any component that transitively reaches a server action pulls in
 * `next/cache`, which touches `Request` at module scope and throws.
 *
 * This environment module runs in Node's own realm, where Node 18+ provides
 * those globals, so it can hand them to the jsdom global.
 */
export default class NextJsdomEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    const fromNode = {
      Request,
      Response,
      Headers,
      fetch,
      FormData,
      Blob,
      ReadableStream,
      TransformStream,
      TextEncoder,
      TextDecoder,
      structuredClone,
    };

    for (const [name, value] of Object.entries(fromNode)) {
      if (this.global[name as keyof typeof this.global] === undefined) {
        Object.defineProperty(this.global, name, {
          value,
          writable: true,
          configurable: true,
        });
      }
    }
  }
}
