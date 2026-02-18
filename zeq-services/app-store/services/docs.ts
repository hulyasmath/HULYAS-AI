// ZEQ OS Documentation Service
// TypeScript service for interacting with documentation API endpoints

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
console.log('[Docs Service] API_BASE_URL:', API_BASE_URL);

export interface DocContent {
  success: boolean;
  path: string;
  content: string;
  size: number;
}

/**
 * Get documentation content by path
 */
export async function getDocContent(docPath: string): Promise<DocContent> {
  // Use query parameter like operators endpoint
  const url = `${API_BASE_URL}/api/zeq/docs?path=${encodeURIComponent(docPath)}`;
  
  console.log('[Docs Service] Fetching documentation from:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Docs Service] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Docs Service] API Error:', response.status, errorText);
      throw new Error(`Failed to fetch documentation: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[Docs Service] Fetched documentation:', data.path, 'Size:', data.size);
    
    return data;
  } catch (error: any) {
    console.error('[Docs Service] Network error fetching documentation:', error);
    console.error('[Docs Service] Error details:', error.message);
    throw error;
  }
}
