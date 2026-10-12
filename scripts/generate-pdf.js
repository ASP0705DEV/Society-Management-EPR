import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const htmlPath = path.join(rootDir, "docs", "architecture-whitepaper.html");
const pdfPath = path.join(rootDir, "docs", "AI_Smartgate_Architecture_Specification.pdf");

console.log("Compiling Architecture Whitepaper to PDF...");
console.log("Source HTML:", htmlPath);
console.log("Target PDF:", pdfPath);

if (!fs.existsSync(edgePath)) {
  console.error("Microsoft Edge not found at expected path:", edgePath);
  process.exit(1);
}

const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="${pdfPath}" "${htmlPath}"`;
execSync(cmd, { stdio: "inherit" });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`\n✓ SUCCESS: PDF Generated at: ${pdfPath}`);
  console.log(`✓ File Size: ${(stats.size / 1024).toFixed(1)} KB\n`);
} else {
  console.error("PDF generation failed: Output file not created.");
  process.exit(1);
}
