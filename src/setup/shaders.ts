import renderPixelateFragment from "../../shaders/render-pixelate.fragment.fx"
import pixelateFragment from "../../shaders/pixelate.fragment.fx"
import { PostProcess, RenderTargetTexture } from "babylonjs";
import { PixelRenderer } from "..";

export default function (r: PixelRenderer) {
    const normalTexture = new RenderTargetTexture(
        'normalTexture',
        { width: r.resolutions.resolutionsVector.x, height: r.resolutions.resolutionsVector.y },
        r.scene
    );
    r.scene.customRenderTargets.push(normalTexture);
    
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

    const pixelate = new PostProcess("Pixelate", trimFragmentUrl(pixelateFragment), [ "resolution" ], null, 0.25, r.camera);
    pixelate.onApply = (effect) => {
        effect.setVector4("resolution", r.resolutions.resolutionsVector);
    }
}

export function trimFragmentUrl(url: string): string {
    return url.replace(".fragment.fx", "");
}