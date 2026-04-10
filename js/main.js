import * as THREE from "three";
import { VRButton }       from "three/addons/webxr/VRButton.js";
import { OrbitControls }  from "three/addons/controls/OrbitControls.js";
import { createLobby }    from "./lobby.js";
import { createRoom2 }    from "./room2.js";
import { createRoom3 }    from "./room3.js";
import { createRoom4 }    from "./room4.js";
import { createRoom5 }    from "./room5.js";

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202533);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
// ORBIT CONTROLS
// ======================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, -3);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance   = 0.5;
controls.maxDistance   = 25;
controls.enablePan     = false;
controls.maxPolarAngle = Math.PI * 0.85;

renderer.xr.addEventListener("sessionstart", () => { controls.enabled = false; });
renderer.xr.addEventListener("sessionend",   () => { controls.enabled = true;  });

// ======================
// ӨРӨӨНҮҮД
// 0 = Угтах танхим (lobby)
// 1 = Лекцийн танхим (room2)
// 2 = Сүлжээний лаборатори (room3)
// 3 = AR лаборатори (room4)
// 4 = Компьютерийн лаборатори (room5)
// ======================
const lobby    = createLobby(scene);
const lectureR = createRoom2(scene);
const netLabR  = createRoom3(scene, camera, renderer);
const arLabR   = createRoom4(scene);
const compLabR = createRoom5(scene);

const roomMap = { 0: lobby, 1: lectureR, 2: netLabR, 3: arLabR, 4: compLabR };

lectureR.visible = false;
netLabR.visible  = false;
arLabR.visible   = false;
compLabR.visible = false;

// ======================
// ПОРТАЛ ВИЗУАЛ
// ======================
function createPortalMesh(color) {
    const g = new THREE.Group();

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.07, 20, 60),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.5,
            roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.95 })
    );
    g.add(ring);

    const inner = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    inner.position.z = 0.01;
    g.add(inner);

    const aura = new THREE.Mesh(
        new THREE.CircleGeometry(0.85, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    );
    aura.position.z = -0.01;
    g.add(aura);

    const light = new THREE.PointLight(color, 3, 4);
    light.position.z = 0.3;
    g.add(light);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.03, 12, 50),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 })
    );
    g.add(ring2);

    g.userData.update = (t) => {
        ring.material.emissiveIntensity = 2.0 + Math.sin(t * 2.2) * 0.8;
        inner.material.opacity          = 0.25 + Math.sin(t * 1.6) * 0.15;
        aura.material.opacity           = 0.08 + Math.sin(t * 0.9) * 0.06;
        inner.rotation.z                = t * 0.4;
        ring2.rotation.z                = -t * 0.6;
        ring2.material.opacity          = 0.35 + Math.sin(t * 2.5) * 0.2;
        light.intensity                 = 2.5 + Math.sin(t * 3.0) * 0.8;
    };
    return g;
}

// Портал байрлалууд — хаалгатай яг таарна
const portalDefs = [
    // Lobby → target rooms
    { rg: lobby,    color: 0x2266dd, x: -3,          y: 1, z: -5.85,         rotY: 0           },
    { rg: lobby,    color: 0x229944, x:  3,          y: 1, z: -5.85,         rotY: 0           },
    { rg: lobby,    color: 0xbb33aa, x: -5.85,       y: 1, z: -2,            rotY: Math.PI / 2 },
    { rg: lobby,    color: 0xff6600, x:  5.85,       y: 1, z: -2,            rotY:-Math.PI / 2 },
    // Target rooms → lobby
    { rg: lectureR, color: 0x2266dd, x:  4.9,        y: 1, z:  0,            rotY:-Math.PI / 2 },
    { rg: netLabR,  color: 0x229944, x: -3,          y: 1, z:  4.85,         rotY: Math.PI     },
    { rg: arLabR,   color: 0xbb33aa, x:  0,          y: 1, z:  4.85,         rotY: Math.PI     },
    { rg: compLabR, color: 0xff6600, x:  4.85,       y: 1, z:  0,            rotY:-Math.PI / 2 },
];

const allPortals = [];
portalDefs.forEach(({ rg, color, x, y, z, rotY }) => {
    const p = createPortalMesh(color);
    p.position.set(x, y, z);
    p.rotation.y = rotY;
    rg.add(p);
    allPortals.push(p);
});

// ======================
// ROOM SWITCH
// ======================
let currentRoom = 0;
let isSitting   = false;

const camPos    = { 0:[0,1.6,4], 1:[0,1.6,4], 2:[0,1.6,4], 3:[0,1.6,4], 4:[0,1.6,0] };
const camTarget = { 0:[0,1,-3],  1:[0,1,0],   2:[0,1,0],   3:[0,1,0],   4:[0,1,-2]  };
const roomNames = { 0:"Угтах танхим", 1:"Лекцийн танхим", 2:"Сүлжээний лаборатори",
                    3:"AR лаборатори", 4:"Компьютерийн лаборатори" };

window.goRoom = (n) => {
    isSitting = false;
    Object.values(roomMap).forEach(r => { r.visible = false; });
    roomMap[n].visible = true;
    currentRoom = n;

    if (renderer.xr.isPresenting) {
        playerRig.position.set(0, 0, 0);
    } else {
        const [cx, cy, cz] = camPos[n];
        const [tx, ty, tz] = camTarget[n];
        camera.position.set(cx, cy, cz);
        controls.target.set(tx, ty, tz);
        controls.update();
    }
    console.log(`→ ${roomNames[n]} руу шилжлээ`);
};

// ======================
// PROXIMITY PORTAL DETECTION
// ======================
const PORTAL_TRIGGER_DIST = 1.2;

const portalTriggers = [
    { room: 0, kind: "toLecture",  target: 1, x: -3,    z: -5.85 },
    { room: 0, kind: "toNetLab",   target: 2, x:  3,    z: -5.85 },
    { room: 0, kind: "toARLab",    target: 3, x: -5.85, z: -2    },
    { room: 0, kind: "toCompLab",  target: 4, x:  5.85, z: -2    },
    { room: 1, kind: "backDoor",   target: 0, x:  4.5,  z:  0    },
    { room: 2, kind: "backDoor",   target: 0, x: -3,    z:  4.85 },
    { room: 3, kind: "backDoor",   target: 0, x:  0,    z:  4.85 },
    { room: 4, kind: "backDoor",   target: 0, x:  4.85, z:  0    },
];

function getPlayerWorldPos() {
    const pos = new THREE.Vector3();
    if (renderer.xr.isPresenting) playerRig.getWorldPosition(pos);
    else camera.getWorldPosition(pos);
    return pos;
}

let lastTransition = 0;

function checkPortalProximity() {
    const now = performance.now();
    if (now - lastTransition < 1500) return;
    const pos = getPlayerWorldPos();
    for (const t of portalTriggers) {
        if (t.room !== currentRoom) continue;
        const dx = pos.x - t.x;
        const dz = pos.z - t.z;
        if (Math.sqrt(dx * dx + dz * dz) < PORTAL_TRIGGER_DIST) {
            lastTransition = now;
            window.goRoom(t.target);
            return;
        }
    }
}

// ======================
// VR CONTROLLER
// ======================
const controller = renderer.xr.getController(0);
scene.add(controller);

const laserLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)]),
    new THREE.LineBasicMaterial({ color: 0x00ffcc })
);
laserLine.scale.z = 15;
controller.add(laserLine);

const tempMatrix  = new THREE.Matrix4();
const raycasterVR = new THREE.Raycaster();

function handleKind(kind, isVR) {
    if (kind === "toLecture")  { window.goRoom(1); return true; }
    if (kind === "toNetLab")   { window.goRoom(2); return true; }
    if (kind === "toARLab")    { window.goRoom(3); return true; }
    if (kind === "toCompLab")  { window.goRoom(4); return true; }
    if (kind === "backDoor")   { window.goRoom(0); return true; }
    if (kind === "labDoor")    { window.goRoom(2); return true; }
    if (kind === "teacherChair") {
        if (!isSitting) {
            isSitting = true;
            if (isVR) playerRig.position.set(-3, -0.7, -4.65);
            else { camera.position.set(-3, 1.2, -4.65); controls.target.set(-3, 0.95, -3.5); controls.update(); }
        }
        return true;
    }
    if (kind === "teacherDesk") {
        if (isSitting) {
            isSitting = false;
            if (isVR) playerRig.position.set(-3, 0, -4.3);
            else { camera.position.set(-3, 1.9, -4.0); controls.target.set(-3, 1.2, -3.5); controls.update(); }
        }
        return true;
    }
    if (kind === "tv") { lectureR.userData.toggleVideo?.(); return true; }
    if (kind === "compTeacherChair") {
        if (!isSitting) {
            isSitting = true;
            if (isVR) playerRig.position.set(-3, -0.7, -5.1);
            else { camera.position.set(-3, 1.2, -5.0); controls.target.set(-3, 0.95, -4.0); controls.update(); }
        }
        return true;
    }
    if (kind === "compTeacherDesk") {
        if (isSitting) {
            isSitting = false;
            if (isVR) playerRig.position.set(-3, 0, -5.0);
            else { camera.position.set(-3, 1.9, -4.5); controls.target.set(-3, 1.2, -4.0); controls.update(); }
        }
        return true;
    }
    return false;
}

controller.addEventListener("selectstart", () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycasterVR.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycasterVR.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const activeRoom = roomMap[currentRoom];
    const hits = raycasterVR.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj) { if (obj.userData?.kind) break; obj = obj.parent; }
    if (!obj?.userData?.kind) return;

    if (!handleKind(obj.userData.kind, true) && obj.userData?.teleport) {
        const point = hits[0].point;
        playerRig.position.set(point.x, 0, point.z);
    }
});

// ======================
// MOUSE CLICK
// ======================
const mouse          = new THREE.Vector2();
const raycasterMouse = new THREE.Raycaster();

window.addEventListener("click", (event) => {
    mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycasterMouse.setFromCamera(mouse, camera);

    const activeRoom = roomMap[currentRoom];
    const hits = raycasterMouse.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj) { if (obj.userData?.kind) break; obj = obj.parent; }

    if (obj?.userData?.kind) {
        if (handleKind(obj.userData.kind, false)) return;
    }

    if (currentRoom === 2) netLabR.userData.onClick?.(raycasterMouse);
});

// ======================
// KEYBOARD
// ======================
window.addEventListener("keydown", (e) => {
    if (currentRoom === 2) netLabR.userData.onKey?.(e.key);
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
    const t     = performance.now() * 0.001;

    allPortals.forEach(p => p.userData.update?.(t));

    lobby.userData.update?.();
    if (currentRoom === 1) lectureR.userData.update?.();
    if (currentRoom === 2) netLabR.userData.update?.(delta, playerRig);
    if (currentRoom === 3) arLabR.userData.update?.();
    if (currentRoom === 4) compLabR.userData.update?.();

    checkPortalProximity();
    if (!renderer.xr.isPresenting) controls.update();
    renderer.render(scene, camera);
});
