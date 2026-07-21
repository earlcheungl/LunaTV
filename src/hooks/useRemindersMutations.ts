// 提醒变更存根 - 精简版不启用
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useToggleReminderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // 存根实现
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useClearRemindersMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // 存根实现
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
