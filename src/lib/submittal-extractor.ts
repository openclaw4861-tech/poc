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
 * Extract submittal requirements from PDF text using AI
 * Looks for "1.5 SUBMITTALS" section in CSI spec format
 * @param pdfText - Extracted text from PDF
 * @returns Array of submittal items
 */
export async function extractSubmittals(pdfText: string): Promise<ExtractionResult> {
  try {
    // Find the 1.5 SUBMITTALS section
    const submittalsSection = findSubmittalsSection(pdfText);
    
    if (!submittalsSection) {
      return {
        success: false,
        error: 'Could not find "1.5 SUBMITTALS" section in the specification',
      };
    }

    // Call AI to parse the submittals section
    const aiResponse = await callAIForExtraction(submittalsSection);
    
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
        error: 'No valid submittal items could be extracted',
      };
    }

    return {
      success: true,
      items: validatedItems,
    };
  } catch (error) {
    console.error('Error extracting submittals:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during extraction',
    };
  }
}

/**
 * Find the 1.5 SUBMITTALS section in CSI spec text
 */
function findSubmittalsSection(text: string): string | null {
  // Look for patterns like "1.5 SUBMITTALS" or "1.05 SUBMITTALS" or "SECTION 01 33 00 - SUBMITTALS"
  const patterns = [
    /(?:^|\n)\s*(?:PART\s+1[-.\s]*)?(?:1[.\s]*)?(?:0?[1-9][.\s]*)?(?:1[.\s]*[0-9])?\s*SUBMITTALS\s*\n/i,
    /(?:^|\n)\s*SUBMITTALS\s*\n/i,
    /SECTION\s+01\s+33\s+00\s*[-:]\s*SUBMITTALS/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const startIndex = match.index || 0;
      // Extract from the match to the next major section (PART 2, 2.0, etc.)
      const remainingText = text.substring(startIndex);
      const nextSectionMatch = remainingText.match(/\n\s*(?:PART\s+2|2[.\s]*[A-Z]|2\.0)/i);
      
      if (nextSectionMatch && nextSectionMatch.index !== undefined) {
        return remainingText.substring(0, nextSectionMatch.index);
      }
      
      // If no next section found, return a reasonable chunk (up to 8000 chars for AI context)
      return remainingText.substring(0, 8000);
    }
  }

  return null;
}

/**
 * Call AI API to parse submittal items from text
 */
async function callAIForExtraction(submittalsText: string): Promise<ExtractionResult> {
  const prompt = `You are a construction specification expert. Extract all submittal requirements from the following CSI specification text.

Look for items that require submittals such as:
- Product data
- Shop drawings
- Samples
- Test reports
- Certificates
- Warranties
- Maintenance data

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

Here is the specification text:

${submittalsText.substring(0, 7000)}
`;

  try {
    // Call Ollama Cloud API (Qwen 3.5)
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
            content: 'You are a construction specification expert. Extract submittal requirements and return ONLY valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
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
