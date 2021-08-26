import * as BABYLON from "babylonjs"
import renderPixelateFragment from "../shaders/render-pixelate.fragment.fx"
import pixelateFragment from "../shaders/pixelate.fragment.fx"
import '../style/main.css';
import { Engine, FreeCamera, HemisphericLight, MeshBuilder, PostProcess, RenderTargetTexture, Scene, Space, Vector2, Vector3, Vector4 } from "babylonjs";
import exampleImage from "./textures/example.png"
import { trimFragmentUrl } from "./helper";
import Resolutions from "./resolutions";

const canvas = document.createElement("canvas")
document.body.append(canvas);

const engine = new Engine(canvas);
const scene = new Scene(engine)

var camera = new FreeCamera("camera1", new Vector3(0, 3, 3), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
const box = MeshBuilder.CreateBox("box", {}, scene);

var mat = new BABYLON.StandardMaterial("dog", scene);
mat.diffuseTexture = new BABYLON.Texture(exampleImage, scene);
box.material = mat;

const resolutions = new Resolutions();

let depthRenderer = scene.enableDepthRenderer();
/*
var renderPixelate = new PostProcess(
    "Render pixelate", 
    trimFragmentUrl(renderPixelateFragment), 
    ["resolution", "tNormal", "tDepth" ],
    null, 0.25, camera
)
*/
//var pixelate = new PostProcess("Pixelate", trimFragmentUrl(pixelateFragment), [ "resolution" ], null, 0.25, camera);


let normalTexture = new RenderTargetTexture(
    'normalTexture',
    { width: resolutions.resolutionsVector.x, height: resolutions.resolutionsVector.y },
    scene
);
scene.customRenderTargets.push(normalTexture);
normalTexture.renderList.push(box)
/*
renderPixelate.onApply = (effect) => {
    effect.setTexture("tNormal", normalTexture);
    effect.setTexture("tDepth", depthRenderer.getDepthMap());
    effect.setVector4("resolution", resolutions.resolutionsVector);
}
*/

var plane = BABYLON.Mesh.CreatePlane("map", 10, scene);
plane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
plane.scaling.y = 1.0 / engine.getAspectRatio(scene.activeCamera);

var rttMaterial = new BABYLON.StandardMaterial("RTT material", scene);
rttMaterial.emissiveTexture = normalTexture;
rttMaterial.disableLighting = true;
plane.material = rttMaterial;

//pixelate.onApply = (effect) => {
    //effect.setVector4("resolution", resolutions.resolutionsVector);
//}


setInterval(() => {
    box.rotate(new Vector3(0.1, 0, 0.1), 0.05, Space.LOCAL);
}, 10)

engine.runRenderLoop(() => scene.render())
window.addEventListener("resize", () => {
    engine.resize();
    resolutions.update();
});