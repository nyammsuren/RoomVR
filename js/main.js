import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { createRoom1 } from "./room1.js";
import { createRoom2 } from "./room2.js";
import { createRoom3 } from "./room3.js";

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
const room2 = createRoom2(scene, camera, renderer);
const room3 = createRoom3(scene, camera, renderer);

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
    const names = { 1: "Room 1", 2: "Хичээлийн танхим", 3: "Лаборатори" };
    console.log(`→ ${names[n]} руу шилжлээ`);
};

// ======================
// VR RAYCAST ТУСЛАХ
// ======================
// ✅ Эхлээд тодорхойлно — controller listener-үүд доор ашиглана
const tempMatrix  = new THREE.Matrix4();
const raycasterVR = new THREE.Raycaster();

// ======================
// TELEPORT MARKER
// ======================
const teleportMarker = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.22, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide })
);
teleportMarker.rotation.x = -Math.PI / 2;
teleportMarker.visible = false;
scene.add(teleportMarker);

let teleportTarget = null;

// ======================
// БАРУУН ГАР (controller 0)
// Үүрэг: хаалга шилжих + шал дарахад teleport
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

controller.addEventListener("selectstart", () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycasterVR.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycasterVR.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const activeRoom = room1.visible ? room1 : room2.visible ? room2 : room3;
    const hits = raycasterVR.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    // userData.kind шалгах — parent chain дагна
    let obj = hits[0].object;
    while (obj) {
        if (obj.userData?.kind) break;
        obj = obj.parent;
    }

    if (obj?.userData?.kind) {
        const kind = obj.userData.kind;
        if (kind === "door")     { window.goRoom(2); return; }
        if (kind === "labDoor")  { window.goRoom(3); return; }
        if (kind === "backDoor") {
            if (room2.visible) window.goRoom(1);
            if (room3.visible) window.goRoom(2);
            return;
        }
        if (kind === "teacherChair") {
            playerRig.position.set(-3, 0, 4.22);
            return;
        }
        if (kind === "tv") {
            room2.userData.toggleVideo?.();
            return;
        }
    }

    // ✅ Шал дарвал teleport aim — зүүн гараар confirm хийнэ
    const floorHits = raycasterVR.intersectObjects(
        activeRoom.children.filter(c => c.userData?.teleport), false
    );
    if (floorHits.length > 0) {
        teleportTarget = floorHits[0].point.clone();
        teleportMarker.position.set(teleportTarget.x, teleportTarget.y + 0.01, teleportTarget.z);
        teleportMarker.visible = true;
    }

    // room3 дотор node дарах — кабель холболт
    if (room3.visible) {
        const rc = new THREE.Raycaster();
        rc.ray.origin.copy(raycasterVR.ray.origin);
        rc.ray.direction.copy(raycasterVR.ray.direction);
        room3.userData.onVRSelect?.(rc);
    }
});

controller.addEventListener("selectend", () => {
    // ✅ Trigger суллахад teleport биелнэ
    if (teleportTarget) {
        playerRig.position.set(teleportTarget.x, 0, teleportTarget.z);
        teleportMarker.visible = false;
        teleportTarget = null;
    }
});

// ======================
// ЗҮҮН ГАР (controller 1)
// Үүрэг: smooth locomotion (joystick) + aim laser
// ======================
const controller1 = renderer.xr.getController(1);
scene.add(controller1);

const laserGeo1 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
]);
const laserLine1 = new THREE.Line(
    laserGeo1,
    new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6 })
);
laserLine1.scale.z = 10;
controller1.add(laserLine1);

// ======================
// MOUSE CLICK (desktop)
// ======================
const mouse         = new THREE.Vector2();
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
        if (kind === "door")     { window.goRoom(2); return; }
        if (kind === "labDoor")  { window.goRoom(3); return; }
        if (kind === "backDoor") {
            if (room2.visible) window.goRoom(1);
            if (room3.visible) window.goRoom(2);
            return;
        }
        if (kind === "teacherChair") { camera.position.set(-3, 1.2, 4.22); return; }
        if (kind === "tv")           { room2.userData.toggleVideo?.(); return; }
    }

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
// VR SMOOTH LOCOMOTION
// Зүүн гарын joystick (axes[2], axes[3]) — бүх өрөөнд ажиллана
// ======================
const _loco = { active: false };

function handleLocomotion() {
    if (!renderer.xr.isPresenting) return;
    const session = renderer.xr.getSession();
    if (!session) return;

    session.inputSources.forEach(src => {
        if (src.handedness !== "left") return;
        const gp = src.gamepad;
        if (!gp) return;

        const ax = gp.axes[2] ?? 0;
        const ay = gp.axes[3] ?? 0;
        if (Math.abs(ax) < 0.12 && Math.abs(ay) < 0.12) return;

        const speed = 0.035;
        const dir   = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));

        playerRig.position.addScaledVector(dir,  -ay * speed);
        playerRig.position.addScaledVector(right,  ax * speed);
    });
}

// ======================
// ANIMATION LOOP
// ======================
renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();

    // ✅ Smooth locomotion — бүх өрөөнд
    handleLocomotion();

    // ✅ playerRig-ийг бүх update-д дамжуулна
    if (room1.visible) room1.userData.update?.(delta, playerRig);
    if (room2.visible) room2.userData.update?.(delta, playerRig);  // ✅ playerRig нэмэгдсэн
    if (room3.visible) room3.userData.update?.(delta, playerRig);

    renderer.render(scene, camera);
});
