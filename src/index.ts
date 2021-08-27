import '../style/main.css';
import {
    ArcRotateCamera,
    Camera,
    Color3,
    Color4,
    DepthRenderer,
    DirectionalLight,
    Engine, 
    FresnelParameters,
    IShadowLight,
    Mesh, 
    MeshBuilder, 
    PostProcess, 
    RenderTargetTexture, 
    Scene, 
    ShadowGenerator, 
    SpotLight, 
    StandardMaterial, 
    Texture, 
    Vector3
} from "babylonjs";
import Resolutions from "./resolutions";
import { stopGoEased } from "./math";
import setupShaders from "./setup/shaders"

const THREE_JS_DEFAULT_SPECULAR_COLOR = Color3.FromHexString("#111111");

export class PixelRenderer {
    engine: Engine
    scene: Scene
    resolutions: Resolutions
    camera: Camera
    depthRenderer: DepthRenderer
    shadowGenerators: ShadowGenerator[] = []
    normalTexture: RenderTargetTexture

    constructor(engine: Engine) {
        this.engine = engine
        this.scene = new Scene(engine)
        this.resolutions = new Resolutions()
        this.camera = this.setupCamera()
        this.camera.attachControl(null, true)
        this.depthRenderer = this.scene.enableDepthRenderer()

        this.normalTexture = new RenderTargetTexture(
            'normalTexture',
            {
                width: this.resolutions.resolutionsVector.x,
                height: this.resolutions.resolutionsVector.y
            },
            this.scene
        )

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => {
            this.engine.resize();
            this.resolutions.update();
        });
    }

    private setupCamera(): Camera {
        const camera = new ArcRotateCamera("camera1", 0, 0, 3, Vector3.Zero(), this.scene);
        camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        camera.orthoBottom = -1;
        camera.orthoTop = 1;
        camera.orthoLeft = -this.resolutions.aspectRatio;
        camera.orthoRight = this.resolutions.aspectRatio;
    
        return camera
    }

    setup(setup: (renderer: PixelRenderer) => void) {
        setup(this)
    }

    addShadowCaster(mesh: Mesh) {
        for (const gen of this.shadowGenerators) {
            gen.addShadowCaster(mesh);
        }
    }
    
    addShadowLight(light: IShadowLight, mapSize: number = 1024) {
        //@ts-ignore weird typescript recursive type-checking BS
        var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
        //@ts-ignore weird typescript recursive type-checking BS
        this.shadowGenerators.push(shadowGenerator);
    }
}


function init() {
    const canvas = document.createElement("canvas")
    document.body.append(canvas)
    
    const engine = new Engine(canvas)
    const renderer = new PixelRenderer(engine)
    const geometry = new DemoLevelGeometry(renderer)

    renderer.setup(setupLighting)
    renderer.setup(setupShaders)
    renderer.setup(setupMisc)
    renderer.scene.registerBeforeRender(() => geometry.animate())  
}

import example from "./textures/example.png"


class DemoLevelGeometry {
    crystalMat: StandardMaterial
    crystal: Mesh
    static CHECKERS_TEX: string = example

    constructor(r: PixelRenderer) {
        const boxMat = this.makeBoxMaterial(r)

        this.addBox(r, boxMat, "bigBox", .4, 0, 0, Math.PI / 4)
        this.addBox(r, boxMat, "smallBox", .2, -.15, -.4, Math.PI / 4)
    
        this.addBaseplate(r);

        this.crystalMat = this.makeCrystalMaterial(r)
        this.crystal = this.addCrystal(r);
        this.crystal.material = this.crystalMat;
    }

    private makeBoxMaterial(r: PixelRenderer): StandardMaterial {
        const boxMaterial = new StandardMaterial("boxMaterial", r.scene)
        boxMaterial.diffuseTexture = this.makePixelTex(r, DemoLevelGeometry.CHECKERS_TEX, 1.5)
        boxMaterial.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR
        return boxMaterial
    }

    animate(delta: number = performance.now() / 1000) {
        this.crystalMat.emissiveFresnelParameters.power = Math.sin( delta * 3 ) * .5 + .5
        this.crystal.position.y = .7 + Math.sin( delta * 2 ) * .05
        this.crystal.rotation.y = (stopGoEased( delta, 2, 4 ) * 2 + 5/6) * Math.PI
    }

    private addBox(r: PixelRenderer, mat: StandardMaterial, name: string, len: number, x: number, z: number, rot: number): Mesh {
        const mesh = MeshBuilder.CreateBox(name, { 
            size: len,
        }, r.scene)
        mesh.receiveShadows = true
        mesh.rotation.y = rot
        mesh.position.set(x, len / 2, z)
        mesh.material = mat
        r.addShadowCaster(mesh)
        return mesh;
    }

    private addBaseplate(r: PixelRenderer) {
        const planeMat = new StandardMaterial("planeMat", r.scene)
        planeMat.diffuseTexture = this.makePixelTex(r, DemoLevelGeometry.CHECKERS_TEX, 3);
        planeMat.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR; 
        
        const plane = MeshBuilder.CreatePlane("plane", {
            size: 2,
            sideOrientation: Mesh.DOUBLESIDE
        }, r.scene);
        plane.receiveShadows = true;
        plane.rotation.x = -Math.PI / 2;
        plane.material = planeMat;
        r.addShadowCaster(plane);
    }

    private makeCrystalMaterial(r: PixelRenderer): StandardMaterial {
        const crystalMat = new StandardMaterial("crystalMat", r.scene)
        crystalMat.emissiveFresnelParameters = new FresnelParameters({})
        crystalMat.diffuseColor = Color3.FromHexString("#2379cf")
        crystalMat.emissiveColor = Color3.FromHexString("#143542")
        crystalMat.specularPower = 100
        return crystalMat
    }

    private addCrystal(r: PixelRenderer): Mesh {
        const crystal = MeshBuilder.CreatePolyhedron("crystal", {
            type: 3,
            size: .2
        }, r.scene);
        crystal.receiveShadows = true;
        r.addShadowCaster(crystal);
        return crystal;
    }

    private makePixelTex(r: PixelRenderer, url: string, uScale: number, vScale: number = uScale): Texture {
        const tex = new Texture(url, r.scene, { samplingMode: Texture.NEAREST_SAMPLINGMODE })
        tex.wrapU = Texture.WRAP_ADDRESSMODE
        tex.wrapV = Texture.WRAP_ADDRESSMODE
        tex.uScale = uScale
        tex.vScale = vScale
        return tex
    }
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