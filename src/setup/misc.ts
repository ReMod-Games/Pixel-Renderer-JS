import { Color3, StandardMaterial, Color4 } from "babylonjs";
import PixelRenderer from "../PixelRenderer";

export default function setupMisc(r: PixelRenderer) {
    r.scene.ambientColor = Color3.FromHexString("#2d3645")
    for (let material of r.scene.materials){
        if (material instanceof StandardMaterial)
            material.ambientColor = BABYLON.Color3.White(); 
    }
    
    r.scene.clearColor = Color4.FromHexString("#151729ff")  
}