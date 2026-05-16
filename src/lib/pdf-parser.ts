import { PDFParse } from 'pdf-parse';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PdfParseResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

/**
 * Extract text content from a PDF file
 * @param filePath - Absolute path to the PDF file
 * @returns Parsed text content and metadata
 */
export async function parsePdf(filePath: string): Promise<PdfParseResult> {
  try {
    // Verify file exists
    await fs.access(filePath);
    
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse PDF using PDFParse class
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();
    
    return {
      success: true,
      text: result.text,
      pageCount: result.pages.length,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing PDF',
    };
  }
}

/**
 * Validate PDF file path and ensure it's within allowed directory
 * @param filePath - Path to validate
 * @param allowedBaseDir - Base directory that files must be within
 * @returns True if valid
 */
export function validatePdfPath(filePath: string, allowedBaseDir: string): boolean {
  try {
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(allowedBaseDir);
    
    // Ensure the file is within the allowed base directory
    return resolvedPath.startsWith(resolvedBase);
  } catch {
    return false;
  }
}
