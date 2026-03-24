import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";

import { createRoom1 } from "./room1.js";
import { createRoom2 } from "./room2.js";

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202533);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 4);

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));


// ======================
// LIGHT
// ======================
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// ======================
// ROOMS
// ======================
const room1 = createRoom1(scene, camera);
const room2 = createRoom2(scene);

room2.visible = false;

// ======================
// ROOM SWITCH
// ======================
window.goRoom = (n) => {

    room1.visible = (n === 1);
    room2.visible = (n === 2);

    if (n === 1) camera.position.set(0, 1.6, 4);
    if (n === 2) camera.position.set(6, 1.6, 0);
};

// ======================
// LOOP
// ======================
renderer.setAnimationLoop(() => {

    const speed = 0.08;

    if (!renderer.xr.isPresenting) {

        if (keys["w"]) controls.moveForward(speed);
        if (keys["s"]) controls.moveForward(-speed);
        if (keys["a"]) controls.moveRight(-speed);
        if (keys["d"]) controls.moveRight(speed);
    }

    renderer.render(scene, camera);
});
