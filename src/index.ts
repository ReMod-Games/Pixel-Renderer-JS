import * as BABYLON from "babylonjs"
import "./index.css";

// main canvas
const canvas = document.createElement("canvas")
canvas.style.width = "100%";
document.body.append(canvas);

const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

engine.runRenderLoop(() => {
    scene.render();
});