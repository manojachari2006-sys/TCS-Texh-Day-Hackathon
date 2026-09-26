export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell.length === 0) quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n" || char === "\r") { if (char === "\r" && text[i+1] === "\n") i++; row.push(cell); if (row.some(v => v.trim())) rows.push(row); row=[]; cell=""; }
    else cell += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  row.push(cell); if (row.some(v => v.trim())) rows.push(row);
  return rows;
}
export const csvArray = (value: string) => value ? value.split("|").map(v => v.trim()).filter(Boolean) : [];
export function addUniqueSku(sku:string,seen:Set<string>){if(seen.has(sku))return false;seen.add(sku);return true;}
export function csvEscape(value: unknown) {
  let text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"','""')}"`;
}
