import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const PUBLIC_DIR = join(import.meta.dir, "..", ".output", "public");
const KILOBYTE = 1024;

const budgets = {
  totalBytes: 2.1 * 1024 * KILOBYTE,
  javascriptBytes: 1_350 * KILOBYTE,
  largestJavascriptBytes: 460 * KILOBYTE,
  imageBytes: 550 * KILOBYTE,
};

function collectFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}

function formatKilobytes(bytes: number) {
  return `${(bytes / KILOBYTE).toFixed(1)} KB`;
}

const files = collectFiles(PUBLIC_DIR).map((path) => ({
  path,
  bytes: statSync(path).size,
  extension: extname(path).toLowerCase(),
}));
const javascriptFiles = files.filter((file) => file.extension === ".js");
const imageFiles = files.filter((file) =>
  [".jpg", ".jpeg", ".png", ".webp"].includes(file.extension),
);
const largestJavascript = javascriptFiles.toSorted((a, b) => b.bytes - a.bytes)[0];
const measurements = {
  totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  javascriptBytes: javascriptFiles.reduce((total, file) => total + file.bytes, 0),
  largestJavascriptBytes: largestJavascript?.bytes ?? 0,
  imageBytes: imageFiles.reduce((total, file) => total + file.bytes, 0),
};

const failures = Object.entries(budgets).filter(
  ([metric, budget]) => measurements[metric as keyof typeof measurements] > budget,
);

console.table({
  "public total": formatKilobytes(measurements.totalBytes),
  "javascript total": formatKilobytes(measurements.javascriptBytes),
  "largest javascript": `${formatKilobytes(measurements.largestJavascriptBytes)} (${largestJavascript ? relative(PUBLIC_DIR, largestJavascript.path) : "none"})`,
  "images total": formatKilobytes(measurements.imageBytes),
});

if (failures.length > 0) {
  for (const [metric, budget] of failures) {
    console.error(
      `${metric} exceeds its budget: ${formatKilobytes(measurements[metric as keyof typeof measurements])} > ${formatKilobytes(budget)}`,
    );
  }
  process.exit(1);
}
