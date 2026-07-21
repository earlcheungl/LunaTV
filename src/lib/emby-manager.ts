// Emby 管理器存根 - 精简版不启用
export class EmbyManager {
  constructor() {}
  async getSources(): Promise<any[]> { return []; }
  async getSource(_key: string): Promise<any> { return null; }
  async testConnection(_key: string): Promise<boolean> { return false; }
  async getClientForUser(_username: string, _key?: string): Promise<any> { return null; }
  async getEnabledSourcesForUser(_username: string): Promise<any[]> { return []; }
  clearUserCache(_username: string): void {}
}

export const embyManager = new EmbyManager();
