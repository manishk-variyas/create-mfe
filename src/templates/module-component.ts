import { SharedConfig } from '../utils/types';

export function genModuleComponent(pascalName: string, shared: SharedConfig): string {
  const queryImport = shared.reactQuery 
    ? `import { useQuery } from '@tanstack/react-query';\n`
    : '';

  const queryUsage = shared.reactQuery 
    ? `  const { data, isLoading } = useQuery({
    queryKey: ['module-data-${pascalName}'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 1000));
      return { status: 'Live', lastUpdate: new Date().toLocaleTimeString() };
    }
  });\n`
    : '';

  const queryContent = shared.reactQuery
    ? `\n      {isLoading ? (\n        <p style={{ fontSize: 12 }}>Fetching query data...</p>\n      ) : (\n        <p style={{ fontSize: 12, color: '#10b981' }}>\n          Remote state: {data?.status} — {data?.lastUpdate}\n        </p>\n      )}`
    : '';

  return `import React from 'react';
${queryImport}
export function ${pascalName}Feature() {
${queryUsage}  return (
    <div>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        This is the <strong>${pascalName}</strong> microfrontend module.
        Edit <code>src/components/${pascalName}Feature.tsx</code> to get started.
      </p>${queryContent}
    </div>
  );
}
`;
}
