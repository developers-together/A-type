type NoteBubbleProps = {
  text: string;
  className?: string;
  compact?: boolean;
};

export function NoteBubble({ text, className = '', compact = false }: NoteBubbleProps) {
  return (
    <div className={`relative ${className}`}>
      <div className={`note-bubble ${compact ? 'max-w-[210px]' : 'max-w-[280px]'} line-clamp-3`}>{text}</div>
      <span className="absolute -bottom-3 left-4 h-3 w-3 rounded-full border border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface))]" />
      <span className="absolute -bottom-5 left-1 h-2 w-2 rounded-full border border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface))]" />
    </div>
  );
}
