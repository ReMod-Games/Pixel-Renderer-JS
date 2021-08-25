import * as BABYLON from "babylonjs"

const Engine = new BABYLON.Engine(document.getElementById("canvas") as HTMLCanvasElement, true)
const Scene = new BABYLON.Scene(Engine)
Scene.render()