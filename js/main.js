import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createRoom1 } from "./room1.js";
import { createRoom2 } from "./room2.js";

// ======================
// RENDERER — эхэлж үүсгэнэ
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202533);

// ======================
// CAMERA — renderer-ийн дараа
// ======================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 4);

// ======================
// ORBIT CONTROLS — camera болон renderer аль аль нь бэлэн болсны дараа
// ======================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// ======================
// CLOCK
// ======================
const clock = new THREE.Clock();

// ======================
// LIGHT
// ======================
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
light.castShadow = true;
scene.add(light);

// ======================
// PLAYER RIG (VR хөдөлгөөнд хэрэгтэй)
// ======================
const playerRig = new THREE.Group();
playerRig.add(camera);
scene.add(playerRig);

// ======================
// ROOMS
// ======================
const room1 = createRoom1(scene, camera, renderer);
const room2 = createRoom2(scene);

room1.visible = true;
room2.visible = false;

// ======================
// ROOM SWITCH
// ======================
window.goRoom = (n) => {
    room1.visible = (n === 1);
    room2.visible = (n === 2);
    if (n === 1) {
        camera.position.set(0, 1.6, 4);
        controls.target.set(0, 1.0, 0);
    }
    if (n === 2) {
        camera.position.set(0, 1.6, 4);
        controls.target.set(0, 1.0, 0);
    }
    controls.update();
};

// ==========================
// VR CONTROLLER
// ==========================
const controller = renderer.xr.getController(0);
scene.add(controller);

const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
]);
const line = new THREE.Line(
    laserGeo,
    new THREE.LineBasicMaterial({ color: 0xffffff })
);
line.scale.z = 15;
controller.add(line);

// ==========================
// VR RAYCAST
// ==========================
const tempMatrix = new THREE.Matrix4();
const raycaster  = new THREE.Raycaster();

controller.addEventListener("selectstart", () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const hits = raycaster.intersectObjects(scene.children, true);
    if (!hits.length) return;
    const obj = hits[0].object;

    if (obj.userData?.kind === "door")         { window.goRoom(2); return; }
    if (obj.userData?.kind === "backDoor")      { window.goRoom(1); return; }
    if (obj.userData?.kind === "teacherChair")  { camera.position.set(-3, 1.2, 4.22); return; }
    if (obj.userData?.kind === "tv")            { room2.userData.toggleVideo?.(); return; }
    if (obj.userData?.teleport) {
        const point = hits[0].point;
        playerRig.position.set(point.x, 0, point.z);
    }
});

// ==========================
// MOUSE RAYCAST
// ==========================
const mouse          = new THREE.Vector2();
const raycasterMouse = new THREE.Raycaster();

window.addEventListener("click", (event) => {
    if (renderer.xr.isPresenting) return;

    mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycasterMouse.setFromCamera(mouse, camera);
    const hits = raycasterMouse.intersectObjects(scene.children, true);
    if (!hits.length) return;
    const obj = hits[0].object;
    console.log("CLICK:", obj.userData);

    if (obj.userData?.kind === "door")         { window.goRoom(2); return; }
    if (obj.userData?.kind === "backDoor")      { window.goRoom(1); return; }
    if (obj.userData?.kind === "teacherChair")  { camera.position.set(-3, 1.2, 4.22); return; }
    if (obj.userData?.kind === "tv")            { room2.userData.toggleVideo?.(); return; }
});

// ==========================
// VR горимд OrbitControls унтраах
// ==========================
renderer.xr.addEventListener("sessionstart", () => {
    controls.enabled = false;
});
renderer.xr.addEventListener("sessionend", () => {
    controls.enabled = true;
    controls.update();
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

    if (!renderer.xr.isPresenting) {
        controls.update();
    }

    if (room1.visible) room1.userData.update?.(delta, playerRig);
    if (room2.visible) room2.userData.update?.();

    renderer.render(scene, camera);
});
