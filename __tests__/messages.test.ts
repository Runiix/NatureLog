/**
 * @jest-environment node
 */
import de from "../messages/de.json";
import en from "../messages/en.json";

type Messages = { [key: string]: string | Messages };

function flatten(tree: Messages, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : flatten(value, `${prefix}${key}.`),
  );
}

/** ICU placeholders ({name}, {count, plural, …}) and rich tags (<terms>) in a message. */
function argumentsOf(message: string): string[] {
  // An argument name is followed by "}" or "," — plural branch text such as
  // "{Keine Einträge}" is not an argument.
  const args = [...message.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*[,}]/g)].map((m) => m[1]);
  const tags = [...message.matchAll(/<([a-zA-Z0-9_]+)>/g)].map((m) => `<${m[1]}>`);
  return [...new Set([...args, ...tags])].sort();
}

function lookup(tree: Messages, path: string): string {
  return path.split(".").reduce<string | Messages>((node, key) => (node as Messages)[key], tree) as string;
}

const deKeys = flatten(de as Messages).sort();
const enKeys = flatten(en as Messages).sort();

describe("message catalogues", () => {
  test("German and English have exactly the same keys", () => {
    // A key missing in one locale renders as its raw path in production.
    expect(enKeys.filter((key) => !deKeys.includes(key))).toEqual([]);
    expect(deKeys.filter((key) => !enKeys.includes(key))).toEqual([]);
  });

  test("no message is empty", () => {
    const empty = deKeys.filter(
      (key) => !lookup(de as Messages, key).trim() || !lookup(en as Messages, key).trim(),
    );
    expect(empty).toEqual([]);
  });

  test("both translations of a message take the same arguments", () => {
    const mismatched = deKeys.filter(
      (key) =>
        enKeys.includes(key) &&
        argumentsOf(lookup(de as Messages, key)).join() !==
          argumentsOf(lookup(en as Messages, key)).join(),
    );
    expect(mismatched).toEqual([]);
  });
});
