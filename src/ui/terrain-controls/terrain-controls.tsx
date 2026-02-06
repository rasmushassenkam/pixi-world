import React, { useState, useMemo, useEffect } from "react";
import { GroundSettings, MapStyle } from "../../ground/ground";
import { debounce } from "../../utils/debounce";
import { Slider } from "./slider";
import { ControlWindow } from "../control-window/control-window";
import { Select } from "./select/select";
import { Option } from "./select/option";

const STORAGE_KEY = "pixi-world-settings";

const DEFAULT_SETTINGS: GroundSettings = {
  scale: 150,
  octaves: 4,
  persistence: 0.5,
  exponent: 1.0,
  style: "continent",
  seed: "my-seed",
};

const STYLE_OPTIONS: Record<MapStyle, string> = {
  standard: "Infinite (Standard)",
  continent: "Continent",
  island: "Small Island",
  coast: "Coastal View",
};

type SliderConfig = {
  label: string;
  min: number;
  max: number;
  step: number;
};

const SLIDER_CONFIGS: Record<
  Exclude<keyof GroundSettings, "style" | "seed">,
  SliderConfig
> = {
  scale: { label: "Scale", min: 30, max: 400, step: 10 },
  octaves: { label: "Octaves", min: 1, max: 6, step: 1 },
  persistence: { label: "Persistence", min: 0.1, max: 1.0, step: 0.1 },
  exponent: { label: "Water Level", min: 0.1, max: 4.0, step: 0.1 },
};

type Props = {
  onUpdate: (settings: GroundSettings) => void;
};

export const TerrainControls: React.FC<Props> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<GroundSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const debouncedUpdate = useMemo(() => debounce(onUpdate, 50), [onUpdate]);

  useEffect(() => {
    onUpdate(settings);
  }, []);

  const handleChange = (key: keyof GroundSettings, val: number | string) => {
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    debouncedUpdate(newSettings);
  };

  return (
    <ControlWindow
      headerLabel="Terrain Generator"
      style={{ position: "absolute", top: 10, right: 10, width: 250 }}
    >
      <Select<MapStyle>
        label="Map Style"
        value={settings.style}
        onChange={(val) => handleChange("style", val)}
      >
        {(Object.entries(STYLE_OPTIONS) as [MapStyle, string][]).map(
          ([val, label]) => (
            <Option key={val} value={val}>
              {label}
            </Option>
          ),
        )}
      </Select>
      {(
        Object.entries(SLIDER_CONFIGS) as [
          keyof typeof SLIDER_CONFIGS,
          SliderConfig,
        ][]
      ).map(([key, config]) => (
        <Slider
          key={key}
          label={config.label}
          value={settings[key]}
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(v) => handleChange(key, v)}
        />
      ))}
      <div
        className="field-row"
        style={{ justifyContent: "center", marginTop: 10 }}
      >
        <button
          onClick={() =>
            handleChange("seed", Math.random().toString(36).slice(7))
          }
        >
          Randomize Seed
        </button>
      </div>
    </ControlWindow>
  );
};
