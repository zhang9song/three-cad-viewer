import * as THREE from "three";

export const TopoFilter = {
    none: null,
    vertex: "vertex",
    edge: "edge",
    face: "face",
    solid: "solid",
};
export const GeomFilter = {
    none: null,
    plane: "plane",
    line: "line",
    circle: "circle",
};


export class PickedObject {
    constructor(objectGroup, fromSolid) {
        this.obj = objectGroup;
        this.fromSolid = fromSolid;
    }

    /**
    * Returns all the faces ObjectGroups that define the solid from the picked object.
    */
    _getSolidObjectGroups(solidSubObject) {

        const solidGroup = solidSubObject.parent.parent;
        let facesGroup;
        for (let i = 0; i < solidGroup.children.length; i++) {
            const child = solidGroup.children[i];
            if (child.name === solidGroup.name + "|faces") {
                facesGroup = child;
                break;
            }
        }

        return facesGroup.children;
    }

    /**
     * If the picked object is part of a solid, returns all the faces ObjectGroups that define the solid.
     * Otherwise, returns the picked object.
     * @returns {ObjectGroup[]} The picked objects.
     */
    objs() {
        if (this.fromSolid) {
            return this._getSolidObjectGroups(this.obj);
        } else {
            return [this.obj];
        }

    }
}

class Raycaster {
    constructor(camera, domElement, width, height, group, callback) {
        this.camera = camera;
        this.group = group;
        this.domElement = domElement;
        this.width = width;
        this.height = height;
        this.callback = callback;

        this.raycaster = new THREE.Raycaster();
        this.raycastMode = false;

        this.lastPosition = null;

        this.mouse = new THREE.Vector2();
        this.mouseMoved = false;
        this.filters = { topoFilter: [TopoFilter.none], geomFilter: [GeomFilter.none] };
    }

    dispose() {
        this.domElement.removeEventListener("mousemove", this.onPointerMove);
        this.domElement.removeEventListener("mouseup", this.mouseKetUp);
        this.domElement.removeEventListener("mousedown", this.onMouseKeyDown);
        this.domElement.removeEventListener("keydown", this.onKeyDown);
        this.raycastMode = false;
    }

    init() {
        this.domElement.addEventListener("mousemove", this.onPointerMove);
        this.domElement.addEventListener("mouseup", this.onMouseKeyUp, false);
        this.domElement.addEventListener("mousedown", this.onMouseKeyDown, false);
        this.domElement.addEventListener("keydown", this.onKeyDown, false);
        this.raycastMode = true;
    }

    /**
     * Retrieve all the valid intersected objects by a ray caster from the mouse.
     * The objects are sorted by their distance from the ray. (The closest first)
     */
    getValidIntersectedObjs() {
        var validObjs = [];
        if (this.mouseMoved) {
            this.raycaster.setFromCamera(this.mouse, this.camera.getCamera());
            const objects = this.raycaster.intersectObjects(this.group, true);

            for (var object of objects) {
                if (
                    object.object.material.visible &&
                    (object.distanceToRay == null ||
                        object.distanceToRay < 0.03)
                ) {
                    const objectGroup = object.object.parent;
                    if (objectGroup == null) continue;

                    const topo = objectGroup.geomtype.topo;
                    const geom = objectGroup.geomtype.geomtype;

                    // Check if topology is acceptable given the topology filters

                    let valid = (this.filters.topoFilter.includes(TopoFilter.solid)
                        || this.filters.topoFilter.includes(TopoFilter.none)
                        || this.filters.topoFilter.includes(topo));

                    if (!valid) continue;

                    // Check if geom is acceptable given the geom filters
                    valid = (!this.filters.topoFilter.includes(TopoFilter.solid)
                        && (this.filters.geomFilter.includes(GeomFilter.none)
                            || this.filters.geomFilter.includes(geom)));

                    if (valid) {
                        validObjs.push(object);
                    }

                }
            }
        }
        return validObjs;
    }

    /**
     * Handle left mouse button down event
     * @function
     * @param {MouseEvent} e - a DOM MouseEvent
     */
    onMouseKeyDown = (e) => {
        if (this.raycastMode) {
            if (e.button == THREE.MOUSE.LEFT || e.button == THREE.MOUSE.RIGHT) {
                this.lastPosition = this.camera.getPosition().clone();
            }
        }
    };


    /**
     * Handle left mouse button up event
     * @function
     * @param {MouseEvent} e - a DOM MouseEvent
     */
    onMouseKeyUp = (e) => {
        if (this.raycastMode) {
            if (e.button == THREE.MOUSE.LEFT) {
                if (this.lastPosition.equals(this.camera.getPosition())) {
                    this.callback({ mouse: "left" });
                }
            } else if (e.button == THREE.MOUSE.RIGHT) {
                if (this.lastPosition.equals(this.camera.getPosition())) {
                    this.callback({ mouse: "right" });
                }
            }
        }
    };

    /**
     * Handle key down event
     * @function
     * @param {MouseEvent} e - a DOM MouseEvent
     */
    onKeyDown = (e) => {
        if (this.raycastMode) {
            if (e.key == "Backspace") {
                this.callback({ key: "Backspace" });
            } else if (e.key == "Escape") {
                this.callback({ key: "Escape" });
            }
        }
    };

    /**
     * Get the current mouse position
     * @function
     * @param {MouseEvent} e - a DOM MouseEvent
     */
    onPointerMove = (e) => {
        const rect = this.domElement.getBoundingClientRect();
        const offsetX = rect.x + window.scrollX;
        const offsetY = rect.y + window.scrollY;
        this.mouse.x = ((e.pageX - offsetX) / this.width) * 2 - 1;
        this.mouse.y = -((e.pageY - offsetY) / this.height) * 2 + 1;
        this.mouseMoved = true;
    };
}

export { Raycaster };