import React, { useState, useMemo, useEffect } from "react";
import { GroundSettings, MapStyle } from "../../ground/ground";
import { debounce } from "../../utils/debounce";
import { Slider } from "./slider";
import { ControlWindow } from "../control-window";
import { Select } from "./select/select";
import { Option } from "./select/option";

type Props = {
  onUpdate: (settings: GroundSettings) => void;
};

export const TerrainControls: React.FC<Props> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<GroundSettings>({
    scale: 20,
    octaves: 3,
    persistence: 0.5,
    exponent: 1.0,
    style: "standard",
    seed: "my-seed",
  });

  const debouncedUpdate = useMemo(() => debounce(onUpdate, 50), [onUpdate]);

  useEffect(() => {
    onUpdate(settings);
  }, []);

  const handleChange = (key: keyof GroundSettings, val: number | string) => {
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
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
        <Option value="standard">Infinite (Standard)</Option>
        <Option value="continent">Continent</Option>
        <Option value="island">Small Island</Option>
        <Option value="coast">Coastal View</Option>
      </Select>
      <Slider
        label="Scale"
        value={settings.scale}
        min={5}
        max={100}
        step={1}
        onChange={(v) => handleChange("scale", v)}
      />
      <Slider
        label="Octaves"
        value={settings.octaves}
        min={1}
        max={6}
        step={1}
        onChange={(v) => handleChange("octaves", v)}
      />
      <Slider
        label="Persistence"
        value={settings.persistence}
        min={0.1}
        max={1.0}
        step={0.1}
        onChange={(v) => handleChange("persistence", v)}
      />
      <Slider
        label="Water Level"
        value={settings.exponent}
        min={0.1}
        max={4.0}
        step={0.1}
        onChange={(v) => handleChange("exponent", v)}
      />
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
