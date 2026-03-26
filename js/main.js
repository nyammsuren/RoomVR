import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { createRoom1 } from "./room1.js";
import { createRoom2 } from "./room2.js";
import { createRoom3 } from "./room3.js";   // ✅ шинэ лаборатори
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0,1,0);
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
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// ======================
// CLOCK
// ======================
const clock = new THREE.Clock();

// ======================
// LIGHTS
// ======================
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ======================
// PLAYER RIG
// ======================
const playerRig = new THREE.Group();
playerRig.add(camera);
scene.add(playerRig);

// ======================
// ROOMS
// ======================
const room1 = createRoom1(scene, camera, renderer);
const room2 = createRoom2(scene);
const room3 = createRoom3(scene, camera, renderer);  // ✅ лаборатори

room2.visible = false;
room3.visible = false;

// ======================
// ROOM SWITCH
// ======================
window.goRoom = (n) => {
    room1.visible = (n === 1);
    room2.visible = (n === 2);
    room3.visible = (n === 3);

    if (renderer.xr.isPresenting) {
        playerRig.position.set(0, 0, 0);
    } else {
        camera.position.set(0, 1.6, 4);
        camera.lookAt(0, 0, 0);
    }
    const names = { 1:'Room 1', 2:'Хичээлийн танхим', 3:'Лаборатори' };
    console.log(`→ ${names[n]} руу шилжлээ`);
};

// ======================
// VR CONTROLLER
// ======================
const controller = renderer.xr.getController(0);
scene.add(controller);

const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
]);
const laserLine = new THREE.Line(
    laserGeo,
    new THREE.LineBasicMaterial({ color: 0x00ffcc })
);
laserLine.scale.z = 15;
controller.add(laserLine);

// ======================
// VR RAYCAST
// ======================
const tempMatrix = new THREE.Matrix4();
const raycasterVR = new THREE.Raycaster();

controller.addEventListener("selectstart", () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycasterVR.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycasterVR.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const activeRoom = room1.visible ? room1 : room2.visible ? room2 : room3;
    const hits = raycasterVR.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj) {
        if (obj.userData?.kind) break;
        obj = obj.parent;
    }
    if (!obj?.userData?.kind) return;

    const kind = obj.userData.kind;
    if (kind === "door")         { window.goRoom(2); return; }
    if (kind === "labDoor")      { window.goRoom(3); return; }  // ✅ room2 → room3
    if (kind === "backDoor") {
        if (room2.visible) window.goRoom(1);
        if (room3.visible) window.goRoom(2);
        return;
    }
    if (kind === "teacherChair") {
        if (renderer.xr.isPresenting) playerRig.position.set(-3, 0, 4.22);
        else camera.position.set(-3, 1.2, 4.22);
        return;
    }
    if (kind === "tv")           { room2.userData.toggleVideo?.(); return; }
    if (obj.userData?.teleport) {
        const point = hits[0].point;
        if (renderer.xr.isPresenting) playerRig.position.set(point.x, 0, point.z);
        else camera.position.set(point.x, 1.6, point.z);
    }
});

// ======================
// MOUSE CLICK
// ======================
const mouse = new THREE.Vector2();
const raycasterMouse = new THREE.Raycaster();

window.addEventListener("click", (event) => {
    mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycasterMouse.setFromCamera(mouse, camera);

    const activeRoom = room1.visible ? room1 : room2.visible ? room2 : room3;
    const hits = raycasterMouse.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj) {
        if (obj.userData?.kind) break;
        obj = obj.parent;
    }

    if (obj?.userData?.kind) {
        const kind = obj.userData.kind;
        if (kind === "door")         { window.goRoom(2); return; }
        if (kind === "labDoor")      { window.goRoom(3); return; }
        if (kind === "backDoor") {
            if (room2.visible) window.goRoom(1);
            if (room3.visible) window.goRoom(2);
            return;
        }
        if (kind === "teacherChair") { camera.position.set(-3, 1.2, 4.22); return; }
        if (kind === "tv")           { room2.userData.toggleVideo?.(); return; }
    }

    // room3 дотор node click (кабель холболт)
    if (room3.visible) room3.userData.onClick?.(raycasterMouse);
});

// ======================
// KEYBOARD
// ======================
window.addEventListener("keydown", (e) => {
    room3.userData.onKey?.(e.key);
});

// ======================
// RESIZE
// ======================
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ======================
// ANIMATION LOOP
// ======================
renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    if (room1.visible) room1.userData.update?.(delta, playerRig);
    if (room2.visible) room2.userData.update?.();
    if (room3.visible) room3.userData.update?.(delta, playerRig);
    renderer.render(scene, camera);
});
