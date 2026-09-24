/**
 * Semicolon-separated CSV like the existing lexicon exports (birds.csv), with
 * RFC 4180 quoting so descriptions may contain semicolons, quotes and line
 * breaks. Written with a BOM so Excel opens the umlauts correctly.
 */

const SEPARATOR = ";";
const BOM = String.fromCharCode(0xfeff);
const BOM_PATTERN = new RegExp(`^${BOM}`);

const quote = (value: string) =>
  /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export function toCsv(columns: readonly string[], rows: Record<string, string>[]): string {
  const lines = [
    columns.join(SEPARATOR),
    ...rows.map((row) => columns.map((column) => quote(row[column] ?? "")).join(SEPARATOR)),
  ];
  return `${BOM}${lines.join("\r\n")}\r\n`;
}

export function parseCsv(text: string): Record<string, string>[] {
  const source = text.replace(BOM_PATTERN, "");
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === SEPARATOR) {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const [header, ...body] = records.filter((row) => row.some((cell) => cell.trim() !== ""));
  if (!header) return [];
  return body.map((row) => Object.fromEntries(header.map((column, i) => [column.trim(), row[i] ?? ""])));
}
