export function LayoutGridDebug({ columns }: { columns: number }) {
  return (
    <div className="grid-debug" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
