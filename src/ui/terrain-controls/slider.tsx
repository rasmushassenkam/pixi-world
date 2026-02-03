type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export const Slider = ({ label, value, min, max, step, onChange }: Props) => (
  <div className="field-row" style={{ marginBottom: 4 }}>
    <label style={{ width: 80, color: "#333333" }}>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ flexGrow: 1 }}
    />
    <label style={{ width: 30, textAlign: "right", color: "#333333" }}>
      {value}
    </label>
  </div>
);
