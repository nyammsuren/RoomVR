import * as THREE from "three";

export function createRoom4(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 10, RH = 5, RD = 10;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    room.add(new THREE.AmbientLight(0x8833aa, 0.4));
    room.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(4, 10, 6);
    dir.castShadow = true;
    room.add(dir);

    // ШАЛ
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x0f0f1e, 0.8));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { teleport: true };
    room.add(floor);

    // Шалны торон гэрэлт шугам
    for (let i = -4; i <= 4; i++) {
        const hm = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.03),
            new THREE.MeshStandardMaterial({ color: 0x9933ff, emissive: 0x9933ff, emissiveIntensity: 0.8 }));
        hm.rotation.x = -Math.PI / 2;
        hm.position.set(0, 0.001, i);
        room.add(hm);
        const vm = new THREE.Mesh(new THREE.PlaneGeometry(0.03, RD),
            new THREE.MeshStandardMaterial({ color: 0x9933ff, emissive: 0x9933ff, emissiveIntensity: 0.8 }));
        vm.rotation.x = -Math.PI / 2;
        vm.position.set(i, 0.001, 0);
        room.add(vm);
    }

    // ХАНУУД
    const wallMat = mat(0x14142a, 0.9);
    [
        [RW, RH, [0, RH / 2, -RD / 2], 0],
        [RW, RH, [0, RH / 2,  RD / 2], Math.PI],
        [RD, RH, [-RW / 2, RH / 2, 0],  Math.PI / 2],
        [RD, RH, [ RW / 2, RH / 2, 0], -Math.PI / 2],
    ].forEach(([w, h, pos, ry]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat.clone());
        m.position.set(...pos); m.rotation.y = ry;
        room.add(m);
    });

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x0a0a18, 0.9));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, RH, 0);
    room.add(ceil);

    // ГАРЧИГ
    const titleCvs = document.createElement("canvas");
    titleCvs.width = 768; titleCvs.height = 128;
    const tctx = titleCvs.getContext("2d");
    tctx.clearRect(0, 0, 768, 128);
    tctx.fillStyle = "#cc44ff";
    tctx.font = "bold 64px Arial";
    tctx.textAlign = "center";
    tctx.textBaseline = "middle";
    tctx.fillText("AR лаборатори", 384, 64);
    const titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 0.58),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(titleCvs), transparent: true })
    );
    titleMesh.position.set(0, 4.3, -RD / 2 + 0.05);
    room.add(titleMesh);

    // Хананд AR маркер (зогсолтын цэгүүд)
    [
        { x: -3, z: -RD / 2 + 0.05, ry: 0 },
        { x:  3, z: -RD / 2 + 0.05, ry: 0 },
        { x: -RW / 2 + 0.05, z: 0, ry: Math.PI / 2 },
        { x:  RW / 2 - 0.05, z: 0, ry: -Math.PI / 2 },
    ].forEach(({ x, z, ry }) => {
        const marker = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })
        );
        marker.position.set(x, 2.0, z);
        marker.rotation.y = ry;
        room.add(marker);
        // Маркерын хүрээ
        const border = new THREE.Mesh(
            new THREE.PlaneGeometry(0.9, 0.9),
            new THREE.MeshBasicMaterial({ color: 0xcc44ff, wireframe: false })
        );
        border.position.set(x, 2.0, z + (ry === 0 ? -0.005 : 0));
        border.rotation.y = ry;
        // Just add white lines as border
        const bLight = new THREE.PointLight(0xcc44ff, 1.0, 2.5);
        bLight.position.set(x, 2.0, z + (ry === 0 ? 0.3 : 0) + (ry > 0 ? 0.3 : 0) - (ry < 0 ? 0.3 : 0));
        room.add(bLight);
    });

    // Таазны гэрэл
    [[-2, 0], [2, 0], [0, -2], [0, 2]].forEach(([x, z]) => {
        const l = new THREE.PointLight(0xaa44ff, 2.0, 6);
        l.position.set(x, RH - 0.3, z);
        room.add(l);
    });

    // БУЦАХ ХААЛГА → Угтах танхим
    const backDoor = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xbb33aa, transparent: true, opacity: 0.85 })
    );
    backDoor.position.set(0, 1, RD / 2 - 0.15);
    backDoor.userData = { kind: "backDoor" };
    room.add(backDoor);

    const lblCvs = document.createElement("canvas");
    lblCvs.width = 512; lblCvs.height = 80;
    const lctx = lblCvs.getContext("2d");
    lctx.clearRect(0, 0, 512, 80);
    lctx.fillStyle = "#ffffff";
    lctx.font = "bold 40px Arial";
    lctx.textAlign = "center";
    lctx.textBaseline = "middle";
    lctx.fillText("← Угтах танхим", 256, 40);
    const lblMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.28),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lblCvs), transparent: true, depthTest: false })
    );
    lblMesh.position.set(0, 2.4, RD / 2 - 0.05);
    lblMesh.rotation.y = Math.PI;
    room.add(lblMesh);

    room.userData.update = () => {
        const t = performance.now() * 0.001;
        backDoor.material.opacity = 0.65 + 0.2 * Math.sin(t * 1.8);
    };

    return room;
}
