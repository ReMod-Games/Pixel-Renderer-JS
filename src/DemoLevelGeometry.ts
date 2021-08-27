import { StandardMaterial, Mesh, MeshBuilder, FresnelParameters, Color3, Texture, SpotLight, Vector3, DirectionalLight, Color4 } from "babylonjs"
import { stopGoEased } from "./math"
import PixelRenderer from "./PixelRenderer"

export default class DemoLevelGeometry {
    crystalMat: StandardMaterial
    crystal: Mesh
    static CHECKERS_TEX: string = "https://threejsfundamentals.org/threejs/resources/images/checker.png"

    constructor(r: PixelRenderer) {
        const boxMat = this.makeBoxMaterial(r)

        this.addBox(r, boxMat, "bigBox", .4, 0, 0, Math.PI / 4)
        this.addBox(r, boxMat, "smallBox", .2, -.15, -.4, Math.PI / 4)

        this.addBaseplate(r)

        this.crystalMat = this.makeCrystalMaterial(r)
        this.crystal = this.addCrystal(r)
        this.crystal.material = this.crystalMat
    }

    private makeBoxMaterial(r: PixelRenderer): StandardMaterial {
        const boxMaterial = new StandardMaterial("boxMaterial", r.scene)
        boxMaterial.diffuseTexture = this.makePixelTex(r, DemoLevelGeometry.CHECKERS_TEX, 1.5)
        boxMaterial.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR
        return boxMaterial
    }

    animate(delta: number = performance.now() / 1000) {
        this.crystalMat.emissiveFresnelParameters.power = Math.sin(delta * 3) * .5 + .5
        this.crystal.position.y = .7 + Math.sin(delta * 2) * .05
        this.crystal.rotation.y = (stopGoEased(delta, 2, 4) * 2 + 5 / 6) * Math.PI
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
        planeMat.diffuseTexture = this.makePixelTex(r, DemoLevelGeometry.CHECKERS_TEX, 3)
        planeMat.specularColor = THREE_JS_DEFAULT_SPECULAR_COLOR;

        const plane = MeshBuilder.CreatePlane("plane", {
            size: 2,
            sideOrientation: Mesh.DOUBLESIDE
        }, r.scene)
        plane.receiveShadows = true
        plane.rotation.x = -Math.PI / 2
        plane.material = planeMat
        r.addShadowCaster(plane)
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
        }, r.scene)
        crystal.receiveShadows = true
        r.addShadowCaster(crystal)
        return crystal
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

const THREE_JS_DEFAULT_SPECULAR_COLOR = Color3.FromHexString("#111111")