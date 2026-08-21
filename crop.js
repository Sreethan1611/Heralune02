const sharp = require('sharp');
const fs = require('fs');

async function cropCenterSquare() {
  const inputPath = 'public/logo.png';
  const metadata = await sharp(inputPath).metadata();
  const size = Math.min(metadata.width, metadata.height);
  const extractRegion = {
    left: Math.floor((metadata.width - size) / 2),
    top: Math.floor((metadata.height - size) / 2),
    width: size,
    height: size
  };
  
  await sharp(inputPath)
    .extract(extractRegion)
    .toFile('public/logo_cropped.png');
    
  console.log(`Cropped to ${size}x${size}`);
}

cropCenterSquare().catch(console.error);
