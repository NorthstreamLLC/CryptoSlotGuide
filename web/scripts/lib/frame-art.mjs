import sharp from "sharp";

/**
 * Studio art as the site shows it: a 640px-wide landscape WebP.
 *
 * Landscape art (banners, 16:9 key art) is just resized. Square or portrait
 * tiles — Blueprint, Microgaming and Greentube publish 1:1 tiles with the
 * title across the bottom — would lose the title to the landscape crop every
 * slot frame applies, so they are framed instead: the whole tile centred on a
 * blurred, darkened copy of itself, 640x400. Nothing of the studio's art is
 * altered or cut.
 */
export const ART_WIDTH = 640;
const FRAME_H = 400;

export async function frameArt(buf) {
  const { width = 0, height = 0, hasAlpha } = await sharp(buf).metadata();
  if (!width || !height) throw new Error("not an image");
  // Title logos on transparency (ELK publishes only these) are laid on
  // near-black, so the tile reads the same on any page background.
  if (hasAlpha) buf = await sharp(buf).flatten({ background: "#0d0d12" }).png().toBuffer();
  if (width / height >= 1.3) {
    return sharp(buf).resize({ width: ART_WIDTH, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
  }
  const back = await sharp(buf)
    .resize(ART_WIDTH, FRAME_H, { fit: "cover" })
    .blur(24)
    .modulate({ brightness: 0.55, saturation: 1.1 })
    .toBuffer();
  const tile = await sharp(buf).resize({ height: FRAME_H, width: ART_WIDTH, fit: "inside" }).toBuffer();
  const t = await sharp(tile).metadata();
  return sharp(back)
    .composite([{ input: tile, left: Math.round((ART_WIDTH - (t.width ?? 0)) / 2), top: Math.round((FRAME_H - (t.height ?? 0)) / 2) }])
    .webp({ quality: 74 })
    .toBuffer();
}
