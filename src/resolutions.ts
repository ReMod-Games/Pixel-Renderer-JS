import { Vector2, Vector4 } from "babylonjs"

export default class Resolutions {
    screenResolution: Vector2
    renderResolution: Vector2
    renderRatio: number

    resolutionsVector: Vector4

    constructor(
        width: number = window.innerWidth,
        height: number = window.innerHeight,
        ratio: number = 1 / 4
    ) {
        this.screenResolution = new Vector2(width, height)
        this.renderResolution = this.screenResolution.scale(ratio)
        this.renderRatio = ratio

        this.resolutionsVector = new Vector4(
            this.renderResolution.x, this.renderResolution.y,
            1 / this.renderResolution.x, 1 / this.renderResolution.y
        )
    }

    get aspectRatio(): number {
        return this.screenResolution.x / this.screenResolution.y
    }

    update(
        width: number = window.innerWidth,
        height: number = window.innerHeight
    ) {
        this.screenResolution.set(width, height)
        this.renderResolution.set(width, height).scaleInPlace(this.renderRatio)

        this.resolutionsVector.set(
            this.renderResolution.x, this.renderResolution.y,
            1 / this.renderResolution.x, 1 / this.renderResolution.y
        )
    }
}