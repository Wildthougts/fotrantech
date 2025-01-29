import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

type LogLevel = 'info' | 'warn' | 'error';
type LogAction = 'delete' | 'update' | 'create' | 'read';

interface LogEntry {
  level: LogLevel;
  action: LogAction;
  userId?: string;
  resource: string;
  resourceId?: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export async function logAction(
  level: LogLevel,
  action: LogAction,
  resource: string,
  message: string,
  {
    userId,
    resourceId,
    metadata
  }: {
    userId?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const logEntry: LogEntry = {
    level,
    action,
    userId,
    resource,
    resourceId,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };

  // Log to console for development
  console[level](JSON.stringify(logEntry, null, 2));

  // Store in database
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert([logEntry]);

    if (error) {
      console.error('Error storing log entry:', error);
    }
  } catch (error) {
    console.error('Failed to store log entry:', error);
  }
}
