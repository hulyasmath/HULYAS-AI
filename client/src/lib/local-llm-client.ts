/**
 * Local LLM Client - Runs inference in the browser using Transformers.js
 * Supports both desktop and mobile devices
 * Uses dynamic imports to avoid loading the library unless needed
 */

// Lazy load transformers to avoid initialization errors when not using local LLM
let transformersModule: any = null;
let transformersEnv: any = null;
let transformersPipeline: any = null;

async function loadTransformers() {
  if (transformersModule) {
    return transformersModule;
  }
  
  try {
    transformersModule = await import('@xenova/transformers');
    transformersEnv = transformersModule.env;
    transformersPipeline = transformersModule.pipeline;
    
    // Configure environment only after loading
    if (transformersEnv) {
      transformersEnv.allowLocalModels = false;
      transformersEnv.allowRemoteModels = true;
    }
    
    return transformersModule;
  } catch (error) {
    console.error('❌ Local LLM: Failed to load transformers library', error);
    throw error;
  }
}

export interface LocalLLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface LocalLLMResponse {
  text: string;
  finished: boolean;
}

// Default model - small, fast, works on mobile
const DEFAULT_MODEL = 'Xenova/Qwen2.5-0.5B-Instruct';
const FALLBACK_MODEL = 'Xenova/Phi-3-mini-4k-instruct';

class LocalLLMClient {
  private pipe: any = null;
  private currentModel: string | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the model pipeline
   */
  async initialize(model: string = DEFAULT_MODEL): Promise<void> {
    if (this.pipe && this.currentModel === model) {
      return; // Already initialized with this model
    }

    if (this.isInitializing) {
      return this.initPromise || Promise.resolve();
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        // Lazy load transformers library
        await loadTransformers();
        
        if (!transformersPipeline) {
          throw new Error('Transformers pipeline not available');
        }
        
        console.log(`🤖 Local LLM: Loading model ${model}...`);
        
        // Use text-generation pipeline for chat
        this.pipe = await transformersPipeline(
          'text-generation',
          model,
          {
            quantized: true, // Use quantized models for smaller size
            progress_callback: (progress: any) => {
              if (progress.status === 'progress') {
                console.log(`📥 Local LLM: Downloading ${progress.file} (${Math.round(progress.progress * 100)}%)`);
              }
            },
          }
        );

        this.currentModel = model;
        this.isInitializing = false;
        console.log(`✅ Local LLM: Model ${model} loaded successfully`);
      } catch (error) {
        console.error(`❌ Local LLM: Failed to load ${model}, trying fallback...`, error);
        this.isInitializing = false;
        
        // Try fallback model
        if (model !== FALLBACK_MODEL) {
          return this.initialize(FALLBACK_MODEL);
        }
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Check if WebGPU is available (for faster inference)
   */
  async checkWebGPU(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    
    try {
      const gpu = (navigator as any).gpu;
      if (gpu) {
        const adapter = await gpu.requestAdapter();
        return !!adapter;
      }
    } catch (e) {
      // WebGPU not available
    }
    
    return false;
  }

  /**
   * Generate text from messages (chat format)
   */
  async *generateStream(
    messages: Array<{ role: string; content: string }>,
    options: LocalLLMOptions = {}
  ): AsyncGenerator<LocalLLMResponse, void, unknown> {
    if (!this.pipe) {
      await this.initialize(options.model);
    }

    if (!this.pipe) {
      throw new Error('Local LLM not initialized');
    }

    // Convert messages to prompt format
    const prompt = this.formatMessages(messages);
    
    const {
      temperature = 0.7,
      maxTokens = 512,
      topP = 0.9,
      topK = 50,
    } = options;

    console.log('🤖 Local LLM: Starting generation...', {
      promptLength: prompt.length,
      temperature,
      maxTokens,
    });

    try {
      // Generate text - Transformers.js returns an array with generated_text
      const result = await this.pipe(prompt, {
        max_new_tokens: maxTokens,
        temperature,
        top_p: topP,
        top_k: topK,
        do_sample: temperature > 0,
        return_full_text: false,
      });

      // Extract generated text from result
      let generatedText = '';
      if (Array.isArray(result) && result.length > 0) {
        generatedText = result[0]?.generated_text || '';
      } else if (typeof result === 'string') {
        generatedText = result;
      } else if (result && typeof result === 'object' && 'generated_text' in result) {
        generatedText = result.generated_text;
      }

      // Simulate streaming by yielding chunks
      // This provides a better UX than showing all text at once
      const chunkSize = 3; // Characters per chunk
      let currentIndex = 0;

      while (currentIndex < generatedText.length) {
        const chunk = generatedText.slice(0, currentIndex + chunkSize);
        const isFinished = currentIndex + chunkSize >= generatedText.length;
        
        yield {
          text: chunk,
          finished: isFinished,
        };

        currentIndex += chunkSize;
        
        // Small delay to simulate streaming (optional, can be removed for faster response)
        if (!isFinished) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Final yield with complete text
      yield {
        text: generatedText,
        finished: true,
      };
    } catch (error) {
      console.error('❌ Local LLM: Generation error', error);
      throw error;
    }
  }

  /**
   * Format messages array into a prompt string
   */
  private formatMessages(messages: Array<{ role: string; content: string }>): string {
    // Format for Qwen2.5/Phi-3 instruction format
    let prompt = '';
    
    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'User') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant' || msg.role === 'Assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      } else if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      }
    }
    
    prompt += 'Assistant:';
    return prompt;
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return [
      DEFAULT_MODEL,
      FALLBACK_MODEL,
      'Xenova/Phi-3-mini-4k-instruct',
      'Xenova/TinyLlama-1.1B-Chat-v1.0',
      'Xenova/Qwen2.5-1.5B-Instruct',
    ];
  }

  /**
   * Check if local LLM is supported
   */
  async isSupported(): Promise<{ supported: boolean; reason?: string }> {
    if (typeof window === 'undefined') {
      return { supported: false, reason: 'Not in browser environment' };
    }

    // Check for WebAssembly support (required)
    if (typeof WebAssembly === 'undefined') {
      return { supported: false, reason: 'WebAssembly not supported' };
    }

    // Check available memory (rough estimate)
    // @ts-ignore
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 2) {
      return { 
        supported: false, 
        reason: 'Insufficient device memory (need at least 2GB)' 
      };
    }

    return { supported: true };
  }
}

// Singleton instance
let clientInstance: LocalLLMClient | null = null;

export function getLocalLLMClient(): LocalLLMClient {
  if (!clientInstance) {
    clientInstance = new LocalLLMClient();
  }
  return clientInstance;
}

export default LocalLLMClient;

