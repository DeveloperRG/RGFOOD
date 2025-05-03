/**
 * QR Code utility functions
 */
import QRCode from 'qrcode';

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
