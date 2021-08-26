import renderPixelateFragment from "../shaders/render-pixelate.fragment.fx"
import pixelateFragment from "../shaders/pixelate.fragment.fx"
import '../style/main.css';
import {
    ArcRotateCamera,
    Color3,
    Engine, 
    FreeCamera,
    FresnelParameters,
    HemisphericLight,
    Mesh, 
    MeshBuilder, 
    RenderTargetTexture, 
    Scene, 
    StandardMaterial, 
    Texture, 
    Vector3
} from "babylonjs";
import Resolutions from "./resolutions";
import { stopGoEased } from "./math";

const canvas = document.createElement("canvas")
document.body.append(canvas);

const engine = new Engine(canvas);
const scene = new Scene(engine)

var camera = new ArcRotateCamera("camera1", 0, 0, 3, Vector3.Zero(), scene);
//camera.setPosition(new Vector3(0, 0, 20))
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

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
/*
renderPixelate.onApply = (effect) => {
    effect.setTexture("tNormal", normalTexture);
    effect.setTexture("tDepth", depthRenderer.getDepthMap());
    effect.setVector4("resolution", resolutions.resolutionsVector);
}
*/
//pixelate.onApply = (effect) => {
    //effect.setVector4("resolution", resolutions.resolutionsVector);
//}

function pixelTex(url: string): Texture {
    const tex = new Texture(
        url,
        scene,
        {
            samplingMode: Texture.NEAREST_SAMPLINGMODE
        }
    );
    tex.wrapU = Texture.WRAP_ADDRESSMODE;
    tex.wrapV = Texture.WRAP_ADDRESSMODE;
    return tex;
}

let checkerTex = pixelTex("https://threejsfundamentals.org/threejs/resources/images/checker.png")
checkerTex.uScale = 3;
checkerTex.vScale = 3;
let checkerTex2 = pixelTex("https://threejsfundamentals.org/threejs/resources/images/checker.png")
checkerTex2.uScale = 1.5;
checkerTex2.vScale = 1.5;

// boxes
let boxMaterial = new StandardMaterial("boxMaterial", scene)
boxMaterial.diffuseTexture = checkerTex2;
function addBox(name: string, len: number, x: number, z: number, rot: number): Mesh {
    const mesh = MeshBuilder.CreateBox(name, { 
        size: len,
    }, scene);
    mesh.receiveShadows = true
    mesh.rotation.y = rot;
    mesh.position.set(x, len / 2, z);
    mesh.material = boxMaterial;
    return mesh;
}
addBox("bigBox", .4, 0, 0, Math.PI / 4);
addBox("smallBox", .2, -.15, -.4, Math.PI / 4);

// plane
let planeMaterial = new StandardMaterial("planeMaterial", scene)
planeMaterial.diffuseTexture = checkerTex;
let plane = MeshBuilder.CreatePlane("plane", {
    size: 2,
    sideOrientation: Mesh.DOUBLESIDE
}, scene);
plane.receiveShadows = true;
plane.rotation.x = -Math.PI / 2;
plane.material = planeMaterial;

// icosahedron
let icosaMat = new StandardMaterial("icosaMat", scene);
icosaMat.emissiveFresnelParameters = new FresnelParameters({})
icosaMat.diffuseColor = Color3.FromHexString("#2379cf");
icosaMat.emissiveColor = Color3.FromHexString("#143542")
icosaMat.specularPower = 100;
icosaMat.specularColor = Color3.White();

let icosa = MeshBuilder.CreatePolyhedron(
    "icosa", {
        type: 3,
        size: .2
    }
)
icosa.receiveShadows = true;
icosa.material = icosaMat;

engine.runRenderLoop(() => {
    animate();
    scene.render();
})
window.addEventListener("resize", () => {
    engine.resize();
    resolutions.update();
});

function animate() {
    let t = performance.now() / 1000

    let mat = ( icosa.material as StandardMaterial )
    mat.emissiveFresnelParameters.power = Math.sin( t * 3 ) * .5 + .5
    icosa.position.y = .7 + Math.sin( t * 2 ) * .05
    icosa.rotation.y = stopGoEased( t, 2, 4 ) * 2 * Math.PI;
}