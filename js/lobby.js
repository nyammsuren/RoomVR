import * as THREE from "three";

export function createLobby(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 12, RH = 5, RD = 12;

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

    // УГТАХ БИЧИГ — урд ханан дээр хаалгуудын дээр
    const welcomeCvs = document.createElement("canvas");
    welcomeCvs.width = 1024; welcomeCvs.height = 180;
    const wctx = welcomeCvs.getContext("2d");
    wctx.clearRect(0, 0, 1024, 180);
    wctx.fillStyle = "#1a3a6e";
    wctx.font = "bold 72px Arial";
    wctx.textAlign = "center";
    wctx.textBaseline = "middle";
    wctx.fillText("МУБИС, МБУС", 512, 60);
    wctx.fillStyle = "#555555";
    wctx.font = "bold 46px Arial";
    wctx.fillText("Мэдээлэл зүйн тэнхим", 512, 135);
    const welcomeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 0.9),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(welcomeCvs), transparent: true })
    );
    welcomeMesh.position.set(0, 4.2, -RD / 2 + 0.04);
    room.add(welcomeMesh);

    // 4 ХААЛГА
    const doorDefs = [
        { kind: "toLecture",  color: 0x2266dd, hex: "#2266dd", x: -3,          z: -RD / 2 + 0.12, ry: 0,           label: "Лекцийн танхим" },
        { kind: "toNetLab",   color: 0x229944, hex: "#229944", x:  3,          z: -RD / 2 + 0.12, ry: 0,           label: "Сүлжээний лаборатори" },
        { kind: "toARLab",    color: 0xbb33aa, hex: "#bb33aa", x: -RW / 2 + 0.12, z: -2,          ry: Math.PI / 2, label: "AR лаборатори" },
        { kind: "toCompLab",  color: 0xff6600, hex: "#ff6600", x:  RW / 2 - 0.12, z: -2,          ry:-Math.PI / 2, label: "Компьютерийн лаборатори" },
    ];

    const glowLights = [];

    doorDefs.forEach(({ kind, color, hex, x, z, ry, label }) => {
        // Хаалганы хүрээ
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.12, 2.12, 0.06),
            mat(0x888888, 0.3, 0.6)
        );
        frame.position.set(x, 1.06, z);
        frame.rotation.y = ry;
        room.add(frame);

        // Хаалга
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 0.15),
            new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.82, emissive: color, emissiveIntensity: 0.2 })
        );
        door.position.set(x, 1, z);
        door.rotation.y = ry;
        door.userData = { kind };
        room.add(door);

        // Шошго
        const cvs = document.createElement("canvas");
        cvs.width = 1024; cvs.height = 128;
        const ctx = cvs.getContext("2d");
        ctx.clearRect(0, 0, 1024, 128);
        ctx.fillStyle = hex;
        ctx.font = "bold 56px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 512, 64);
        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 0.3),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true, depthTest: false })
        );
        if (ry === 0) {
            lbl.position.set(x, 2.45, z + 0.1);
        } else if (ry > 0) {
            lbl.position.set(x + 0.1, 2.45, z);
            lbl.rotation.y = Math.PI / 2;
        } else {
            lbl.position.set(x - 0.1, 2.45, z);
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

    room.userData.update = () => {
        const t = performance.now() * 0.001;
        glowLights.forEach(({ light, base }, i) => {
            light.intensity = base + Math.sin(t * 1.2 + i * 0.7) * 0.2;
        });
    };

    return room;
}
