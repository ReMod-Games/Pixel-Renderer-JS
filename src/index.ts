import * as BABYLON from "babylonjs"
import renderPixelateFragment from "../shaders/render-pixelate.fragment.fx"
import pixelateFragment from "../shaders/pixelate.fragment.fx"
import '../style/main.css';
import { Engine, FreeCamera, HemisphericLight, MeshBuilder, PostProcess, RenderTargetTexture, Scene, Space, Vector2, Vector3, Vector4 } from "babylonjs";

const canvas = document.createElement("canvas")
document.body.append(canvas);

const engine = new Engine(canvas);
const scene = new Scene(engine)

var camera = new FreeCamera("camera1", new Vector3(0, 5, 5), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
const box = MeshBuilder.CreateBox("box", {}, scene);

//TODO: recalculate these on resize
let screenResolution = new Vector2(window.innerWidth, window.innerHeight)
let renderResolution = screenResolution.clone().scale(1 / 4)
let aspectRatio = screenResolution.x / screenResolution.y

let depthRenderer = scene.enableDepthRenderer();

var renderPixelate = new PostProcess(
    "Render pixelate", 
    trimFragmentUrl(renderPixelateFragment), 
    ["resolution", "tNormal", "tDepth" ],
    null, 0.25, camera
)
var pixelate = new PostProcess("Pixelate", trimFragmentUrl(pixelateFragment), [ "resolution" ], null, 0.25, camera);

let resolution = new Vector4(
    renderResolution.x, renderResolution.y,
    1 / renderResolution.x, 1 / renderResolution.y
)


let normalTexture = new RenderTargetTexture(
    'normalTexture',
    { width: resolution.x, height: resolution.y },
    scene
);
scene.customRenderTargets.push(normalTexture);
normalTexture.renderList.push(box)

renderPixelate.onApply = (effect) => {
    effect.setTexture("tNormal", normalTexture);
    effect.setTexture("tDepth", depthRenderer.getDepthMap());
    effect.setVector4("resolution", resolution);
}

pixelate.onApply = (effect) => {
    effect.setVector4("resolution", resolution);
}


setInterval(() => {
    box.rotate(new Vector3(0.1, 0.1, 0.1), 0.1, Space.LOCAL);
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