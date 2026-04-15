import * as THREE from "three";
import { VRButton }       from "three/addons/webxr/VRButton.js";
import { OrbitControls }  from "three/addons/controls/OrbitControls.js";
import { createLobby }    from "./lobby.js";
import { createRoom2 }    from "./room2.js";
import { createRoom3 }    from "./room3.js";
import { createRoom4 }    from "./room4.js";
import { createRoom5 }    from "./room5.js";
import { createRoom6 }    from "./room6.js";
import { createRoom7 }    from "./room7.js";

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
controls.enableZoom    = false;
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
// 5 = Номын сан (room6)
// ======================
const lobby    = createLobby(scene);
const lectureR = createRoom2(scene);
const netLabR  = createRoom3(scene, camera, renderer);
const arLabR   = createRoom4(scene);
const compLabR = createRoom5(scene);
const libraryR = createRoom6(scene);
const serverR  = createRoom7(scene);

const roomMap = { 0: lobby, 1: lectureR, 2: netLabR, 3: arLabR, 4: compLabR, 5: libraryR, 6: serverR };

lectureR.visible = false;
netLabR.visible  = false;
arLabR.visible   = false;
compLabR.visible = false;
libraryR.visible = false;
serverR.visible  = false;

// ======================
// ПОРТАЛ ВИЗУАЛ
// ======================
function createPortalMesh(color) {
    const g = new THREE.Group();

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.09, 20, 60),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.5,
            roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.95 })
    );
    g.add(ring);

    const inner = new THREE.Mesh(
        new THREE.CircleGeometry(0.73, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    inner.position.z = 0.01;
    g.add(inner);

    const aura = new THREE.Mesh(
        new THREE.CircleGeometry(1.1, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    );
    aura.position.z = -0.01;
    g.add(aura);

    const light = new THREE.PointLight(color, 4, 5);
    light.position.z = 0.3;
    g.add(light);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.04, 12, 50),
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
    // Lobby → target rooms (хаалганы яг байрлал, lobby RD=12)
    { rg: lobby,    color: 0x2266dd, x: -3,    y: 1.2, z: -5.88, rotY: 0           },
    { rg: lobby,    color: 0x229944, x:  3,    y: 1.2, z: -5.88, rotY: 0           },
    { rg: lobby,    color: 0xbb33aa, x: -5.88, y: 1.2, z: -2,    rotY: Math.PI / 2 },
    { rg: lobby,    color: 0xff6600, x:  5.88, y: 1.2, z: -2,    rotY:-Math.PI / 2 },
    { rg: lobby,    color: 0xddaa00, x:  5.88, y: 1.2, z:  2,    rotY:-Math.PI / 2 },
    { rg: lobby,    color: 0x00ccff, x: -5.88, y: 1.2, z:  2,    rotY: Math.PI / 2 },
    // Target rooms → lobby (хаалганы яг байрлал)
    { rg: lectureR, color: 0x2266dd, x:  4.9,  y: 1.2, z:  0,    rotY:-Math.PI / 2 },
    { rg: netLabR,  color: 0x229944, x: -4.9,  y: 1.2, z:  0,    rotY: Math.PI/2   },
    { rg: arLabR,   color: 0xbb33aa, x:  0,    y: 1.2, z:  4.85, rotY: Math.PI     },
    { rg: compLabR, color: 0xff6600, x:  4.85, y: 1.2, z:  0,    rotY:-Math.PI / 2 },
    { rg: libraryR, color: 0xddaa00, x:  0,    y: 1.2, z:  5.88, rotY: 0           },
    { rg: serverR,  color: 0x00ccff, x:  0,    y: 1.2, z:  4.85, rotY: Math.PI     },
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

const camPos    = { 0:[0,1.8,4], 1:[0,1.8,4], 2:[0,1.8,4], 3:[0,2.8,3], 4:[0,1.9,0], 5:[0,2.8,3], 6:[0,1.8,2] };
const camTarget = { 0:[0,1,-3],  1:[0,1,0],   2:[0,1,0],   3:[0,3.5,-4], 4:[0,1.9,-2], 5:[0,3.5,-4], 6:[0,1.8,-2] };
const roomNames = { 0:"Угтах танхим", 1:"Лекцийн танхим", 2:"Сүлжээний лаборатори",
                    3:"AR лаборатори", 4:"Компьютерийн лаборатори", 5:"Номын сан", 6:"Серверийн өрөө" };

window.goRoom = (n) => {
    isSitting = false;
    roomMap[currentRoom]?.userData?.onLeave?.(); // одоогийн өрөөний cleanup
    Object.values(roomMap).forEach(r => { r.visible = false; });
    roomMap[n].visible = true;
    currentRoom = n;
    lastTransition = performance.now(); // өрөө шилжих бүрт proximity cooldown дахин тооцно

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
const PORTAL_TRIGGER_DIST = 1.5;

const portalTriggers = [
    // Угтах танхим → бусад өрөөнүүд
    { room: 0, kind: "toLecture",  target: 1, x: -3,   z: -5.1 },
    { room: 0, kind: "toNetLab",   target: 2, x:  3,   z: -5.1 },
    { room: 0, kind: "toARLab",    target: 3, x: -5.1, z: -2   },
    { room: 0, kind: "toCompLab",  target: 4, x:  5.1, z: -2   },
    { room: 0, kind: "toLibrary",  target: 5, x:  5.1, z:  2   },
    { room: 0, kind: "toServer",   target: 6, x: -5.1, z:  2   },
    // Бусад өрөөнөөс угтах танхим руу
    { room: 1, kind: "backDoor",   target: 0, x:  4.1, z:  0   },
    { room: 2, kind: "backDoor",   target: 0, x: -4.1, z:  0   },
    { room: 3, kind: "backDoor",   target: 0, x:  0,   z:  4.7 },
    { room: 4, kind: "backDoor",   target: 0, x:  4.1, z:  0   },
    { room: 5, kind: "backDoor",   target: 0, x:  0,   z:  5.1 },
    { room: 6, kind: "backDoor",   target: 0, x:  0,   z:  4.7 },
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
const controller0 = renderer.xr.getController(0);
const controller1 = renderer.xr.getController(1);
playerRig.add(controller0);
playerRig.add(controller1);

// Laser — контроллер холбогдох үед л нэм (connected event)
function makeLaser() {
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -8)];
    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x00ffff })
    );
    const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    dot.position.z = -8;
    const g = new THREE.Group();
    g.add(line);
    g.add(dot);
    g.name = "laser";
    return g;
}

function onCtrlConnected(event) {
    // tracked-pointer гарт laser нэм
    if (event.data.targetRayMode === "tracked-pointer") {
        // давхардуулахгүйн тулд өмнөхийг устга
        const old = this.getObjectByName("laser");
        if (old) this.remove(old);
        this.add(makeLaser());
    }
}
function onCtrlDisconnected() {
    const old = this.getObjectByName("laser");
    if (old) this.remove(old);
}

controller0.addEventListener("connected",    onCtrlConnected);
controller0.addEventListener("disconnected", onCtrlDisconnected);
controller1.addEventListener("connected",    onCtrlConnected);
controller1.addEventListener("disconnected", onCtrlDisconnected);

const tempMatrix  = new THREE.Matrix4();
const raycasterVR = new THREE.Raycaster();

// Хоёр controller-т ч trigger дарах сонсгол нэм
function handleControllerSelect(ctrl) {
    tempMatrix.identity().extractRotation(ctrl.matrixWorld);
    raycasterVR.ray.origin.setFromMatrixPosition(ctrl.matrixWorld);
    raycasterVR.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const activeRoom = roomMap[currentRoom];
    const hits = raycasterVR.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    // hits бүрийг шалгаж эхний kind-тай объект олно (portal ring зэрэг kind-гүй mesh-ийг алгасна)
    let obj = null;
    for (const hit of hits) {
        let o = hit.object;
        while (o) { if (o.userData?.kind) break; o = o.parent; }
        if (o?.userData?.kind) { obj = o; break; }
    }

    // serverTerminal — UV шууд дамжуулна (double-raycast хийхгүй)
    if (currentRoom === 6) {
        for (const hit of hits) {
            if (hit.object?.userData?.kind === "serverTerminal" && hit.uv) {
                serverR.userData.onTerminalHit?.(hit.uv.x);
                return;
            }
        }
    }

    if (obj?.userData?.kind && handleKind(obj.userData.kind, true, obj)) return;

    if (currentRoom === 1) { lectureR.userData.onClick?.(raycasterVR); return; }
    if (currentRoom === 2) { netLabR.userData.onClick?.(raycasterVR); return; }
    if (currentRoom === 3) { arLabR.userData.onClick?.(raycasterVR); return; }
    if (currentRoom === 4) { compLabR.userData.onClick?.(raycasterVR); return; }
    if (currentRoom === 5) { libraryR.userData.onClick?.(raycasterVR); return; }
    if (currentRoom === 6) { serverR.userData.onClick?.(raycasterVR); return; }

    // Teleport: шалган дарахад тоглогчийг шилжүүлэх
    let tObj = hits[0].object;
    while (tObj) {
        if (tObj.userData?.teleport) {
            const point = hits[0].point;
            playerRig.position.set(point.x, 0, point.z);
            return;
        }
        tObj = tObj.parent;
    }
}

window.endVR = () => renderer.xr.getSession()?.end();

function handleKind(kind, isVR, clickedObj) {
    if (kind === "exitVR") { renderer.xr.getSession()?.end(); return true; }
    if (kind === "toLecture")  { window.goRoom(1); return true; }
    if (kind === "toNetLab")   { window.goRoom(2); return true; }
    if (kind === "toARLab")    { window.goRoom(3); return true; }
    if (kind === "toCompLab")  { window.goRoom(4); return true; }
    if (kind === "backDoor")   { window.goRoom(0); return true; }
    if (kind === "labDoor")    { window.goRoom(2); return true; }
    if (kind === "toLibrary")  { window.goRoom(5); return true; }
    if (kind === "toServer")   { window.goRoom(6); return true; }
    if (kind === "welcomeAudio") { lobby.userData.toggleWelcome?.(); return true; }
    if (kind === "roomAudio")    { roomMap[currentRoom].userData.toggleAudio?.(); return true; }
    if (kind === "studentChair") {
        const d = clickedObj?.userData;
        if (!d) return true;
        if (!isSitting) {
            isSitting = true;
            if (isVR) playerRig.position.set(d.sitX, -0.5, d.sitZ);
            else { camera.position.set(d.sitX, d.sitY, d.sitZ);
                   controls.target.set(d.lookX, d.lookY, d.lookZ); controls.update(); }
        } else {
            isSitting = false;
            window.goRoom(currentRoom);
        }
        return true;
    }
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
    if (kind === "tv") { roomMap[currentRoom].userData.toggleVideo?.(); return true; }
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

// ======================
// VR САМБАР ЗУРАХ
// ======================
let isVRDrawing0 = false, isVRDrawing1 = false;
let lastVRUV0 = null,     lastVRUV1 = null;

function isCtrlOnBoard(ctrl) {
    if (!lectureR?.userData?.boardMesh) return false;
    const m = new THREE.Matrix4();
    m.identity().extractRotation(ctrl.matrixWorld);
    const rc = new THREE.Raycaster();
    rc.ray.origin.setFromMatrixPosition(ctrl.matrixWorld);
    rc.ray.direction.set(0, 0, -1).applyMatrix4(m);
    const hits = rc.intersectObject(lectureR.userData.boardMesh, false);
    return hits.length > 0 && !!hits[0].uv;
}

function doVRBoardDraw(ctrl, lastUV) {
    if (!lectureR?.userData?.boardMesh) return null;
    const m = new THREE.Matrix4();
    m.identity().extractRotation(ctrl.matrixWorld);
    const rc = new THREE.Raycaster();
    rc.ray.origin.setFromMatrixPosition(ctrl.matrixWorld);
    rc.ray.direction.set(0, 0, -1).applyMatrix4(m);
    const hits = rc.intersectObject(lectureR.userData.boardMesh, false);
    if (!hits.length || !hits[0].uv) return null;
    const uv = hits[0].uv;
    const cvs = lectureR.userData.boardCvs;
    const ctx = lectureR.userData.boardCtx;
    const cx  = uv.x * cvs.width;
    const cy  = (1 - uv.y) * cvs.height;
    ctx.strokeStyle = lectureR.userData.chalkColor || "#f0f0dc";
    ctx.lineWidth   = lectureR.userData.chalkSize  || 4;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (lastUV) {
        ctx.beginPath();
        ctx.moveTo(lastUV.x, lastUV.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(cx, cy, (lectureR.userData.chalkSize || 4) / 2, 0, Math.PI * 2);
        ctx.fillStyle = lectureR.userData.chalkColor || "#f0f0dc";
        ctx.fill();
    }
    lectureR.userData.boardTex.needsUpdate = true;
    return { x: cx, y: cy };
}

controller0.addEventListener("selectstart", () => {
    if (renderer.xr.isPresenting && currentRoom === 1 && isCtrlOnBoard(controller0)) {
        isVRDrawing0 = true; lastVRUV0 = null;
    } else {
        handleControllerSelect(controller0);
    }
});
controller1.addEventListener("selectstart", () => {
    if (renderer.xr.isPresenting && currentRoom === 1 && isCtrlOnBoard(controller1)) {
        isVRDrawing1 = true; lastVRUV1 = null;
    } else {
        handleControllerSelect(controller1);
    }
});
controller0.addEventListener("selectend", () => { isVRDrawing0 = false; lastVRUV0 = null; });
controller1.addEventListener("selectend", () => { isVRDrawing1 = false; lastVRUV1 = null; });

// ======================
// САМБАР ЗУРАХ — Лекцийн танхим
// ======================
let isDrawingBoard = false;
let wasDrawing     = false;
let lastBoardUV    = null;
const boardRC      = new THREE.Raycaster();

function doBoardDraw(clientX, clientY) {
    if (currentRoom !== 1 || renderer.xr.isPresenting) return false;
    if (!lectureR.userData.boardMesh) return false;
    const mx = (clientX / window.innerWidth)  * 2 - 1;
    const my = -(clientY / window.innerHeight) * 2 + 1;
    boardRC.setFromCamera(new THREE.Vector2(mx, my), camera);
    const hits = boardRC.intersectObject(lectureR.userData.boardMesh, false);
    if (!hits.length || !hits[0].uv) return false;
    const uv  = hits[0].uv;
    const cvs = lectureR.userData.boardCvs;
    const ctx = lectureR.userData.boardCtx;
    const cx  = uv.x * cvs.width;
    const cy  = (1 - uv.y) * cvs.height;
    ctx.strokeStyle = lectureR.userData.chalkColor || "#f0f0dc";
    ctx.lineWidth   = lectureR.userData.chalkSize  || 4;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (lastBoardUV) {
        ctx.beginPath();
        ctx.moveTo(lastBoardUV.x, lastBoardUV.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(cx, cy, (lectureR.userData.chalkSize || 4) / 2, 0, Math.PI * 2);
        ctx.fillStyle = lectureR.userData.chalkColor || "#f0f0dc";
        ctx.fill();
    }
    lastBoardUV = { x: cx, y: cy };
    lectureR.userData.boardTex.needsUpdate = true;
    return true;
}

window.addEventListener("mousedown", (e) => {
    if (doBoardDraw(e.clientX, e.clientY)) isDrawingBoard = true;
});
window.addEventListener("mousemove", (e) => {
    if (isDrawingBoard) doBoardDraw(e.clientX, e.clientY);
});
window.addEventListener("mouseup", () => {
    wasDrawing     = isDrawingBoard;
    isDrawingBoard = false;
    lastBoardUV    = null;
});

// ======================
// MOUSE CLICK
// ======================
const mouse          = new THREE.Vector2();
const raycasterMouse = new THREE.Raycaster();

window.addEventListener("click", (event) => {
    if (wasDrawing) { wasDrawing = false; return; }
    mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycasterMouse.setFromCamera(mouse, camera);

    const activeRoom = roomMap[currentRoom];
    const hits = raycasterMouse.intersectObjects(activeRoom.children, true);
    if (!hits.length) return;

    // hits бүрийг шалгаж эхний kind-тай объект олно (portal ring зэрэг kind-гүй mesh-ийг алгасна)
    let obj = null;
    for (const hit of hits) {
        let o = hit.object;
        while (o) { if (o.userData?.kind) break; o = o.parent; }
        if (o?.userData?.kind) { obj = o; break; }
    }

    if (obj?.userData?.kind) {
        if (handleKind(obj.userData.kind, false, obj)) return;
    }

    if (currentRoom === 1) lectureR.userData.onClick?.(raycasterMouse);
    if (currentRoom === 2) netLabR.userData.onClick?.(raycasterMouse);
    if (currentRoom === 3) arLabR.userData.onClick?.(raycasterMouse);
    if (currentRoom === 4) compLabR.userData.onClick?.(raycasterMouse);
    if (currentRoom === 5) libraryR.userData.onClick?.(raycasterMouse);
    if (currentRoom === 6) serverR.userData.onClick?.(raycasterMouse);
});

// ======================
// SCROLL — урагш/хойш хөдлөх
// ======================
window.addEventListener("wheel", (e) => {
    if (renderer.xr.isPresenting) return;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const step = e.deltaY * 0.004;
    camera.position.addScaledVector(forward, -step);
    controls.target.addScaledVector(forward, -step);
    controls.update();
}, { passive: true });

// ======================
// KEYBOARD
// ======================
window.addEventListener("keydown", (e) => {
    if (currentRoom === 2) netLabR.userData.onKey?.(e.key);
    if (currentRoom === 6) serverR.userData.onKey?.(e.key);
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
// ХАМГИЙН ОЙР САНДАЛ — VR суух
// ======================
function sitNearestChair() {
    if (isSitting) return false;
    const activeRoom = roomMap[currentRoom];
    let bestData = null, bestDist = Infinity;
    const playerPos = new THREE.Vector3();
    playerRig.getWorldPosition(playerPos);
    activeRoom.traverse(child => {
        if (child.userData?.kind === 'studentChair') {
            const d = child.userData;
            const dx = playerPos.x - d.sitX, dz = playerPos.z - d.sitZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < bestDist) { bestDist = dist; bestData = d; }
        }
    });
    if (bestData && bestDist < 3.0) {
        isSitting = true;
        playerRig.position.set(bestData.sitX, -0.5, bestData.sitZ);
        return true;
    }
    return false;
}

// ======================
// VR GAMEPAD — товч болон жойстик
// ======================
const prevBtnState = {};

function checkVRButtons() {
    if (!renderer.xr.isPresenting) return;
    const session = renderer.xr.getSession();
    if (!session) return;

    for (const src of session.inputSources) {
        if (!src.gamepad) continue;

        // Товч шалгах (edge-triggered — зөвхөн дарах мөчид)
        src.gamepad.buttons.forEach((btn, i) => {
            const key = `${src.handedness}_${i}`;
            const wasPressed = prevBtnState[key] || false;
            if (btn.pressed && !wasPressed) {
                // Oculus/Menu товч (i=2) — VR-аас гарах
                if (i === 2) {
                    renderer.xr.getSession()?.end();
                    return;
                }
                if (currentRoom === 2) {
                    // Сүлжээний лаборатори — кабель сонгох + сандал суух
                    if (src.handedness === 'left') {
                        if (i === 4) netLabR.userData.selectCable?.('straight');   // X
                        if (i === 5) netLabR.userData.selectCable?.('crossover');  // Y
                    }
                    if (src.handedness === 'right') {
                        if (i === 4) {
                            // A: суух (ойрхон сандал байвал), эсвэл console кабель
                            if (!sitNearestChair()) netLabR.userData.selectCable?.('console');
                        }
                        if (i === 5) {
                            // B: босох (суусан бол), эсвэл serial кабель
                            if (isSitting) { isSitting = false; window.goRoom(currentRoom); }
                            else netLabR.userData.selectCable?.('serial');
                        }
                    }
                } else if (currentRoom === 6) {
                    // Серверийн өрөө — сандал суух + terminal удирдлага
                    if (src.handedness === 'right') {
                        if (i === 4) {
                            // A: суух, эсвэл terminal-д Enter
                            if (!sitNearestChair()) serverR.userData.onKey?.("Enter");
                        }
                        if (i === 5) {
                            // B: босох, эсвэл terminal-д Escape
                            if (isSitting) { isSitting = false; window.goRoom(currentRoom); }
                            else serverR.userData.onKey?.("Escape");
                        }
                    }
                } else {
                    // Бусад өрөөнд — сандал суух/босох
                    if (src.handedness === 'right') {
                        if (i === 4) sitNearestChair();           // A → суух
                        if (i === 5) { isSitting = false; window.goRoom(currentRoom); } // B → босох
                    }
                }
            }
            prevBtnState[key] = btn.pressed;
        });

        // Зүүн жойстик — AR өрөөнд zoom, бусад өрөөнд урагш/хойш хөдөлгөөн
        if (src.handedness === 'left' && src.gamepad.axes.length >= 4) {
            const az = src.gamepad.axes[3];
            const DEAD = 0.12;
            if (Math.abs(az) > DEAD) {
                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                forward.y = 0; forward.normalize();
                playerRig.position.addScaledVector(forward, -az * 0.05);
            }
        }

        // Баруун жойстик — AR өрөөнд topology эргүүлэх, бусад өрөөнд хөдөлгөөн
        if (src.handedness === 'right' && src.gamepad.axes.length >= 4) {
            const ax = src.gamepad.axes[2];
            const az = src.gamepad.axes[3];
            const DEAD = 0.12;
            if (currentRoom === 3) {
                // AR өрөө: displayGroup эргүүлэх
                const dg = arLabR.userData.displayGroup;
                if (dg && (Math.abs(ax) > DEAD || Math.abs(az) > DEAD)) {
                    arLabR.userData.setDragging(true);
                    dg.rotation.y += ax * 0.04;
                    dg.rotation.x = Math.max(-0.8, Math.min(0.8, dg.rotation.x - az * 0.03));
                    setTimeout(() => arLabR.userData.setDragging(false), 200);
                }
            } else {
                const SPEED = 0.04;
                if (Math.abs(ax) > DEAD || Math.abs(az) > DEAD) {
                    const forward = new THREE.Vector3();
                    camera.getWorldDirection(forward);
                    forward.y = 0;
                    forward.normalize();
                    const right = new THREE.Vector3();
                    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
                    playerRig.position.addScaledVector(right, ax * SPEED);
                    playerRig.position.addScaledVector(forward, -az * SPEED);
                }
            }
        }
    }
}

// ======================
// ANIMATION LOOP
// ======================
renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    const t     = performance.now() * 0.001;

    checkVRButtons();
    checkPortalProximity();

    // VR самбар зурах — trigger барьж байх үед тасралтгүй зурна
    if (renderer.xr.isPresenting && currentRoom === 1) {
        if (isVRDrawing0) lastVRUV0 = doVRBoardDraw(controller0, lastVRUV0);
        if (isVRDrawing1) lastVRUV1 = doVRBoardDraw(controller1, lastVRUV1);
    }

    allPortals.forEach(p => p.userData.update?.(t));

    lobby.userData.update?.(camera);
    if (currentRoom === 1) lectureR.userData.update?.(camera);
    if (currentRoom === 2) netLabR.userData.update?.(delta, camera);
    if (currentRoom === 3) arLabR.userData.update?.(camera);
    if (currentRoom === 4) compLabR.userData.update?.(camera);
    if (currentRoom === 5) libraryR.userData.update?.(camera);
    if (currentRoom === 6) serverR.userData.update?.(delta);

    if (!renderer.xr.isPresenting) controls.update();
    renderer.render(scene, camera);
});
