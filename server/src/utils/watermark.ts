import sharp from "sharp";

export const optimizeAndWatermarkImage = async (buffer: Buffer) => {
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  const width = metadata.width && metadata.width > 2000 ? 2000 : metadata.width;

  const optimized = image
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .webp({ quality: 82 });
  const base = await optimized.toBuffer();
  const baseMetadata = await sharp(base).metadata();
  // The watermark must never exceed the base image on either axis — Sharp's
  // composite() throws "Image to composite must have same dimensions or
  // smaller" otherwise, which happens for any photo narrower than ~686px
  // once the 96px floor below kicks in.
  const rawLogoWidth = Math.max(Math.round((baseMetadata.width ?? 1000) * 0.14), 96);
  const maxWidthByHeight = baseMetadata.height ? Math.floor(baseMetadata.height / 0.34) : rawLogoWidth;
  const logoWidth = Math.max(1, Math.min(rawLogoWidth, baseMetadata.width ?? rawLogoWidth, maxWidthByHeight));

  const logoHeight = Math.max(1, Math.round(logoWidth * 0.34));

  const logo = await sharp({
    create: {
      width: logoWidth,
      height: logoHeight,
      channels: 4,
      background: { r: 16, g: 93, b: 72, alpha: 0.4 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${logoWidth}" height="${logoHeight}"><text x="50%" y="58%" text-anchor="middle" font-size="${Math.max(
            1,
            Math.round(logoWidth * 0.2),
          )}" fill="white" font-family="Arial, sans-serif" font-weight="700">IWOSAN</text></svg>`,
        ),
      },
    ])
    .png()
    .toBuffer();

  return sharp(base)
    .composite([{ input: logo, gravity: "southeast" }])
    .webp({ quality: 82 })
    .toBuffer();
};
