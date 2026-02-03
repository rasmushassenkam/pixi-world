import { GroundSettings } from "./ground/ground";

export const createControls = (
  parentElement: HTMLElement,
  data: GroundSettings,
  onUpdate: () => void,
) => {
  // Main UI Container
  const ui = document.createElement("div");
  ui.className = "window";
  Object.assign(ui.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "250px",
    zIndex: "1000",
  });

  // Header
  const titleBar = document.createElement("div");
  titleBar.className = "title-bar";

  const titleText = document.createElement("div");
  titleText.className = "title-bar-text";
  titleText.innerText = "Terrain Generator";

  const titleControls = document.createElement("div");
  titleControls.className = "title-bar-controls";

  const minBtn = document.createElement("button");
  minBtn.setAttribute("aria-label", "Minimize");

  titleControls.appendChild(minBtn);
  titleBar.appendChild(titleText);
  titleBar.appendChild(titleControls);
  ui.appendChild(titleBar);

  const body = document.createElement("div");
  body.className = "window-body";

  let isMinimized = false;

  const toggleMinimize = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      body.style.display = "none";
      minBtn.setAttribute("aria-label", "Restore");
    } else {
      body.style.display = "block";
      minBtn.setAttribute("aria-label", "Minimize");
    }
  };

  minBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMinimize();
  });

  // Double-click title bar to minimize
  titleBar.ondblclick = toggleMinimize;

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
    const row = document.createElement("div");
    row.className = "field-row";
    row.style.marginBottom = "5px";

    const labelEl = document.createElement("label");
    labelEl.innerText = label;
    labelEl.style.width = "120px";

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(data[key]);
    input.style.flexGrow = "1";

    const valLabel = document.createElement("label");
    valLabel.innerText = String(data[key]);
    valLabel.style.width = "30px";
    valLabel.style.textAlign = "right";

    input.addEventListener("input", (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      // @ts-expect-error: simplistic type mapping
      data[key] = val;
      valLabel.innerText = String(val);
      debouncedUpdate();
    });

    row.appendChild(labelEl);
    row.appendChild(input);
    row.appendChild(valLabel);
    body.appendChild(row);
  };

  addSlider("Scale", "scale", 5, 100, 1);
  addSlider("Octaves", "octaves", 1, 6, 1);
  addSlider("Persistence", "persistence", 0.1, 1.0, 0.1);
  addSlider("Water Level", "exponent", 0.1, 4.0, 0.1);

  const hr = document.createElement("hr");
  body.appendChild(hr);

  const btnWrapper = document.createElement("div");
  btnWrapper.className = "field-row";
  btnWrapper.style.justifyContent = "center";

  const btn = document.createElement("button");
  btn.innerText = "Randomize Seed";
  btn.onclick = () => {
    data.seed = Math.random().toString(36).substring(7);
    onUpdate();
  };

  btnWrapper.appendChild(btn);
  body.appendChild(btnWrapper);

  ui.appendChild(body);
  parentElement.appendChild(ui);
};
