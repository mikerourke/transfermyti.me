import type { ToolName } from "~/typeDefs";

export const isDevelopmentMode = jest.fn(() => false);

export const isTestingMode = jest.fn(() => false);

export const getApiUrl = (toolName: ToolName): string =>
  `http://localhost:9009/api/${toolName}`;

export const isUseLocalApi = jest.fn(() => true);
