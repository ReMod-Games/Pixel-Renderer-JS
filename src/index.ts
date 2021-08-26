import renderPixelateFragment from "../shaders/render-pixelate.fragment.fx"
import pixelateFragment from "../shaders/pixelate.fragment.fx"
import '../style/main.css';
import {
    ArcRotateCamera,
    Color3,
    DirectionalLight,
    Engine, 
    FresnelParameters,
    Mesh, 
    MeshBuilder, 
    RenderTargetTexture, 
    Scene, 
    SpotLight, 
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

scene.ambientColor = Color3.FromHexString("#2d3645")

const spotLight = new SpotLight("spotlight",
    new Vector3(0, 2, 2),
    new Vector3(0, -2, -2),
    Math.PI / 8,
    2,
    scene
)
spotLight.diffuse = Color3.FromHexString("#ff8800")
//@ts-ignore what the fuck?
var shadowGenerator = new BABYLON.ShadowGenerator(1024, spotLight);

const dirLight = new DirectionalLight("dirLight",
    new Vector3(-100, -100, -100),
    scene
)
dirLight.position.set(100, 100, 100)
dirLight.diffuse = Color3.FromHexString("#fffc9c")
dirLight.intensity = .5

//@ts-ignore
var shadowGenerator2 = new BABYLON.ShadowGenerator(1024, dirLight);
shadowGenerator2.mapSize = 2048


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


const THREE_JS_DEFAULT_SPECULAR_COLOR = Color3.FromHexString("#111111");

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
boxMaterial.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR; 

function addBox(name: string, len: number, x: number, z: number, rot: number): Mesh {
    const mesh = MeshBuilder.CreateBox(name, { 
        size: len,
    }, scene);
    mesh.receiveShadows = true
    mesh.rotation.y = rot;
    mesh.position.set(x, len / 2, z);
    mesh.material = boxMaterial;
    //@ts-ignore
    shadowGenerator.addShadowCaster(mesh);
    //@ts-ignore
    shadowGenerator2.addShadowCaster(mesh);
    return mesh;
}
addBox("bigBox", .4, 0, 0, Math.PI / 4);
addBox("smallBox", .2, -.15, -.4, Math.PI / 4);

// plane
let planeMaterial = new StandardMaterial("planeMaterial", scene)
planeMaterial.diffuseTexture = checkerTex;
planeMaterial.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR; 

let plane = MeshBuilder.CreatePlane("plane", {
    size: 2,
    sideOrientation: Mesh.DOUBLESIDE
}, scene);
plane.receiveShadows = true;
plane.rotation.x = -Math.PI / 2;
plane.material = planeMaterial;
//@ts-ignore
shadowGenerator.addShadowCaster(plane);
//@ts-ignore
shadowGenerator2.addShadowCaster(plane);

// icosahedron
let icosaMat = new StandardMaterial("icosaMat", scene);
icosaMat.emissiveFresnelParameters = new FresnelParameters({})
icosaMat.diffuseColor = Color3.FromHexString("#2379cf");
icosaMat.emissiveColor = Color3.FromHexString("#143542")
icosaMat.specularPower = 100;

let icosa = MeshBuilder.CreatePolyhedron(
    "icosa", {
        type: 3,
        size: .2
    }
)
icosa.receiveShadows = true;
icosa.material = icosaMat;
//@ts-ignore
shadowGenerator.addShadowCaster(icosa);
//@ts-ignore
shadowGenerator2.addShadowCaster(icosa);

scene.registerBeforeRender(() => {
    let t = performance.now() / 1000

    let mat = ( icosa.material as StandardMaterial )
    mat.emissiveFresnelParameters.power = Math.sin( t * 3 ) * .5 + .5
    icosa.position.y = .7 + Math.sin( t * 2 ) * .05
    icosa.rotation.y = stopGoEased( t, 2, 4 ) * 2 * Math.PI;
})

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => {
    engine.resize();
    resolutions.update();
});