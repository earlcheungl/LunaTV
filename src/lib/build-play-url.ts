/**
 * Shared play URL builder.
 * Extracted from VideoCard.tsx to eliminate triple duplication.
 */

interface PlayUrlParams {
  origin?: string;
  source?: string;
  id?: string;
  title: string;
  year?: string;
  doubanId?: number;
  searchType?: string;
  isAggregate?: boolean;
  query?: string;
  from?: string;
}

export function buildPlayUrl(params: PlayUrlParams): string {
  const {
    origin,
    source,
    id,
    title,
    year,
    doubanId,
    searchType,
    isAggregate,
    query,
    from,
  } = params;

  const doubanIdParam = doubanId && doubanId > 0 ? `&douban_id=${doubanId}` : '';
  const yearParam = year ? `&year=${year}` : '';
  const stypeParam = searchType ? `&stype=${searchType}` : '';
  const preferParam = isAggregate ? '&prefer=true' : '';
  const stitleParam = query ? `&stitle=${encodeURIComponent(query.trim())}` : '';

  if (origin === 'live' && source && id) {
    return `/live?source=${source.replace('live_', '')}&id=${id.replace('live_', '')}`;
  }

  if (source === 'shortdrama' && id) {
    return `/play?title=${encodeURIComponent(title.trim())}&shortdrama_id=${id}`;
  }

  if (
    from === 'douban' ||
    (isAggregate && !source && !id) ||
    source === 'upcoming_release' ||
    source === 'douban' ||
    source === 'bangumi'
  ) {
    return `/play?title=${encodeURIComponent(title.trim())}${yearParam}${doubanIdParam}${stypeParam}${preferParam}${stitleParam}`;
  }

  if (source && id) {
    return `/play?source=${source}&id=${id}&title=${encodeURIComponent(title)}${yearParam}${doubanIdParam}${preferParam}${stitleParam}${stypeParam}`;
  }

  return '/';
}
