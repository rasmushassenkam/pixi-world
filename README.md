# PIXI world

A fantasy life simulation, with windows 98 ui, built with pixi.js.

## Features

* **Procedural World Building:** Simplex noise map generation.
    * **Map Styles:** Configurable generation masks (Continent, Island, Coast, Standard).
* **Navigation:**  
    * **Panning:** Drag-to-move camera controls.
    * **Minimap:** Real-time, map with a synchronized viewport indicator and **click-to-teleport** navigation.
* **UI:**
    * **Windows 98 Theme:** Styled with: [98.css](https://jdan.github.io/98.css/).
    * **Window System:** Fully draggable and collapsible tool windows.

## TODOS

> [Planned features and roadmap](./TODOS.md)

## Tech Stack

* **Engine:** [PixiJS](https://pixijs.com/)
* **UI:** React + [98.css](https://jdan.github.io/98.css/)
* **Assets:** [16x16 mini world sprites](https://merchant-shade.itch.io/16x16-mini-world-sprites)

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```

3.  **Open browser:**
    Navigate to `http://localhost:8080`