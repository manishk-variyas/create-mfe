import React from 'react';
import { ProfileFeature } from './components/ProfileFeature';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@full-monorepo/ui';
import { useStore } from '@full-monorepo/store';
function useApiData() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch(`${apiUrl}/products`).then(res => res.json()),
  });
  
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetch(`${apiUrl}/orders`).then(res => res.json()),
  });
  
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch(`${apiUrl}/users`).then(res => res.json()),
  });

  return { products: productsQuery, orders: ordersQuery, users: usersQuery };
}
export default function App() {
  const theme = useStore((s) => s.theme);
  const { products, orders, users } = useApiData();
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileFeature />
          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button variant="default">Primary Action</Button>
            <Button variant="outline">Secondary</Button>
            <Badge>Active</Badge>
          </div>
                <Card>
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
      </Card>
        </CardContent>
      </Card>
    </div>
  );
}
