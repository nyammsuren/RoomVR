import * as THREE from "three";
import { TextureLoader } from "three";

export function createLobby(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 12, RH = 7, RD = 12;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    room.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(4, 10, 6);
    dir.castShadow = true;
    room.add(dir);

    // ШАЛ — цагаан гантиг маягтай
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0xeeeae2, 0.2, 0.08));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { teleport: true };
    room.add(floor);

    // Шалны тор
    for (let i = -5; i <= 5; i++) {
        const hLine = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.02), mat(0xcccccc, 0.5));
        hLine.rotation.x = -Math.PI / 2;
        hLine.position.set(0, 0.001, i);
        room.add(hLine);
        const vLine = new THREE.Mesh(new THREE.PlaneGeometry(0.02, RD), mat(0xcccccc, 0.5));
        vLine.rotation.x = -Math.PI / 2;
        vLine.position.set(i, 0.001, 0);
        room.add(vLine);
    }

    // ХАНУУД
    const wallMat = mat(0xf5f0ea, 0.9);
    [
        [RW, RH, [0, RH / 2, -RD / 2], 0],
        [RW, RH, [0, RH / 2,  RD / 2], Math.PI],
        [RD, RH, [-RW / 2, RH / 2, 0],  Math.PI / 2],
        [RD, RH, [ RW / 2, RH / 2, 0], -Math.PI / 2],
    ].forEach(([w, h, pos, ry]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat.clone());
        m.position.set(...pos);
        m.rotation.y = ry;
        room.add(m);
    });

    // ТААЗ
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0xffffff, 0.9));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, RH, 0);
    room.add(ceil);

    // УГТАХ БИЧИГ — урд ханан дээр, цагнаас дээш
    const welcomeCvs = document.createElement("canvas");
    welcomeCvs.width = 1024; welcomeCvs.height = 260;
    const wctx = welcomeCvs.getContext("2d");
    wctx.clearRect(0, 0, 1024, 260);
    wctx.textAlign = "center";
    wctx.textBaseline = "middle";

    // Том үсгээр — 2 мөрт их сургуулийн нэр
    wctx.fillStyle = "#0d2d5e";
    wctx.font = "bold 52px Arial";
    wctx.fillText("МОНГОЛ УЛСЫН БОЛОВСРОЛЫН", 512, 60);
    wctx.fillText("ИХ СУРГУУЛЬ", 512, 120);

    // Хэвтээ зураас
    wctx.strokeStyle = "#2266bb";
    wctx.lineWidth = 2;
    wctx.beginPath();
    wctx.moveTo(80, 158); wctx.lineTo(944, 158);
    wctx.stroke();

    // Жижиг үсгээр — тэнхимийн нэр
    wctx.fillStyle = "#445577";
    wctx.font = "bold 40px Arial";
    wctx.fillText("МБУС  •  Мэдээлэл зүйн тэнхим", 512, 205);

    const welcomeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(6.2, 1.6),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(welcomeCvs), transparent: true })
    );
    // Цагнаас (y=4.8) дээш байрлуул
    welcomeMesh.position.set(0, RH - 1.2, -RD / 2 + 0.04);
    room.add(welcomeMesh);

    // 5 ХААЛГА
    const doorDefs = [
        { kind: "toLecture",  color: 0x2266dd, hex: "#2266dd", x: -3,             z: -RD / 2 + 0.12, ry: 0,            label: "Лекцийн танхим" },
        { kind: "toNetLab",   color: 0x229944, hex: "#229944", x:  3,             z: -RD / 2 + 0.12, ry: 0,            label: "Сүлжээний лаборатори" },
        { kind: "toARLab",    color: 0xbb33aa, hex: "#bb33aa", x: -RW / 2 + 0.12, z: -2,            ry: Math.PI / 2,  label: "AR лаборатори" },
        { kind: "toCompLab",  color: 0xff6600, hex: "#ff6600", x:  RW / 2 - 0.12, z: -2,            ry:-Math.PI / 2,  label: "Компьютерийн лаборатори" },
        { kind: "toLibrary",  color: 0xddaa00, hex: "#ddaa00", x:  RW / 2 - 0.12, z:  2,            ry:-Math.PI / 2,  label: "Номын сан" },
        { kind: "toServer",   color: 0x00ccff, hex: "#00ccff", x: -RW / 2 + 0.12, z:  2,            ry: Math.PI / 2,  label: "Серверийн өрөө" },
    ];

    const glowLights = [];

    doorDefs.forEach(({ kind, color, hex, x, z, ry, label }) => {
        // Хаалганы хүрээ
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.62, 2.62, 0.06),
            new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7, emissive: color, emissiveIntensity: 0.15 })
        );
        frame.position.set(x, 1.31, z);
        frame.rotation.y = ry;
        room.add(frame);

        // Хаалга
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.5, 0.15),
            new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.82, emissive: color, emissiveIntensity: 0.2 })
        );
        door.position.set(x, 1.25, z);
        door.rotation.y = ry;
        door.userData = { kind };
        room.add(door);

        // Шошго
        const cvs = document.createElement("canvas");
        cvs.width = 1024; cvs.height = 160;
        const ctx = cvs.getContext("2d");
        ctx.clearRect(0, 0, 1024, 160);
        ctx.fillStyle = hex;
        ctx.font = "bold 72px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 512, 80);
        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(3.0, 0.47),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true, depthTest: false })
        );
        if (ry === 0) {
            lbl.position.set(x, 3.2, z + 0.1);
        } else if (ry > 0) {
            lbl.position.set(x + 0.1, 3.2, z);
            lbl.rotation.y = Math.PI / 2;
        } else {
            lbl.position.set(x - 0.1, 3.2, z);
            lbl.rotation.y = -Math.PI / 2;
        }
        room.add(lbl);

        // Хаалганы гэрэл
        const light = new THREE.PointLight(color, 1.8, 4);
        const lx = ry === 0 ? x : (ry > 0 ? x + 0.6 : x - 0.6);
        const lz = ry === 0 ? z + 0.6 : z;
        light.position.set(lx, 1.8, lz);
        room.add(light);
        glowLights.push({ light, base: 1.6 });
    });

    // ТААЗНЫ ГЭРЭЛ
    [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([x, z]) => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.06, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xfffde7, emissive: 0xfffde7, emissiveIntensity: 2.5 })
        );
        panel.position.set(x, RH - 0.03, z);
        room.add(panel);
        const wire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.007, 0.007, 0.2, 6),
            mat(0x333333, 0.5)
        );
        wire.position.set(x, RH - 0.13, z);
        room.add(wire);
        const l = new THREE.PointLight(0xfffde7, 2.2, 9);
        l.position.set(x, RH - 0.2, z);
        l.castShadow = true;
        room.add(l);
        glowLights.push({ light: l, base: 2.0 });
    });
    // УГТАХ ЗУРАГ — арын ханан дүүрэн
    new TextureLoader().load("./assets/ugtah.png", (tex) => {
        const imgMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(RW, RH),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        imgMesh.position.set(0, RH / 2, RD / 2 - 0.04);
        imgMesh.rotation.y = Math.PI;
        room.add(imgMesh);
    });

    // ======================
    // МУБСИ БААВГАЙ — billboard (камерт үргэлж харна)
    // ======================
    let bearGroup = null;

    new TextureLoader().load("./assets/model4.png", (tex) => {
        const aspect = tex.image.width / tex.image.height;
        const h = 2.2;
        const w = h * aspect;

        bearGroup = new THREE.Group();
        bearGroup.position.set(0, h / 2, -3.5);
        room.add(bearGroup);

        // Баавгайн зураг
        const bearMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 })
        );
        bearMesh.userData = { kind: "welcomeAudio" };
        bearGroup.add(bearMesh);


        // Сүүдэр — шалан дээр
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(w * 0.35, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, 0.01, -3.5);
        room.add(shadow);

        // Баавгайн орчны гэрэл
        const bearLight = new THREE.PointLight(0xfff5e0, 1.2, 4);
        bearLight.position.set(0, h, -2.8);
        room.add(bearLight);
    });

    // УГТАХ ДУУ
    const welcomeAudio = new Audio("./assets/welcome.m4a");
    welcomeAudio.loop = false;
    room.userData.toggleWelcome = () => {
        if (welcomeAudio.paused) {
            welcomeAudio.currentTime = 0;
            welcomeAudio.play();
        } else {
            welcomeAudio.pause();
        }
    };

    // ЦАГ — урд хана, МУБИС бичгийн доор (дугуй цаг)
    const clockCvs = document.createElement("canvas");
    clockCvs.width = 256; clockCvs.height = 256;
    const clockCtx = clockCvs.getContext("2d");
    const clockTex = new THREE.CanvasTexture(clockCvs);
    let lastClockSec = -1;

    function drawClock() {
        const now = new Date();
        const h = now.getHours() % 12;
        const m = now.getMinutes();
        const s = now.getSeconds();
        const cx = 128, cy = 128, R = 112;

        clockCtx.clearRect(0, 0, 256, 256);

        // Цагны нүүр — gradient цэнхэр
        const grad = clockCtx.createRadialGradient(cx, cy, 0, cx, cy, R);
        grad.addColorStop(0,   "#0a1a3a");
        grad.addColorStop(0.7, "#061228");
        grad.addColorStop(1,   "#030b18");
        clockCtx.fillStyle = grad;
        clockCtx.beginPath();
        clockCtx.arc(cx, cy, R, 0, Math.PI * 2);
        clockCtx.fill();

        // Гадна гэрэлтсэн цагаан хүрээ
        clockCtx.strokeStyle = "#a0d4ff";
        clockCtx.lineWidth = 5;
        clockCtx.shadowColor = "#60b8ff";
        clockCtx.shadowBlur = 12;
        clockCtx.beginPath();
        clockCtx.arc(cx, cy, R, 0, Math.PI * 2);
        clockCtx.stroke();
        clockCtx.shadowBlur = 0;

        // Тэмдэглэгээ (12 цэг)
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const big = i % 3 === 0;
            clockCtx.strokeStyle = big ? "#e8f4ff" : "#6090bb";
            clockCtx.lineWidth = big ? 4 : 1.5;
            const r0 = R - (big ? 24 : 14);
            clockCtx.beginPath();
            clockCtx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
            clockCtx.lineTo(cx + Math.cos(a) * (R - 7), cy + Math.sin(a) * (R - 7));
            clockCtx.stroke();
        }

        // Минутын гар — цагаан
        const mAngle = ((m + s / 60) / 60) * Math.PI * 2 - Math.PI / 2;
        clockCtx.strokeStyle = "#e8f4ff";
        clockCtx.lineWidth = 4;
        clockCtx.lineCap = "round";
        clockCtx.shadowColor = "#ffffff";
        clockCtx.shadowBlur = 6;
        clockCtx.beginPath();
        clockCtx.moveTo(cx, cy);
        clockCtx.lineTo(cx + Math.cos(mAngle) * 86, cy + Math.sin(mAngle) * 86);
        clockCtx.stroke();

        // Цагны гар — цагаан, зузаан
        const hAngle = ((h + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
        clockCtx.strokeStyle = "#e8f4ff";
        clockCtx.lineWidth = 8;
        clockCtx.beginPath();
        clockCtx.moveTo(cx, cy);
        clockCtx.lineTo(cx + Math.cos(hAngle) * 60, cy + Math.sin(hAngle) * 60);
        clockCtx.stroke();
        clockCtx.shadowBlur = 0;

        // Секундын гар — улаан, нимгэн
        const sAngle = (s / 60) * Math.PI * 2 - Math.PI / 2;
        clockCtx.strokeStyle = "#ff4444";
        clockCtx.lineWidth = 2;
        clockCtx.shadowColor = "#ff2222";
        clockCtx.shadowBlur = 8;
        clockCtx.beginPath();
        clockCtx.moveTo(cx - Math.cos(sAngle) * 24, cy - Math.sin(sAngle) * 24);
        clockCtx.lineTo(cx + Math.cos(sAngle) * 96, cy + Math.sin(sAngle) * 96);
        clockCtx.stroke();
        clockCtx.shadowBlur = 0;

        // Төв цэг
        clockCtx.fillStyle = "#a0d4ff";
        clockCtx.beginPath();
        clockCtx.arc(cx, cy, 7, 0, Math.PI * 2);
        clockCtx.fill();
        clockCtx.fillStyle = "#ff4444";
        clockCtx.beginPath();
        clockCtx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        clockCtx.fill();

        clockTex.needsUpdate = true;
    }
    drawClock();

    const clockMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.4),
        new THREE.MeshBasicMaterial({ map: clockTex, transparent: true })
    );
    // МУБИС бичгийн доор, урд хана дээр
    clockMesh.position.set(0, RH - 2.8, -RD / 2 + 0.06);
    room.add(clockMesh);

    // VR-аас гарах товч арилгасан — серверийн өрөөний portal-тай давхардаж байсан

    room.userData.update = (camera) => {
        const t = performance.now() * 0.001;
        const sec = Math.floor(t);
        if (sec !== lastClockSec) { lastClockSec = sec; drawClock(); }
        glowLights.forEach(({ light, base }, i) => {
            light.intensity = base + Math.sin(t * 1.2 + i * 0.7) * 0.2;
        });
        if (bearGroup && camera) {
            bearGroup.rotation.y = Math.atan2(
                camera.position.x - bearGroup.position.x,
                camera.position.z - bearGroup.position.z
            );
        }
    };

    return room;
}
