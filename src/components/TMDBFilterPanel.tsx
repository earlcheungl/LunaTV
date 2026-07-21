// TMDB 筛选面板存根 - 精简版不启用
'use client';

export interface TMDBFilterState {
  genres?: number[];
  years?: number[];
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  startYear?: number;
  endYear?: number;
  minRating?: number;
  maxRating?: number;
  minPopularity?: number;
  maxPopularity?: number;
  minVoteCount?: number;
  minEpisodeCount?: number;
  maxEpisodeCount?: number;
  originalLanguage?: string;
  genreIds?: number[];
  languages?: string[];
  onlyRated?: boolean;
}

interface TMDBFilterPanelProps {
  filters: TMDBFilterState;
  onChange?: (filters: TMDBFilterState) => void;
  onFiltersChange?: (filters: TMDBFilterState) => void;
  onClose?: () => void;
  contentType?: string;
  isVisible?: boolean;
  onToggleVisible?: () => void;
  resultCount?: number;
}

export default function TMDBFilterPanel(props: TMDBFilterPanelProps) {
  return null;
}
