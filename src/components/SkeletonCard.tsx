interface SkeletonCardProps {
  count?: number;
}

function SkeletonCard({ count = 3 }: SkeletonCardProps) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-subtitle" />
          <div className="skeleton-line skeleton-bar" />
          <div className="skeleton-line skeleton-text" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonCard;
