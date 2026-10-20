export default function MarsIcon({
  variant = 'badge', // 'badge' | 'ring' | 'white-ring'
  className = 'w-10 h-10',
  ...props
}) {
  if (variant === 'ring') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="MARS Icon"
        {...props}
      >
        <circle cx="32" cy="32" r="23" stroke="#F44516" strokeWidth="10" />
      </svg>
    )
  }

  if (variant === 'white-ring') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="MARS Icon"
        {...props}
      >
        <circle cx="32" cy="32" r="23" stroke="#FFFFFF" strokeWidth="10" />
      </svg>
    )
  }

  // Default: Navy badge with authentic Mars Orange brandmark ring
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MARS Icon"
      {...props}
    >
      <rect width="64" height="64" rx="16" fill="#0D0D5B" />
      <circle cx="32" cy="32" r="18" stroke="#F44516" strokeWidth="8" />
    </svg>
  )
}
