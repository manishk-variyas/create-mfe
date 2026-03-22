import fs from 'fs-extra';
import path from 'path';
import { MFE_CONFIG_FILE, MonorepoConfig } from './types';

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
}

export async function readMfeConfig(cwd: string): Promise<MonorepoConfig> {
  const configPath = path.join(cwd, MFE_CONFIG_FILE);
  if (!(await fs.pathExists(configPath))) {
    throw new Error(`No ${MFE_CONFIG_FILE} found. Run 'create-mfe init' first.`);
  }
  return fs.readJson(configPath) as Promise<MonorepoConfig>;
}

export async function writeMfeConfig(cwd: string, config: MonorepoConfig): Promise<void> {
  await writeJson(path.join(cwd, MFE_CONFIG_FILE), config);
}

export function resolvePort(existingModules: { port: number }[], startPort: number): number {
  const usedPorts = new Set(existingModules.map(m => m.port));
  let port = startPort;
  while (usedPorts.has(port)) port++;
  return port;
}

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}
