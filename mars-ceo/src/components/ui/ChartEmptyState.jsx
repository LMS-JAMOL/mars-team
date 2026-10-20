export default function ChartEmptyState({ loading = false }) {
  return (
    <div className="grid place-items-center h-full text-sm text-base-content/50">
      {loading ? (
        <span className="loading loading-spinner loading-md text-primary" aria-label="Yuklanmoqda" />
      ) : (
        <span>Hozircha ma’lumot yo‘q</span>
      )}
    </div>
  )
}
