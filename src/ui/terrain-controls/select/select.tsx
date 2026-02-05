import { ReactNode, ChangeEvent } from "react";

type Props<T> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
};

export const Select = <T extends string | number>({
  label,
  value,
  onChange,
  children,
}: Props<T>) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const parsed = (typeof value === "number" ? parseFloat(val) : val) as T;
    onChange(parsed);
  };
  return (
    <div className="field-row" style={{ marginBottom: 10 }}>
      <label style={{ width: 80, color: "#333333" }}>{label}</label>
      <select
        value={String(value)}
        onChange={handleChange}
        style={{ flexGrow: 1 }}
      >
        {children}
      </select>
    </div>
  );
};
