/**
 * Centralized localStorage key constants.
 * Avoids magic strings scattered across the codebase.
 */
export const LS_KEYS = {
  PLAYER_PLAYBACK_RATE: 'moontv_player_playback_rate',
  PREFERRED_AUDIO_LANG: 'preferred_audio_lang',
  SKIP_CONFIGS: 'moontv_skip_configs',
  PLAYER_BUFFER_MODE: 'playerBufferMode',
  ENABLE_BLOCK_AD: 'enable_blockad',
  WEBSR_ENABLED: 'websr_enabled',
  WEBSR_MODE: 'websr_mode',
  WEBSR_CONTENT_TYPE: 'websr_content_type',
  WEBSR_NETWORK_SIZE: 'websr_network_size',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  EPISODE_SELECTOR_SORT_MODE: 'episodeSelectorSortMode',
  CRASH_LOGS: 'crash-logs',
  USE_DOUBAN_VIRTUALIZATION: 'useDoubanVirtualization',
  USE_VIRTUALIZATION: 'useVirtualization',
  DEFAULT_AGGREGATE_SEARCH: 'defaultAggregateSearch',
  FLUID_SEARCH: 'fluidSearch',
  EXACT_SEARCH: 'exactSearch',
  ENABLE_EXTERNAL_DANMU: 'enable_external_danmu',
} as const;
