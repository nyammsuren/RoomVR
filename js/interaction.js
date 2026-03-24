import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const clickable = [];

function registerClickable(obj, callback) {
    clickable.push({ obj, callback });
}

window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(
        clickable.map(c => c.obj)
    );

    if (intersects.length > 0) {
        const hit = clickable.find(c => c.obj === intersects[0].object);
        if (hit) hit.callback();
    }
});