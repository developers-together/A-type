export type ThemeMode = 'light' | 'dark';

export type SharedUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  quickNote: string | null;
  joinedAt: string | null;
};

export type SharedPayload = {
  auth: boolean;
  theme: ThemeMode | null;
  user: SharedUser | null;
  flash: {
    status?: string | null;
    error?: string | null;
  };
};

export type HomeData = {
  defaults: {
    mode: 'time' | 'words';
    amount: number;
  };
};

export type LoginData = Record<string, never>;

export type LeaderboardRow = {
  userId: number;
  username: string;
  wpm: number;
  accuracy: number;
  sessionAt: string;
};

export type LeaderboardData = {
  time: LeaderboardRow[];
  words: LeaderboardRow[];
  filter: 'all_time' | 'daily';
};

export type ProfileNote = {
  id: number;
  title: string;
  body: string;
  isPinned: boolean;
  updatedAt: string | null;
};

export type ProfileData = {
  stats: {
    totalTests: number;
    totalWords: number;
    totalTime: number;
    avgWpm: number;
    avgAcc: number;
  };
  best: {
    time: Record<number, { wpm: number; accuracy: number }>;
    words: Record<number, { wpm: number; accuracy: number }>;
  };
  amounts: {
    time: number[];
    words: number[];
  };
  notes: ProfileNote[];
};

export type InfoData = {
  stack: {
    backend: string;
    frontend: string;
    ui: string;
    database: string;
    tests: string;
  };
  branch: string;
  highlights: string[];
};

export type AppPageName = 'home' | 'login' | 'profile' | 'info' | 'leaderboard';

export type PageDataMap = {
  home: HomeData;
  login: LoginData;
  profile: ProfileData;
  info: InfoData;
  leaderboard: LeaderboardData;
};

export type RootPayload<TPage extends AppPageName = AppPageName> = {
  shared: SharedPayload;
  data: PageDataMap[TPage];
};
