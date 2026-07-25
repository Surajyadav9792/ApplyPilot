export function SkeletonLine({ width = "100%", height = "16px" }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "var(--radius-sm)" }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-8 h-8 rounded-full" />
        <SkeletonLine width="40%" height="14px" />
      </div>
      <div className="space-y-3">
        <SkeletonLine width="100%" height="12px" />
        <SkeletonLine width="90%" height="12px" />
        <SkeletonLine width="75%" height="12px" />
        <SkeletonLine width="60%" height="12px" />
      </div>
    </div>
  );
}

export function SkeletonEmailOutput() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export default SkeletonCard;
