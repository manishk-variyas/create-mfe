export interface MonorepoConfig {
  name: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  modules: ModuleConfig[];
  shared: SharedConfig;
  includeApi?: boolean;
}

export interface ModuleConfig {
  name: string;
  port: number;
  type: 'feature' | 'page' | 'shared';
  exposes: Record<string, string>;
}

export interface SharedConfig {
  ui: boolean;
  utils: boolean;
  state: boolean;
  auth: boolean;
  reactQuery: boolean;
  shadcn: boolean;
}

export const SHELL_PORT = 3000;
export const MODULE_PORT_START = 3001;

export const SHARED_DEPS = [
  'react',
  'react-dom',
  'react-router-dom',
];

export const MFE_CONFIG_FILE = 'mfe.config.json';
