// OIDC 提供商 Logo 存根 - 精简版不启用
'use client';

export function OIDCProviderLogo({ provider }: { provider: string }) {
  return null;
}

export function detectProvider(issuer: string): string {
  return 'unknown';
}

export function getProviderButtonStyle(provider: string): React.CSSProperties {
  return {};
}

export function getProviderButtonText(provider: string, customText?: string): string {
  return customText || '使用OIDC登录';
}
