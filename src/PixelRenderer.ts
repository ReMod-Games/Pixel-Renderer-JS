import { Engine, Scene, Camera, DepthRenderer, ShadowGenerator, RenderTargetTexture, ArcRotateCamera, Vector3, Mesh, IShadowLight } from "babylonjs"
import Resolutions from "./resolutions"

export default class PixelRenderer {
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