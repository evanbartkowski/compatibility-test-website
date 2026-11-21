import fs from "node:fs/promises";
import sharp from "sharp";

const source = await fs.readFile(new URL("../src/app/icon.svg", import.meta.url));
const publicDir = new URL("../public/", import.meta.url);
for (const size of [32, 180, 192, 512]) {
  const png = await sharp(source).resize(size, size).png().toBuffer();
  await fs.writeFile(new URL(size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`, publicDir), png);
  if (size === 32) {
    const header = Buffer.alloc(22);
    header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
    header[6] = 32; header[7] = 32;
    header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
    header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
    await fs.writeFile(new URL("favicon.ico", publicDir), Buffer.concat([header, png]));
  }
}
console.log("Generated original brand PNGs and a valid favicon.");
