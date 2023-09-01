import { DistanceMeasurement, SizeMeasurement } from "./measure";

export class Tools {
    /**
     * 
     * @param {import ("../viewer.js").Viewer} viewer The viewer instance
     */
    constructor(viewer) {
        this.distanceMeasurement = new DistanceMeasurement(viewer);
        this.sizeMeasurement = new SizeMeasurement(viewer);
    }

    handleRemoveLastSelection() {
        if (this.distanceMeasurement.contextEnabled) {
            this.distanceMeasurement.removeLastSelectedObj();
        }
        else if (this.sizeMeasurement.contextEnabled) {
            this.sizeMeasurement.removeLastSelectedObj();
        }
    }

    /**
     * @param {import ("../nestedgroup.js").ObjectGroup} objGroup The selected object group.
     */
    handleSelectedObj(objGroup) {

        if (this.distanceMeasurement.contextEnabled)
            this.distanceMeasurement.handleSelection(objGroup);
        else if (this.sizeMeasurement.contextEnabled)
            this.sizeMeasurement.handleSelection(objGroup);
    }

    handleResetSelection() {
        if (this.distanceMeasurement.contextEnabled) {
            this.distanceMeasurement.removeLastSelectedObj();
            this.distanceMeasurement.removeLastSelectedObj();
        }
        else if (this.sizeMeasurement.contextEnabled)
            this.sizeMeasurement.removeLastSelectedObj();
    }

    /**
     * This is called each time the viewer gets updated
     */
    update() {
        if (this.distanceMeasurement.contextEnabled)
            this.distanceMeasurement.update();
        else if (this.sizeMeasurement.contextEnabled)
            this.sizeMeasurement.update();
    }
}