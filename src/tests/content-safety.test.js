// Guards against re-introducing content that was deliberately removed in
// Portfolio V2: the BUET claim, EmpowerEd, Medium articles, personal phone and
// messaging contacts, the old GitHub Pages account and private documents.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(__dirname, "../..");
const SELF = resolve(__filename);

const FORBIDDEN = [
  [/\bBUET\b|Bangladesh University of Engineering/i, "BUET reference"],
  [/EmpowerEd/i, "EmpowerEd"],
  [/medium\.com/i, "Medium link"],
  [/wa\.me|whatsapp/i, "WhatsApp contact"],
  [/(\+?880|\b01)[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}\b/, "Bangladeshi phone number"],
  [/href=["']tel:/i, "phone link"],
  [/bushraabir\.github\.io/i, "old GitHub Pages account"],
  [/facebook\.com|instagram\.com/i, "personal social account"],
  [/recommendation[ _-]?letter|\/recommendation\//i, "recommendation letter"],
];

function walk(dir, exts) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p, exts);
    return exts.some((e) => p.endsWith(e)) ? [p] : [];
  });
}

const textFiles = [
  ...walk(join(root, "src"), [".js", ".jsx", ".css"]),
  ...walk(join(root, "public"), [".svg", ".txt", ".html"]),
  join(root, "index.html"),
  ...walk(join(root, "dist"), [".html", ".js", ".xml", ".txt"]),
].filter((p) => resolve(p) !== SELF);

describe("removed content stays removed", () => {
  it.each(FORBIDDEN)("no file contains %s (%s)", (pattern) => {
    const hits = textFiles.filter((f) => pattern.test(readFileSync(f, "utf8"))).map((f) => relative(root, f));
    expect(hits).toEqual([]);
  });

  it("does not ship PDFs or private documents", () => {
    const shipped = [...walk(join(root, "public"), [".pdf", ".docx"]), ...walk(join(root, "dist"), [".pdf", ".docx"])];
    expect(shipped).toEqual([]);
  });
});
