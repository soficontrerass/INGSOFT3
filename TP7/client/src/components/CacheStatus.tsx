import React, { useEffect, useState } from 'react';

interface CacheStatusProps {
  cachedAt?: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({ cachedAt, onRefresh, isLoading }) => {
  const getTimeAgo = (dateStr?: string): string => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div style={{
      padding: '8px 12px',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      fontSize: '12px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>📊 Updated {getTimeAgo(cachedAt)}</span>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        style={{
          padding: '4px 8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Refreshing...' : '🔄 Refresh'}
      </button>
    </div>
  );
};
