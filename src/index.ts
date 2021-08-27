import '../style/main.css';
import {
    Color3,
    Color4,
    DirectionalLight,
    Engine, 
    SpotLight, 
    StandardMaterial, 
    Vector3
} from "babylonjs";
import setupShaders from "./setup/shaders"
import DemoLevelGeometry from './DemoLevelGeometry';
import PixelRenderer from './PixelRenderer';

function init() {
    const canvas = document.createElement("canvas")
    document.body.append(canvas)
    
    const engine = new Engine(canvas)
    const renderer = new PixelRenderer(engine)

    renderer.setup(setupLighting)
    const geometry = new DemoLevelGeometry(renderer)

    renderer.setup(setupShaders)
    renderer.setup(setupMisc)
    renderer.scene.registerBeforeRender(() => geometry.animate())  
}

function setupLighting(r: PixelRenderer) {
    // spot light
    {
        const spotLight = new SpotLight("spotlight",
            new Vector3(0, 2, 2),
            new Vector3(0, -2, -2),
            Math.PI / 8,
            2,
            r.scene
        )
        spotLight.diffuse = Color3.FromHexString("#ff8800")
        r.addShadowLight(spotLight)
    }

    // directional light
    {
        const dirLight = new DirectionalLight("dirLight",
            new Vector3(-100, -100, -100),
            r.scene
        )
        dirLight.position.set(100, 100, 100)
        dirLight.diffuse = Color3.FromHexString("#fffc9c")
        dirLight.intensity = .5
        r.addShadowLight(dirLight)
    }
}

function setupMisc(r: PixelRenderer) {
    r.scene.ambientColor = Color3.FromHexString("#2d3645")
    for (let material of r.scene.materials){
        if (material instanceof StandardMaterial)
            material.ambientColor = BABYLON.Color3.White(); 
    }
    
    r.scene.clearColor = Color4.FromHexString("#151729ff")  
}

init()