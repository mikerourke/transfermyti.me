import { vi } from "vitest";

import type { ToolName } from "~/typeDefs";

export const isDevelopmentMode = vi.fn(() => false);

export const isTestingMode = vi.fn(() => false);

export const getApiUrl = (toolName: ToolName): string =>
  `http://localhost:9009/api/${toolName}`;

export const isUseLocalApi = vi.fn(() => true);
