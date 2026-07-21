// 性能监控存根 - 精简版不启用
export function recordRequest(_data: any): void {}
export function recordRequestLegacy(_name: string, _duration: number, _status?: number): void {}
export function getDbQueryCount(): number { return 0; }
export function resetDbQueryCount(): void {}
export function incrementDbQuery(): void {}
export function getPerformanceStats(): any { return {}; }
