/**
 * QR Code utility functions
 */
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

/**
 * Generate a QR code URL for a table
 * This function creates a URL that can be used to generate a QR code
 *
 * @param {string} tableId - The ID of the table
 * @param {string} domain - The domain to use (defaults to process.env.NEXT_PUBLIC_APP_URL)
 * @returns {string} - The URL for the table QR code
 */
export function generateTableQrCodeUrl(tableId: string, domain?: string): string {
  // Use the provided domain or fall back to the environment variable
  const baseUrl = domain || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Create the URL for the table
  return `${baseUrl}/table/${tableId}`;
}

/**
 * Generate a data URL for a QR code
 * Uses the 'qrcode' library to generate a QR code as a data URL
 *
 * @param {string} url - The URL to encode in the QR code
 * @param {object} options - Options for QR code generation
 * @returns {Promise<string>} - A promise that resolves to the QR code data URL
 */
export async function generateQrCodeDataUrl(url: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  try {
    // Default options for QR code generation
    const defaultOptions: QRCode.QRCodeToDataURLOptions = {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    // Generate QR code as data URL
    return await QRCode.toDataURL(url, defaultOptions);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate a QR code as a PNG buffer
 * Uses the 'qrcode' library to generate a QR code as a buffer
 *
 * @param {string} url - The URL to encode in the QR code
 * @param {object} options - Options for QR code generation
 * @returns {Promise<Buffer>} - A promise that resolves to the QR code buffer
 */
export async function generateQrCodeBuffer(url: string, options?: QRCode.QRCodeToBufferOptions): Promise<Buffer> {
  try {
    // Default options for QR code generation
    const defaultOptions: QRCode.QRCodeToBufferOptions = {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    // Generate QR code as buffer
    return await QRCode.toBuffer(url, defaultOptions);
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw new Error("Failed to generate QR code buffer");
  }
}

/**
 * Generate a QR code with a logo in the center
 * Uses the 'qrcode' and 'canvas' libraries to generate a QR code with a logo
 *
 * @param {string} url - The URL to encode in the QR code
 * @param {object} options - Options for QR code generation
 * @returns {Promise<string>} - A promise that resolves to the QR code data URL with logo
 */
export async function generateQrCodeWithLogo(
  url: string,
  options?: QRCode.QRCodeToDataURLOptions & { logoWidth?: number; logoHeight?: number }
): Promise<string> {
  try {
    // Default options for QR code generation
    const defaultOptions: QRCode.QRCodeRenderersOptions = {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H', // High error correction for logo overlay
      ...options
    };

    // Create a canvas to draw the QR code
    const canvas = createCanvas(defaultOptions.width as number, defaultOptions.width as number);
    const ctx = canvas.getContext('2d');

    // Generate QR code and draw it on the canvas
    const qrCodeDataUrl = await QRCode.toDataURL(url, defaultOptions);
    const qrCodeImage = await loadImage(qrCodeDataUrl);
    ctx.drawImage(qrCodeImage, 0, 0, canvas.width, canvas.height);

    // Load and draw the logo in the center
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoImage = await loadImage(logoPath);

    // Calculate logo size and position (default to 20% of QR code size)
    const logoWidth = options?.logoWidth || canvas.width * 0.2;
    const logoHeight = options?.logoHeight || canvas.height * 0.2;
    const logoX = (canvas.width - logoWidth) / 2;
    const logoY = (canvas.height - logoHeight) / 2;

    // Create a white background for the logo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);

    // Draw the logo
    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error generating QR code with logo:", error);
    throw new Error("Failed to generate QR code with logo");
  }
}

/**
 * Generate a QR code with a logo as a buffer
 * Uses the 'qrcode' and 'canvas' libraries to generate a QR code with a logo
 *
 * @param {string} url - The URL to encode in the QR code
 * @param {object} options - Options for QR code generation
 * @returns {Promise<Buffer>} - A promise that resolves to the QR code buffer with logo
 */
export async function generateQrCodeWithLogoBuffer(
  url: string,
  options?: QRCode.QRCodeRenderersOptions & { logoWidth?: number; logoHeight?: number }
): Promise<Buffer> {
  try {
    // Default options for QR code generation
    const defaultOptions: QRCode.QRCodeRenderersOptions = {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H', // High error correction for logo overlay
      ...options
    };

    // Create a canvas to draw the QR code
    const canvas = createCanvas(defaultOptions.width as number, defaultOptions.width as number);
    const ctx = canvas.getContext('2d');

    // Generate QR code and draw it on the canvas
    await QRCode.toCanvas(canvas, url, defaultOptions);

    // Load and draw the logo in the center
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoImage = await loadImage(logoPath);

    // Calculate logo size and position (default to 20% of QR code size)
    const logoWidth = options?.logoWidth || canvas.width * 0.2;
    const logoHeight = options?.logoHeight || canvas.height * 0.2;
    const logoX = (canvas.width - logoWidth) / 2;
    const logoY = (canvas.height - logoHeight) / 2;

    // Create a white background for the logo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);

    // Draw the logo
    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

    // Convert canvas to buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error("Error generating QR code buffer with logo:", error);
    throw new Error("Failed to generate QR code buffer with logo");
  }
}
