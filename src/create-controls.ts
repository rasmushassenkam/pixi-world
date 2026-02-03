import { GroundSettings } from "./ground/ground";

export const createControls = (
  parentElement: HTMLElement,
  data: GroundSettings,
  onUpdate: () => void,
) => {
  const ui = document.createElement("div");
  Object.assign(ui.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    fontFamily: "sans-serif",
    fontSize: "14px",
    width: "220px",
  });

  // Debounce helper to prevent lag while dragging
  let timeout: number;
  const debouncedUpdate = () => {
    clearTimeout(timeout);
    timeout = window.setTimeout(onUpdate, 50);
  };

  const addSlider = (
    label: string,
    key: keyof GroundSettings,
    min: number,
    max: number,
    step: number,
  ) => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "10px";

    const labelEl = document.createElement("div");
    labelEl.style.marginBottom = "4px";
    labelEl.style.display = "flex";
    labelEl.style.justifyContent = "space-between";
    labelEl.style.color = "#333333";

    // Text Labels
    const nameSpan = document.createElement("span");
    nameSpan.innerText = label;
    const valueSpan = document.createElement("span");
    valueSpan.innerText = String(data[key]);
    valueSpan.style.fontWeight = "bold";

    labelEl.appendChild(nameSpan);
    labelEl.appendChild(valueSpan);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(data[key]);
    input.style.width = "100%";

    input.addEventListener("input", (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      // @ts-expect-error: simplistic type mapping
      data[key] = val;
      valueSpan.innerText = String(val);
      debouncedUpdate();
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    ui.appendChild(wrapper);
  };

  addSlider("Scale (Zoom)", "scale", 5, 100, 1);
  addSlider("Octaves (Detail)", "octaves", 1, 6, 1);
  addSlider("Persistence", "persistence", 0.1, 1.0, 0.1);
  addSlider("Exponent (Water Level)", "exponent", 0.1, 4.0, 0.1);

  const btn = document.createElement("button");
  btn.innerText = "Randomize Seed";
  Object.assign(btn.style, {
    width: "100%",
    padding: "8px",
    marginTop: "10px",
    cursor: "pointer",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
  });

  btn.addEventListener("click", () => {
    data.seed = Math.random().toString(36).substring(7);
    onUpdate();
  });

  ui.appendChild(btn);
  parentElement.appendChild(ui);
};
