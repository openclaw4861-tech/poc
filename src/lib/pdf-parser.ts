import * as fs from 'fs/promises';
import * as path from 'path';
import * as url from 'url';
import { PDFParse } from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Register the pdfjs worker from its source location so the Node.js fake worker works.
 * Must be called before any PDF parsing to avoid the "setting up fake worker failed" error.
 */
function registerPdfWorker() {
  // In Node.js, point workerSrc to the actual node_modules location
  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
  const global = globalThis as any;
  if (typeof global.pdfjs === 'undefined') {
    global.pdfjs = pdfjsLib;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
}

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
    // Register pdfjs worker to avoid "setting up fake worker failed" in Next.js bundled context
    registerPdfWorker();

    // Verify file exists
    await fs.access(filePath);
    
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse PDF using PDFParse class (v2 API)
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
