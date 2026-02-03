import { GroundSettings } from "./ground/ground";

export const createControls = (
  parentElement: HTMLElement,
  data: GroundSettings,
  onUpdate: () => void,
) => {
  // Main UI Container
  const ui = document.createElement("div");
  Object.assign(ui.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "10px",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    fontFamily: "sans-serif",
    fontSize: "14px",
    width: "220px",
  });

  // Header (Title + Toggle Button)
  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    cursor: "pointer",
  });

  const title = document.createElement("span");
  title.innerText = "Terrain Settings";
  title.style.fontWeight = "bold";
  title.style.color = "#333";

  const toggleBtn = document.createElement("button");
  toggleBtn.innerText = "−";
  Object.assign(toggleBtn.style, {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#333",
    padding: "0 5px",
  });

  header.appendChild(title);
  header.appendChild(toggleBtn);
  ui.appendChild(header);

  // Content Wrapper
  const content = document.createElement("div");
  content.style.display = "block"; // Visible by default

  let isMinimized = false;
  const toggleMinimize = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      content.style.display = "none";
      toggleBtn.innerText = "+";
      header.style.marginBottom = "0px"; // Remove margin when closed
    } else {
      content.style.display = "block";
      toggleBtn.innerText = "−";
      header.style.marginBottom = "10px";
    }
  };

  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMinimize();
  };
  title.onclick = toggleMinimize;

  // Debounce helper
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
    content.appendChild(wrapper);
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
    marginTop: "5px",
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

  content.appendChild(btn);
  ui.appendChild(content);
  parentElement.appendChild(ui);
};
