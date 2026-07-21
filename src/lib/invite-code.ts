// 邀请码存根 - 精简版不启用
export async function validateInviteCode(_code: string): Promise<{ valid: boolean; error?: string }> {
  return { valid: true }; // 精简版不验证邀请码
}

export async function useInviteCode(_code: string, _username?: string): Promise<boolean> {
  return true; // 精简版不验证邀请码
}

export async function generateInviteCode(): Promise<string> {
  return '';
}

export async function getInviteCodes(): Promise<any[]> {
  return [];
}
