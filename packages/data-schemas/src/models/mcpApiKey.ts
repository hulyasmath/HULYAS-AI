import { mcpApiKeySchema } from '~/schema/mcpApiKey';
import type * as t from '~/types';

export function createMCPApiKeyModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.MCPApiKey || mongoose.model<t.IMCPApiKey>('MCPApiKey', mcpApiKeySchema);
}
