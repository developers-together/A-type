export type Theme = 'dark' | 'light';

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  theme: Theme | null;
};

export type FlashBag = {
  status?: string | null;
};

export type SharedPageProps = {
  auth: {
    user: AuthUser | null;
  };
  flash: FlashBag;
  csrf_token: string;
  errors: Record<string, string>;
};
