'use client';

/**
 * Security monitoring dashboard (for development/admin use)
 */

import React, { useState, useEffect } from 'react';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';

export const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<Array<{
    type: SecurityEventType;
    timestamp: Date;
    userId?: string;
    details: Record<string, unknown>;
  }>>([]);
  const [filter, setFilter] = useState<SecurityEventType | 'all'>('all');

  useEffect(() => {
    // Get recent security events
    const recentEvents = securityLogger.getRecentEvents(50);
    setEvents(recentEvents);
  }, []);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const eventCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-96 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">🔒 Security Monitor</h3>
        <button 
          onClick={() => setEvents([])}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      {/* Event Type Counts */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        {Object.entries(eventCounts).map(([type, count]) => (
          <div key={type} className="bg-gray-100 p-2 rounded">
            <div className="font-medium">{type.replace('_', ' ')}</div>
            <div className="text-gray-600">{count} events</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <select 
        value={filter} 
        onChange={(e) => setFilter(e.target.value as SecurityEventType | 'all')}
        className="w-full mb-3 p-1 border border-gray-300 rounded text-sm"
      >
        <option value="all">All Events</option>
        {Object.values(SecurityEventType).map(type => (
          <option key={type} value={type}>
            {type.replace('_', ' ').toUpperCase()}
          </option>
        ))}
      </select>

      {/* Events List */}
      <div className="overflow-y-auto max-h-48">
        {filteredEvents.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No security events recorded
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div key={index} className="border-b border-gray-200 py-2 text-xs">
              <div className="flex justify-between items-start">
                <span className={`font-medium ${
                  event.type.includes('failure') || event.type.includes('unauthorized') 
                    ? 'text-red-600' 
                    : event.type.includes('success') 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  {event.type.replace('_', ' ')}
                </span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.userId && (
                <div className="text-gray-600 truncate">
                  User: {event.userId.substring(0, 8)}...
                </div>
              )}
              {Object.keys(event.details).length > 0 && (
                <div className="text-gray-500 truncate">
                  {JSON.stringify(event.details).substring(0, 50)}...
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};