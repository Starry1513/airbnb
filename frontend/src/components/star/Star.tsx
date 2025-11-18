export function Star({ filled, half, size }: { filled: boolean; half: boolean; size: number }) {
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
        <path d={starPath} />
      </svg>
    );
  }

  if (half) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d={starPath} fill="url(#half)" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
      <path d={starPath} />
    </svg>
  );
}
