import { SharedConfig } from '../utils/types';

export function genModuleApp(
  pascalName: string,
  shared: SharedConfig,
  workspaceName: string,
  moduleName: string,
): string {
  const storeImport = shared.state
    ? `import { useStore } from '@${workspaceName}/store';\n`
    : '';

  const uiImport = shared.ui
    ? `import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@${workspaceName}/ui';\n`
    : '';

  const queryImport = shared.reactQuery
    ? `import { useQuery } from '@tanstack/react-query';\n`
    : '';

  const queryHook = shared.reactQuery
    ? `function useApiData() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch(\`\${apiUrl}/products\`).then(res => res.json()),
  });
  
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetch(\`\${apiUrl}/orders\`).then(res => res.json()),
  });
  
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch(\`\${apiUrl}/users\`).then(res => res.json()),
  });

  return { products: productsQuery, orders: ordersQuery, users: usersQuery };
}`
    : '';

  const storeUsage = shared.state
    ? `  const theme = useStore((s) => s.theme);\n`
    : '';

  const dataSection = shared.reactQuery
    ? `      <Card>
        <CardHeader>
          <CardTitle>API Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: 16 }}>
            <strong>Products:</strong> {products.isLoading ? 'Loading...' : products.data?.length ?? 0} items
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Orders:</strong> {orders.isLoading ? 'Loading...' : orders.data?.length ?? 0} orders
          </div>
          <div>
            <strong>Users:</strong> {users.isLoading ? 'Loading...' : users.data?.length ?? 0} users
          </div>
        </CardContent>
      </Card>`
    : '';

  const uiContent = shared.ui
    ? `      <Card>
        <CardHeader>
          <CardTitle>${pascalName} Module</CardTitle>
        </CardHeader>
        <CardContent>
          <${pascalName}Feature />
          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button variant="default">Primary Action</Button>
            <Button variant="outline">Secondary</Button>
            <Badge>Active</Badge>
          </div>
          ${dataSection}
        </CardContent>
      </Card>`
    : `      <div>
        <h2>${pascalName} Module</h2>
        <${pascalName}Feature />
        ${dataSection}
      </div>`;

  return `import React from 'react';
import { ${pascalName}Feature } from './components/${pascalName}Feature';
${queryImport}${uiImport}${storeImport}${queryHook}
export default function App() {
${storeUsage}${shared.reactQuery ? `  const { products, orders, users } = useApiData();\n` : ''}  return (
    <div style={{ padding: 24 }}>
${uiContent}
    </div>
  );
}
`;
}
