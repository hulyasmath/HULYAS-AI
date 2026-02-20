const { nanoid } = require('nanoid');
const { sendEvent } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { Tools, StepTypes, FileContext, ErrorTypes } = require('librechat-data-provider');
const {
  EnvVar,
  Providers,
  GraphEvents,
  getMessageId,
  ToolEndHandler,
  handleToolCalls,
  ChatModelStreamHandler,
} = require('@librechat/agents');
const { processFileCitations } = require('~/server/services/Files/Citations');
const { processCodeOutput } = require('~/server/services/Files/Code/process');
const { loadAuthValues } = require('~/server/services/Tools/credentials');
const { saveBase64Image } = require('~/server/services/Files/process');

class ModelEndHandler {
  /**
   * @param {Array<UsageMetadata>} collectedUsage
   * @param {{ value: string | undefined }} [finishReasonRef]
   */
  constructor(collectedUsage, finishReasonRef) {
    if (!Array.isArray(collectedUsage)) {
      throw new Error('collectedUsage must be an array');
    }
    this.collectedUsage = collectedUsage;
    /** @type {{ value: string | undefined }} */
    this.finishReasonRef = finishReasonRef || { value: undefined };
  }

  finalize(errorMessage) {
    if (!errorMessage) {
      return;
    }
    throw new Error(errorMessage);
  }

  /**
   * @param {string} event
   * @param {ModelEndData | undefined} data
   * @param {Record<string, unknown> | undefined} metadata
   * @param {StandardGraph} graph
   * @returns {Promise<void>}
   */
  async handle(event, data, metadata, graph) {
    if (!graph || !metadata) {
      console.warn(`Graph or metadata not found in ${event} event`);
      return;
    }

    /** @type {string | undefined} */
    let errorMessage;
    try {
      const agentContext = graph.getAgentContext(metadata);
      const isGoogle = agentContext.provider === Providers.GOOGLE;
      const streamingDisabled = !!agentContext.clientOptions?.disableStreaming;
      if (data?.output?.additional_kwargs?.stop_reason === 'refusal') {
        const info = { ...data.output.additional_kwargs };
        errorMessage = JSON.stringify({
          type: ErrorTypes.REFUSAL,
          info,
        });
        logger.debug(`[ModelEndHandler] Model refused to respond`, {
          ...info,
          userId: metadata.user_id,
          messageId: metadata.run_id,
          conversationId: metadata.thread_id,
        });
      }

      const toolCalls = data?.output?.tool_calls;
      let hasUnprocessedToolCalls = false;
      if (Array.isArray(toolCalls) && toolCalls.length > 0 && graph?.toolCallStepIds?.has) {
        try {
          hasUnprocessedToolCalls = toolCalls.some(
            (tc) => tc?.id && !graph.toolCallStepIds.has(tc.id),
          );
        } catch {
          hasUnprocessedToolCalls = false;
        }
      }
      if (isGoogle || streamingDisabled || hasUnprocessedToolCalls) {
        await handleToolCalls(toolCalls, metadata, graph);
      }

      // Extract finish_reason from the LLM response for Continue button support
      const finishReason =
        data?.output?.response_metadata?.finish_reason ??
        data?.output?.additional_kwargs?.finish_reason ??
        data?.output?.additional_kwargs?.stop_reason;
      if (finishReason && this.finishReasonRef) {
        this.finishReasonRef.value = finishReason;
        logger.info('[ContinueBtn:1] Direct finish_reason from LLM: ' + finishReason);
      }

      const usage = data?.output?.usage_metadata;
      if (!usage) {
        logger.info('[ContinueBtn:2] No usage_metadata in CHAT_MODEL_END — finishReasonRef=' + (this.finishReasonRef?.value || 'undefined'));
        return this.finalize(errorMessage);
      }
      const modelName = metadata?.ls_model_name || agentContext.clientOptions?.model;
      if (modelName) {
        usage.model = modelName;
      }

      logger.info('[ContinueBtn:3] CHAT_MODEL_END usage: output_tokens=' + (usage.output_tokens || 0) + ', model=' + (modelName || 'unknown'));

      this.collectedUsage.push(usage);

      // Token-count heuristic for finish_reason when LangGraph doesn't propagate it
      // (common in streaming mode with DeepSeek/OpenAI-compatible providers).
      // If output_tokens >= configured max output tokens, the response was truncated.
      if (!this.finishReasonRef?.value && usage) {
        const outputTokens = Number(usage.output_tokens) || 0;
        const co = agentContext.clientOptions || {};
        const configuredMax =
          co.maxTokens ||
          co.maxCompletionTokens ||
          co.maxOutputTokens ||
          co.max_tokens ||
          co.modelKwargs?.max_completion_tokens ||
          co.modelKwargs?.max_output_tokens ||
          co.modelKwargs?.max_tokens ||
          0;

        // If no explicit max configured, use model-specific API defaults
        // DeepSeek API docs: deepseek-chat defaults to 4096, deepseek-reasoner to 32768
        let effectiveMax = configuredMax;
        if (effectiveMax === 0 && co.model) {
          const m = (co.model || '').toLowerCase();
          if (m.includes('deepseek-reasoner') || m.includes('deepseek-r1')) {
            effectiveMax = 32768;
          } else if (m.includes('deepseek')) {
            effectiveMax = 4096;
          } else if (m.includes('gpt-4')) {
            effectiveMax = 16384;
          } else if (m.includes('gpt-3.5')) {
            effectiveMax = 4096;
          }
          // For unknown models, effectiveMax stays 0 and heuristic is skipped
        }

        // Use 90% threshold to account for minor token counting differences
        const threshold = Math.floor(effectiveMax * 0.9);

        logger.info('[ContinueBtn:4] Heuristic check: outputTokens=' + outputTokens + ', effectiveMax=' + effectiveMax + ', threshold=' + threshold + ', configuredMax=' + configuredMax + ', model=' + (co.model || 'none'));

        if (effectiveMax > 0 && outputTokens >= threshold) {
          this.finishReasonRef.value = 'length';
          logger.info('[ContinueBtn:5] SET finish_reason=length via heuristic: ' + outputTokens + '>=' + threshold);
        } else {
          logger.info('[ContinueBtn:5] Heuristic did NOT trigger: ' + outputTokens + '<' + threshold + ' (or effectiveMax=0)');
        }
      } else if (this.finishReasonRef?.value) {
        logger.info('[ContinueBtn:4] Skipping heuristic, already have finish_reason=' + this.finishReasonRef.value);
      }
      if (!streamingDisabled) {
        return this.finalize(errorMessage);
      }
      if (!data.output.content) {
        return this.finalize(errorMessage);
      }
      const stepKey = graph.getStepKey(metadata);
      const message_id = getMessageId(stepKey, graph) ?? '';
      if (message_id) {
        await graph.dispatchRunStep(stepKey, {
          type: StepTypes.MESSAGE_CREATION,
          message_creation: {
            message_id,
          },
        });
      }
      const stepId = graph.getStepIdByKey(stepKey);
      const content = data.output.content;
      if (typeof content === 'string') {
        await graph.dispatchMessageDelta(stepId, {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        });
      } else if (content.every((c) => c.type?.startsWith('text'))) {
        await graph.dispatchMessageDelta(stepId, {
          content,
        });
      }
    } catch (error) {
      logger.error('Error handling model end event:', error);
      return this.finalize(errorMessage);
    }
  }
}

/**
 * Wrapper around ChatModelStreamHandler that captures finish_reason from streaming chunks.
 * In streaming mode, the CHAT_MODEL_END event's AIMessage does NOT contain finish_reason
 * in response_metadata (only usage data). The finish_reason is only available on the
 * last streaming chunk, so we capture it here.
 */
class StreamHandlerWithFinishReason {
  /**
   * @param {ChatModelStreamHandler} innerHandler
   * @param {{ value: string | undefined }} finishReasonRef
   */
  constructor(innerHandler, finishReasonRef) {
    this.innerHandler = innerHandler;
    this.finishReasonRef = finishReasonRef || { value: undefined };
  }

  /**
   * @param {string} event
   * @param {StreamEventData} data
   * @param {Record<string, unknown> | undefined} metadata
   * @param {StandardGraph} graph
   * @returns {Promise<void>}
   */
  async handle(event, data, metadata, graph) {
    // Check for finish_reason in the streaming chunk's response_metadata.
    // Currently LangChain/LangGraph does NOT propagate finish_reason in streaming chunks,
    // but this handler is kept as a fallback for future versions that may include it.
    const chunk = data?.chunk || data;
    const finishReason =
      chunk?.response_metadata?.finish_reason ??
      chunk?.additional_kwargs?.finish_reason ??
      chunk?.additional_kwargs?.stop_reason ??
      data?.response_metadata?.finish_reason;
    if (finishReason && this.finishReasonRef) {
      this.finishReasonRef.value = finishReason;
    }

    // Delegate to the original ChatModelStreamHandler
    return this.innerHandler.handle(event, data, metadata, graph);
  }
}

/**
 * @deprecated Agent Chain helper
 * @param {string | undefined} [last_agent_id]
 * @param {string | undefined} [langgraph_node]
 * @returns {boolean}
 */
function checkIfLastAgent(last_agent_id, langgraph_node) {
  if (!last_agent_id || !langgraph_node) {
    return false;
  }
  return langgraph_node?.endsWith(last_agent_id);
}

/**
 * Get default handlers for stream events.
 * @param {Object} options - The options object.
 * @param {ServerResponse} options.res - The options object.
 * @param {ContentAggregator} options.aggregateContent - The options object.
 * @param {ToolEndCallback} options.toolEndCallback - Callback to use when tool ends.
 * @param {Array<UsageMetadata>} options.collectedUsage - The list of collected usage metadata.
 * @param {{ value: string | undefined }} [options.finishReasonRef] - Shared ref for finish_reason.
 * @returns {Record<string, t.EventHandler>} The default handlers.
 * @throws {Error} If the request is not found.
 */
function getDefaultHandlers({ res, aggregateContent, toolEndCallback, collectedUsage, finishReasonRef }) {
  if (!res || !aggregateContent) {
    throw new Error(
      `[getDefaultHandlers] Missing required options: res: ${!res}, aggregateContent: ${!aggregateContent}`,
    );
  }
  const handlers = {
    [GraphEvents.CHAT_MODEL_END]: new ModelEndHandler(collectedUsage, finishReasonRef),
    [GraphEvents.TOOL_END]: new ToolEndHandler(toolEndCallback, logger),
    [GraphEvents.CHAT_MODEL_STREAM]: new StreamHandlerWithFinishReason(new ChatModelStreamHandler(), finishReasonRef),
    [GraphEvents.ON_RUN_STEP]: {
      /**
       * Handle ON_RUN_STEP event.
       * @param {string} event - The event name.
       * @param {StreamEventData} data - The event data.
       * @param {GraphRunnableConfig['configurable']} [metadata] The runnable metadata.
       */
      handle: (event, data, metadata) => {
        if (data?.stepDetails.type === StepTypes.TOOL_CALLS) {
          sendEvent(res, { event, data });
        } else if (checkIfLastAgent(metadata?.last_agent_id, metadata?.langgraph_node)) {
          sendEvent(res, { event, data });
        } else if (!metadata?.hide_sequential_outputs) {
          sendEvent(res, { event, data });
        } else {
          const agentName = metadata?.name ?? 'Agent';
          const isToolCall = data?.stepDetails.type === StepTypes.TOOL_CALLS;
          const action = isToolCall ? 'performing a task...' : 'thinking...';
          sendEvent(res, {
            event: 'on_agent_update',
            data: {
              runId: metadata?.run_id,
              message: `${agentName} is ${action}`,
            },
          });
        }
        aggregateContent({ event, data });
      },
    },
    [GraphEvents.ON_RUN_STEP_DELTA]: {
      /**
       * Handle ON_RUN_STEP_DELTA event.
       * @param {string} event - The event name.
       * @param {StreamEventData} data - The event data.
       * @param {GraphRunnableConfig['configurable']} [metadata] The runnable metadata.
       */
      handle: (event, data, metadata) => {
        if (data?.delta.type === StepTypes.TOOL_CALLS) {
          sendEvent(res, { event, data });
        } else if (checkIfLastAgent(metadata?.last_agent_id, metadata?.langgraph_node)) {
          sendEvent(res, { event, data });
        } else if (!metadata?.hide_sequential_outputs) {
          sendEvent(res, { event, data });
        }
        aggregateContent({ event, data });
      },
    },
    [GraphEvents.ON_RUN_STEP_COMPLETED]: {
      /**
       * Handle ON_RUN_STEP_COMPLETED event.
       * @param {string} event - The event name.
       * @param {StreamEventData & { result: ToolEndData }} data - The event data.
       * @param {GraphRunnableConfig['configurable']} [metadata] The runnable metadata.
       */
      handle: (event, data, metadata) => {
        if (data?.result != null) {
          sendEvent(res, { event, data });
        } else if (checkIfLastAgent(metadata?.last_agent_id, metadata?.langgraph_node)) {
          sendEvent(res, { event, data });
        } else if (!metadata?.hide_sequential_outputs) {
          sendEvent(res, { event, data });
        }
        aggregateContent({ event, data });
      },
    },
    [GraphEvents.ON_MESSAGE_DELTA]: {
      /**
       * Handle ON_MESSAGE_DELTA event.
       * @param {string} event - The event name.
       * @param {StreamEventData} data - The event data.
       * @param {GraphRunnableConfig['configurable']} [metadata] The runnable metadata.
       */
      handle: (event, data, metadata) => {
        if (checkIfLastAgent(metadata?.last_agent_id, metadata?.langgraph_node)) {
          sendEvent(res, { event, data });
        } else if (!metadata?.hide_sequential_outputs) {
          sendEvent(res, { event, data });
        }
        aggregateContent({ event, data });
      },
    },
    [GraphEvents.ON_REASONING_DELTA]: {
      /**
       * Handle ON_REASONING_DELTA event.
       * @param {string} event - The event name.
       * @param {StreamEventData} data - The event data.
       * @param {GraphRunnableConfig['configurable']} [metadata] The runnable metadata.
       */
      handle: (event, data, metadata) => {
        if (checkIfLastAgent(metadata?.last_agent_id, metadata?.langgraph_node)) {
          sendEvent(res, { event, data });
        } else if (!metadata?.hide_sequential_outputs) {
          sendEvent(res, { event, data });
        }
        aggregateContent({ event, data });
      },
    },
  };

  return handlers;
}

/**
 *
 * @param {Object} params
 * @param {ServerRequest} params.req
 * @param {ServerResponse} params.res
 * @param {Promise<MongoFile | { filename: string; filepath: string; expires: number;} | null>[]} params.artifactPromises
 * @returns {ToolEndCallback} The tool end callback.
 */
function createToolEndCallback({ req, res, artifactPromises }) {
  /**
   * @type {ToolEndCallback}
   */
  return async (data, metadata) => {
    const output = data?.output;
    if (!output) {
      return;
    }

    if (!output.artifact) {
      return;
    }

    if (output.artifact[Tools.file_search]) {
      artifactPromises.push(
        (async () => {
          const user = req.user;
          const attachment = await processFileCitations({
            user,
            metadata,
            appConfig: req.config,
            toolArtifact: output.artifact,
            toolCallId: output.tool_call_id,
          });
          if (!attachment) {
            return null;
          }
          if (!res.headersSent) {
            return attachment;
          }
          res.write(`event: attachment\ndata: ${JSON.stringify(attachment)}\n\n`);
          return attachment;
        })().catch((error) => {
          logger.error('Error processing file citations:', error);
          return null;
        }),
      );
    }

    // TODO: a lot of duplicated code in createToolEndCallback
    // we should refactor this to use a helper function in a follow-up PR
    if (output.artifact[Tools.ui_resources]) {
      artifactPromises.push(
        (async () => {
          const attachment = {
            type: Tools.ui_resources,
            messageId: metadata.run_id,
            toolCallId: output.tool_call_id,
            conversationId: metadata.thread_id,
            [Tools.ui_resources]: output.artifact[Tools.ui_resources].data,
          };
          if (!res.headersSent) {
            return attachment;
          }
          res.write(`event: attachment\ndata: ${JSON.stringify(attachment)}\n\n`);
          return attachment;
        })().catch((error) => {
          logger.error('Error processing artifact content:', error);
          return null;
        }),
      );
    }

    if (output.artifact[Tools.web_search]) {
      artifactPromises.push(
        (async () => {
          const attachment = {
            type: Tools.web_search,
            messageId: metadata.run_id,
            toolCallId: output.tool_call_id,
            conversationId: metadata.thread_id,
            [Tools.web_search]: { ...output.artifact[Tools.web_search] },
          };
          if (!res.headersSent) {
            return attachment;
          }
          res.write(`event: attachment\ndata: ${JSON.stringify(attachment)}\n\n`);
          return attachment;
        })().catch((error) => {
          logger.error('Error processing artifact content:', error);
          return null;
        }),
      );
    }

    if (output.artifact.content) {
      /** @type {FormattedContent[]} */
      const content = output.artifact.content;
      for (let i = 0; i < content.length; i++) {
        const part = content[i];
        if (!part) {
          continue;
        }
        if (part.type !== 'image_url') {
          continue;
        }
        const { url } = part.image_url;
        artifactPromises.push(
          (async () => {
            const filename = `${output.name}_${output.tool_call_id}_img_${nanoid()}`;
            const file_id = output.artifact.file_ids?.[i];
            const file = await saveBase64Image(url, {
              req,
              file_id,
              filename,
              endpoint: metadata.provider,
              context: FileContext.image_generation,
            });
            const fileMetadata = Object.assign(file, {
              messageId: metadata.run_id,
              toolCallId: output.tool_call_id,
              conversationId: metadata.thread_id,
            });
            if (!res.headersSent) {
              return fileMetadata;
            }

            if (!fileMetadata) {
              return null;
            }

            res.write(`event: attachment\ndata: ${JSON.stringify(fileMetadata)}\n\n`);
            return fileMetadata;
          })().catch((error) => {
            logger.error('Error processing artifact content:', error);
            return null;
          }),
        );
      }
      return;
    }

    {
      if (output.name !== Tools.execute_code) {
        return;
      }
    }

    if (!output.artifact.files) {
      return;
    }

    for (const file of output.artifact.files) {
      const { id, name } = file;
      artifactPromises.push(
        (async () => {
          const result = await loadAuthValues({
            userId: req.user.id,
            authFields: [EnvVar.CODE_API_KEY],
          });
          const fileMetadata = await processCodeOutput({
            req,
            id,
            name,
            apiKey: result[EnvVar.CODE_API_KEY],
            messageId: metadata.run_id,
            toolCallId: output.tool_call_id,
            conversationId: metadata.thread_id,
            session_id: output.artifact.session_id,
          });
          if (!res.headersSent) {
            return fileMetadata;
          }

          if (!fileMetadata) {
            return null;
          }

          res.write(`event: attachment\ndata: ${JSON.stringify(fileMetadata)}\n\n`);
          return fileMetadata;
        })().catch((error) => {
          logger.error('Error processing code output:', error);
          return null;
        }),
      );
    }
  };
}

module.exports = {
  getDefaultHandlers,
  createToolEndCallback,
};
