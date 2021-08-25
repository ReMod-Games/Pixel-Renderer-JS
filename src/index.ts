import * as gl from "babylonjs"

const canvas = document.createElement("canvas")
document.body.style.margin = "0"
canvas.style.width = "100%";
canvas.width = 2000;
canvas.height = 1000;
document.body.append(canvas);

const engine = new gl.Engine(canvas)
// await engine.initAsync();

const scene = new gl.Scene(engine)

var camera = new gl.FreeCamera("camera1", new gl.Vector3(0, 8, 0), scene);
camera.setTarget(gl.Vector3.Zero());
camera.attachControl(canvas, true);

const light = new gl.HemisphericLight("light", new gl.Vector3(0, 1, 0), scene);

const box = gl.MeshBuilder.CreateBox("box", {}, scene);

scene.render()

setInterval(() => {
    box.rotate(new gl.Vector3(0, 0.1, 0.1), 0.01, BABYLON.Space.LOCAL);
}, 10)

engine.runRenderLoop(() => {
    scene.render();
});