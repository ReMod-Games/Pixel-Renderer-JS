import renderPixelateFragment from "../shaders/render-pixelate.fragment.fx"
import pixelateFragment from "../shaders/pixelate.fragment.fx"
import '../style/main.css';
import {
    ArcRotateCamera,
    Camera,
    Color3,
    Color4,
    DirectionalLight,
    Engine, 
    FresnelParameters,
    Mesh, 
    MeshBuilder, 
    PostProcess, 
    RenderTargetTexture, 
    Scene, 
    SpotLight, 
    StandardMaterial, 
    Texture, 
    Vector3
} from "babylonjs";
import Resolutions from "./resolutions";
import { stopGoEased } from "./math";
import { trimFragmentUrl } from "./helper";

const THREE_JS_DEFAULT_SPECULAR_COLOR = Color3.FromHexString("#111111");

const canvas = document.createElement("canvas")
document.body.append(canvas);

const engine = new Engine(canvas);
const scene = new Scene(engine);
const resolutions = new Resolutions();
const camera = setupCamera();
camera.attachControl(canvas, true);

const checkerTex = pixelTex("https://threejsfundamentals.org/threejs/resources/images/checker.png", 3)
const checkerTex2 = pixelTex("https://threejsfundamentals.org/threejs/resources/images/checker.png", 1.5)

const shadowGenerators = [];

let depthRenderer = scene.enableDepthRenderer();

let normalTexture = new RenderTargetTexture(
    'normalTexture',
    { width: resolutions.resolutionsVector.x, height: resolutions.resolutionsVector.y },
    scene
);
scene.customRenderTargets.push(normalTexture);

let crystal: Mesh, crystalMat: StandardMaterial

setupLighting();
setupShaders();
setupGeometry();


function pixelTex(url: string, uScale: number, vScale: number = uScale): Texture {
    const tex = new Texture(
        url,
        scene,
        {
            samplingMode: Texture.NEAREST_SAMPLINGMODE
        }
    );
    tex.wrapU = Texture.WRAP_ADDRESSMODE;
    tex.wrapV = Texture.WRAP_ADDRESSMODE;
    tex.uScale = uScale;
    tex.vScale = vScale;
    return tex;
}

function addShadowCaster(mesh: Mesh) {
    for (const gen of shadowGenerators) {
        gen.addShadowCaster(mesh);
    }
}

function setupCamera(): Camera {
    const camera = new ArcRotateCamera("camera1", 0, 0, 3, Vector3.Zero(), scene);
    //camera.setPosition(new Vector3(0, 0, 20))
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoBottom = -1;
    camera.orthoTop = 1;
    camera.orthoLeft = -resolutions.aspectRatio;
    camera.orthoRight = resolutions.aspectRatio;

    return camera
}

function setupLighting() {
    // spot light
    const spotLight = new SpotLight("spotlight",
        new Vector3(0, 2, 2),
        new Vector3(0, -2, -2),
        Math.PI / 8,
        2,
        scene
    )
    spotLight.diffuse = Color3.FromHexString("#ff8800")
    //@ts-ignore what the fuck?
    shadowGenerators.push(new BABYLON.ShadowGenerator(1024, spotLight));

    // directional light
    const dirLight = new DirectionalLight("dirLight",
        new Vector3(-100, -100, -100),
        scene
    )
    dirLight.position.set(100, 100, 100)
    dirLight.diffuse = Color3.FromHexString("#fffc9c")
    dirLight.intensity = .5

    //@ts-ignore
    var shadowGenerator2 = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator2.mapSize = 2048;
    shadowGenerators.push(shadowGenerator2);
}

function setupShaders() {
    /*
    var renderPixelate = new PostProcess(
        "Render pixelate", 
        trimFragmentUrl(renderPixelateFragment), 
        ["resolution", "tNormal", "tDepth" ],
        null, 0.25, camera
    )
    renderPixelate.onApply = (effect) => {
        effect.setTexture("tNormal", normalTexture);
        effect.setTexture("tDepth", depthRenderer.getDepthMap());
        effect.setVector4("resolution", resolutions.resolutionsVector);
    }
    */

    var pixelate = new PostProcess("Pixelate", trimFragmentUrl(pixelateFragment), [ "resolution" ], null, 0.25, camera);
    pixelate.onApply = (effect) => {
        effect.setVector4("resolution", resolutions.resolutionsVector);
    }
}

function setupGeometry() {
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
        addShadowCaster(mesh);
        return mesh;
    }

    addBox("bigBox", .4, 0, 0, Math.PI / 4);
    addBox("smallBox", .2, -.15, -.4, Math.PI / 4);
    
    // plane
    let planeMat = new StandardMaterial("planeMat", scene)
    planeMat.diffuseTexture = checkerTex;
    planeMat.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR; 
    
    let plane = MeshBuilder.CreatePlane("plane", {
        size: 2,
        sideOrientation: Mesh.DOUBLESIDE
    }, scene);
    plane.receiveShadows = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material = planeMat;
    addShadowCaster(plane);
    
    
    // icosahedron
    crystalMat = new StandardMaterial("crystalMat", scene);
    crystalMat.emissiveFresnelParameters = new FresnelParameters({})
    crystalMat.diffuseColor = Color3.FromHexString("#2379cf");
    crystalMat.emissiveColor = Color3.FromHexString("#143542")
    crystalMat.specularPower = 100;
    
    crystal = MeshBuilder.CreatePolyhedron("crystal", {
            type: 3,
            size: .2
    }, scene);
    crystal.receiveShadows = true;
    crystal.material = crystalMat;
    addShadowCaster(crystal);
}

function animate() {
    let t = performance.now() / 1000

    crystalMat.emissiveFresnelParameters.power = Math.sin( t * 3 ) * .5 + .5
    crystal.position.y = .7 + Math.sin( t * 2 ) * .05
    crystal.rotation.y = (stopGoEased( t, 2, 4 ) * 2 + 5/6) * Math.PI;
}

scene.ambientColor = Color3.FromHexString("#2d3645")
for (let material of scene.materials){
    if (material instanceof StandardMaterial)
        material.ambientColor = BABYLON.Color3.White(); 
}

scene.clearColor = Color4.FromHexString("#151729ff")

scene.registerBeforeRender(animate)

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => {
    engine.resize();
    resolutions.update();
});