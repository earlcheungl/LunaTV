// 观影室 Hook 存根 - 精简版不启用
'use client';

import { useState, useCallback } from 'react';

export function useWatchRoom(options?: any) {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(null);

  const connect = useCallback(() => {}, []);
  const disconnect = useCallback(() => {}, []);
  const createRoom = useCallback(async (data: any) => {
    return { success: false, error: '观影室功能已禁用', room: null };
  }, []);
  const joinRoom = useCallback(async (roomId: string, password?: string) => {
    return { success: false, error: '观影室功能已禁用', room: null, members: [] };
  }, []);
  const leaveRoom = useCallback(async () => {}, []);
  const sendMessage = useCallback(async (message: string) => {}, []);
  const getRoomList = useCallback(async () => [], []);
  const dismissRoomFromList = useCallback(async (roomId: string) => ({ success: true }), []);
  const hasOwnerToken = useCallback((roomId: string) => false, []);
  const updatePlayState = useCallback(async (state: any) => {}, []);
  const seekTo = useCallback(async (time: number) => {}, []);
  const play = useCallback(async () => {}, []);
  const pause = useCallback(async () => {}, []);
  const changeVideo = useCallback(async (data: any) => {}, []);
  const changeLiveChannel = useCallback(async (data: any) => {}, []);
  const startScreenShare = useCallback(async () => {}, []);
  const stopScreenShare = useCallback(async () => {}, []);
  const clearState = useCallback(async () => ({ success: true, error: undefined }), []);

  return {
    socket: null,
    connected: isConnected,
    currentRoom: room,
    members: [],
    messages: [],
    isOwner: false,
    hasOwnerToken,
    isConnected,
    room,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    getRoomList,
    dismissRoomFromList,
    updatePlayState,
    seekTo,
    play,
    pause,
    changeVideo,
    changeLiveChannel,
    startScreenShare,
    stopScreenShare,
    clearState,
  };
}
