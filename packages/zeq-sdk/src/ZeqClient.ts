/**
 * Zeq OS Mathematical Framework - HTTP Client
 * Client for interacting with LibreChat's Zeq API endpoints
 */

import {
  ZeqClientOptions,
  ZeqProcessingResult,
  ZeqApiResponse,
  ZeqStatusResponse,
  ZeqOperatorListResponse,
  ZeqLogEntry,
  ZeqTransparencyReport,
  ZeqDomainDetectionResult,
} from './types';

/**
 * ZeqClient - HTTP client for LibreChat Zeq API
 */
export class ZeqClient {
  private baseUrl: string;
  private jwtToken?: string;
  private apiKey?: string;
  private timeout: number;

  constructor(options: ZeqClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.jwtToken = options.jwtToken;
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || 30000;
  }

  /**
   * Set JWT token for authentication
   */
  setJwtToken(token: string): void {
    this.jwtToken = token;
  }

  /**
   * Set API key for authentication
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Make authenticated request to API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<ZeqApiResponse<T>> {
    const url = `${this.baseUrl}/api/zeq${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const processingTimeMs = performance.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          processingTimeMs,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        processingTimeMs,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      const processingTimeMs = performance.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          processingTimeMs,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs,
      };
    }
  }

  /**
   * Process text through the mathematical framework
   */
  async process(text: string): Promise<ZeqApiResponse<ZeqProcessingResult>> {
    return this.request<ZeqProcessingResult>('POST', '/process', { text });
  }

  /**
   * Get framework status
   */
  async getStatus(): Promise<ZeqApiResponse<ZeqStatusResponse>> {
    return this.request<ZeqStatusResponse>('GET', '/status');
  }

  /**
   * Get list of available operators
   */
  async getOperators(domain?: string): Promise<ZeqApiResponse<ZeqOperatorListResponse>> {
    const endpoint = domain ? `/operators?domain=${encodeURIComponent(domain)}` : '/operators';
    return this.request<ZeqOperatorListResponse>('GET', endpoint);
  }

  /**
   * Detect domains from text
   */
  async detectDomains(text: string): Promise<ZeqApiResponse<ZeqDomainDetectionResult>> {
    return this.request<ZeqDomainDetectionResult>('POST', '/detect-domains', { text });
  }

  /**
   * Get processing logs for a conversation
   */
  async getLogs(conversationId: string): Promise<ZeqApiResponse<ZeqLogEntry[]>> {
    return this.request<ZeqLogEntry[]>('GET', `/logs/${encodeURIComponent(conversationId)}`);
  }

  /**
   * Get audit trail for a message
   */
  async getAuditTrail(messageId: string): Promise<ZeqApiResponse<unknown>> {
    return this.request<unknown>('GET', `/audit/${encodeURIComponent(messageId)}`);
  }

  /**
   * Get full transparency report for a message
   */
  async getTransparencyReport(messageId: string): Promise<ZeqApiResponse<ZeqTransparencyReport>> {
    return this.request<ZeqTransparencyReport>('GET', `/transparency/${encodeURIComponent(messageId)}`);
  }

  /**
   * Get processing statistics
   */
  async getStats(): Promise<ZeqApiResponse<unknown>> {
    return this.request<unknown>('GET', '/stats');
  }

  /**
   * Delete logs for a conversation
   */
  async deleteLogs(conversationId: string): Promise<ZeqApiResponse<{ deleted: number }>> {
    return this.request<{ deleted: number }>('DELETE', `/logs/${encodeURIComponent(conversationId)}`);
  }

  /**
   * Export logs for a conversation
   */
  async exportLogs(conversationId: string): Promise<ZeqApiResponse<unknown>> {
    return this.request<unknown>('GET', `/export/${encodeURIComponent(conversationId)}`);
  }

  /**
   * Check if the client can connect to the API
   */
  async ping(): Promise<boolean> {
    const response = await this.getStatus();
    return response.success;
  }
}

export default ZeqClient;
