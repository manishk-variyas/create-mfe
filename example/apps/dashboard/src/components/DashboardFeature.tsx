import React from 'react';
import { useQuery } from '@tanstack/react-query';

export function DashboardFeature() {
  const { data, isLoading } = useQuery({
    queryKey: ['module-data-Dashboard'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 1000));
      return { status: 'Live', lastUpdate: new Date().toLocaleTimeString() };
    }
  });
  return (
    <div>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        This is the <strong>Dashboard</strong> microfrontend module.
        Edit <code>src/components/DashboardFeature.tsx</code> to get started.
      </p>
      {isLoading ? (
        <p style={{ fontSize: 12 }}>Fetching query data...</p>
      ) : (
        <p style={{ fontSize: 12, color: '#10b981' }}>
          Remote state: {data?.status} — {data?.lastUpdate}
        </p>
      )}
    </div>
  );
}
