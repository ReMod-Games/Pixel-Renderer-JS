import * as BABYLON from "babylonjs"
import "./index.css"

const canvas = document.createElement("canvas")
document.body.append(canvas);

const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine)

var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, 10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);

setInterval(() => {
    box.rotate(new BABYLON.Vector3(0, 0, .001), 3);
}, 50)

engine.runRenderLoop(() => {
    scene.render();
})

window.addEventListener("resize", function () {
    engine.resize();
});