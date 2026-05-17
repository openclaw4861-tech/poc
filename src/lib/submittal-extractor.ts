import * as fs from 'fs/promises';
import * as path from 'path';

export interface SubmittalItem {
  specSection: string;
  specSubsection?: string;
  requirementType?: string;
  description: string;
  details?: string;
}

export interface ExtractionResult {
  success: boolean;
  items?: SubmittalItem[];
  error?: string;
}

/**
 * Extract submittal requirements from a PDF by sending it directly to the AI model
 * @param pdfPath - Absolute path to the PDF file
 * @returns Array of submittal items
 */
export async function extractSubmittalsFromPdf(pdfPath: string): Promise<ExtractionResult> {
  try {
    // Read PDF as base64
    const pdfBuffer = await fs.readFile(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');

    // Call AI with the PDF directly
    const aiResponse = await callAIWithPdf(base64Pdf, pdfPath.endsWith('.pdf'));

    if (!aiResponse.success || !aiResponse.items) {
      return {
        success: false,
        error: aiResponse.error || 'AI extraction failed',
      };
    }

    // Validate and clean the extracted items
    const validatedItems = validateExtractionItems(aiResponse.items);

    if (validatedItems.length === 0) {
      return {
        success: false,
        error: 'No valid submittal items could be extracted from the PDF',
      };
    }

    return {
      success: true,
      items: validatedItems,
    };
  } catch (error) {
    console.error('Error extracting submittals from PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during extraction',
    };
  }
}

/**
 * Call AI with the raw PDF file to extract submittal requirements
 */
async function callAIWithPdf(base64Pdf: string, isPdf: boolean): Promise<ExtractionResult> {
  const systemPrompt = `You are a construction specification expert. Extract all submittal requirements from the PDF document.

Look for items that require submittals such as:
- Product data
- Shop drawings
- Samples
- Test reports
- Certificates
- Warranties
- Maintenance data

Focus especially on the "SUBMITTALS" section (typically section 1.5 or 01 33 00) but also look for submittal requirements scattered throughout the document.

Return the results as a JSON array with this exact structure:
[
  {
    "specSection": "1.5",
    "specSubsection": "A" or "1" or null,
    "requirementType": "Product Data" or "Shop Drawings" or "Samples" etc.,
    "description": "Clear description of what needs to be submitted",
    "details": "Additional details or null"
  }
]

If no submittal requirements are found, return an empty array [].

Return ONLY the JSON array, no other text or explanation.`;

  const userMessage = `Please examine this ${isPdf ? 'PDF' : 'document'} specification and extract all submittal requirements. Return ONLY a JSON array of submittal items.`;

  try {
    // Call Ollama Cloud API with multimodal support
    const response = await fetch('https://api.ollama.cloud/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OLLAMA_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'qwen3.5:cloud',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userMessage },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const items = JSON.parse(jsonStr);

    if (!Array.isArray(items)) {
      throw new Error('AI response is not an array');
    }

    return {
      success: true,
      items: items,
    };
  } catch (error) {
    console.error('AI extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI extraction failed',
    };
  }
}

/**
 * Validate and clean extracted items
 */
function validateExtractionItems(items: any[]): SubmittalItem[] {
  const validated: SubmittalItem[] = [];

  for (const item of items) {
    // Must have description
    if (!item.description || typeof item.description !== 'string') {
      continue;
    }

    const validatedItem: SubmittalItem = {
      specSection: item.specSection || '1.5',
      specSubsection: item.specSubsection || undefined,
      requirementType: item.requirementType || undefined,
      description: item.description.trim(),
      details: item.details || undefined,
    };

    validated.push(validatedItem);
  }

  return validated;
}
