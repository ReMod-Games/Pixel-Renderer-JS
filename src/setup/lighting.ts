import { Color3, DirectionalLight, SpotLight, Vector3 } from "babylonjs"
import PixelRenderer from "../PixelRenderer"

export default function setupLighting(r: PixelRenderer) {
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