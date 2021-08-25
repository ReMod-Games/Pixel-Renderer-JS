import * as BABYLON from "babylonjs"
const canvas = document.createElement("canvas")
canvas.style.width = "100%";
document.body.append(canvas);
const Engine = new BABYLON.Engine(canvas, true)
const Scene = new BABYLON.Scene(Engine)
Scene.render()