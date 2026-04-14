import { initials } from '../lib/format';

type AvatarProps = {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function Avatar({ username, avatarUrl, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-full border border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface-soft))] ${sizeClasses[size]}`}
      aria-label={`${username} avatar`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${username} avatar`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-[rgb(var(--text-soft))]">
          {initials(username) || 'U'}
        </div>
      )}
    </div>
  );
}
