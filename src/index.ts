import * as BABYLON from "babylonjs"
// @ts-ignore
import pixelateFragment from "./pixelate.fragment.fx"
import '../style/main.css';

const canvas = document.createElement("canvas")
document.body.append(canvas);

const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine)

var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, 10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);

//TODO: recalculate these on resize
let screenResolution = new BABYLON.Vector2(window.innerWidth, window.innerHeight)
let renderResolution = screenResolution.clone().scale(1 / 6)
let aspectRatio = screenResolution.x / screenResolution.y

var pixelate = new BABYLON.PostProcess("Pixelate", trimFragmentUrl(pixelateFragment), [ "resolution" ], null, 0.25, camera);

pixelate.onApply = (effect) => {
    effect.setVector4("resolution", new BABYLON.Vector4(
        renderResolution.x, renderResolution.y,
        1 / renderResolution.x, 1 / renderResolution.y
    ));
}


setInterval(() => {
    box.rotate(new BABYLON.Vector3(0, 0.1, 0.1), 0.1, BABYLON.Space.LOCAL);
}, 10)

engine.runRenderLoop(() => {
    scene.render();
})

window.addEventListener("resize", () => {
    engine.resize();
});

function trimFragmentUrl(url: string): string {
    return url.replace(".fragment.fx", "");
}