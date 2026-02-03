import { Application } from "pixi.js";
import { generateGround } from "./ground/ground";

(async () => {
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const ground = await generateGround();
  app.stage.addChild(ground);
  app.ticker.add(() => {});
})();
