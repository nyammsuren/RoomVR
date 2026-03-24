import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createCableSystem(scene, pc, sw) {

    const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05,0.05,1),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );

    cable.position.copy(pc.position);
    scene.add(cable);

    let dragging = false;

    window.addEventListener("mousedown", () => dragging = true);
    window.addEventListener("mouseup", () => {
        dragging = false;

        if (cable.position.distanceTo(sw.position) < 1) {
            cable.position.copy(sw.position);
            console.log("CONNECTED!");
        }
    });

    window.addEventListener("mousemove", () => {
        if (dragging) {
            cable.position.x += (Math.random()-0.5)*0.1;
        }
    });
}