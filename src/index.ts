import '../style/main.css';

import { Engine } from "babylonjs"
import DemoLevelGeometry from "./DemoLevelGeometry"
import PixelRenderer from "./PixelRenderer"

import setupLighting from "./setup/lighting"
import setupShaders from "./setup/shaders"
import setupMisc from "./setup/misc"

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

init()