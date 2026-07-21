// 提醒查询存根 - 精简版不启用
'use client';

import { useQuery } from '@tanstack/react-query';

export function useRemindersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      return {};
    },
    enabled: options?.enabled ?? false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIsRemindedQuery(source: string, id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reminders', source, id],
    queryFn: async () => {
      return false;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}
