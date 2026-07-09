/**
 * One-off script to generate branded placeholder favicons.
 * Run: node scripts/generate-favicons.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0f"/>
  <rect x="96" y="96" width="320" height="320" rx="64" fill="#6366f1"/>
  <text x="256" y="310" font-family="system-ui,sans-serif" font-size="200" font-weight="700" fill="#f4f4f5" text-anchor="middle">R</text>
</svg>`;

const { default: sharp } = await import("sharp");

const svgBuffer = Buffer.from(svg);

await sharp(svgBuffer).png().toFile(join(publicDir, "icon.png"));
await sharp(svgBuffer).resize(180, 180).png().toFile(join(publicDir, "apple-icon.png"));
await sharp(svgBuffer).resize(32, 32).png().toFile(join(publicDir, "favicon-32.png"));

const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

// Minimal ICO: single 32x32 PNG embedded
const pngSize = favicon32.length;
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: icon
icoHeader.writeUInt16LE(1, 4); // count: 1 image

const icoDir = Buffer.alloc(16);
icoDir.writeUInt8(32, 0); // width
icoDir.writeUInt8(32, 1); // height
icoDir.writeUInt8(0, 2); // color count
icoDir.writeUInt8(0, 3); // reserved
icoDir.writeUInt16LE(1, 4); // planes
icoDir.writeUInt16LE(32, 6); // bit count
icoDir.writeUInt32LE(pngSize, 8); // bytes in resource
icoDir.writeUInt32LE(22, 12); // offset (6 + 16)

writeFileSync(
  join(publicDir, "favicon.ico"),
  Buffer.concat([icoHeader, icoDir, favicon32]),
);

console.log("Generated public/favicon.ico, icon.png, apple-icon.png");
