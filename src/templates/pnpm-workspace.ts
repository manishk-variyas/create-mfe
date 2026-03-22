import { SharedConfig } from '../utils/types';

export function genPnpmWorkspace(shared: SharedConfig, includeApi = false): string {
  let lines = ["packages:", "  - 'apps/*'", "  - 'packages/*'"];
  if (includeApi) {
    lines.push("  - 'api'");
  }
  return lines.join("\n");
}
