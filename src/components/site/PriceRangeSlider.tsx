type PriceRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  step?: number;
  onChange: (value: [number, number]) => void;
};

export function PriceRangeSlider({ min, max, value, step = 10, onChange }: PriceRangeSliderProps) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const [selectedMin, selectedMax] = value;
  const range = Math.max(1, safeMax - safeMin);
  const left = ((selectedMin - safeMin) / range) * 100;
  const right = 100 - ((selectedMax - safeMin) / range) * 100;
  const disabled = safeMax <= safeMin;

  return (
    <div className="space-y-3">
      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          min={safeMin}
          max={safeMax}
          step={step}
          value={selectedMin}
          disabled={disabled}
          onChange={(event) => onChange([Math.min(Number(event.target.value), selectedMax), selectedMax])}
          className="price-range-thumb pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
          aria-label="Prix minimum"
        />
        <input
          type="range"
          min={safeMin}
          max={safeMax}
          step={step}
          value={selectedMax}
          disabled={disabled}
          onChange={(event) => onChange([selectedMin, Math.max(Number(event.target.value), selectedMin)])}
          className="price-range-thumb pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
          aria-label="Prix maximum"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="text-gold font-semibold">{selectedMin} DT</span>
        <span className="text-gold font-semibold">{selectedMax} DT</span>
      </div>
    </div>
  );
}
