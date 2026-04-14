import * as THREE from "three";

export function createRoom2(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    room.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(4, 10, 6);
    dirLight.castShadow = false; // performance
    room.add(dirLight);

    const RW = 10, RH = 5, RD = 10;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: rough,
            metalness: metal
        });
    }


    // ======================
    // ШАЛ
    // ======================
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(RW, RD),
        mat(0x8b7355, 0.9)
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { teleport: true };
    room.add(floor);

    for (let i = -4; i <= 4; i++) {
        let g = new THREE.Mesh(
            new THREE.PlaneGeometry(0.02, RD),
            new THREE.MeshStandardMaterial({ color: 0x6b5535 })
        );
        g.rotation.x = -Math.PI / 2;
        g.position.set(i, 0.001, 0);
        room.add(g);

        g = new THREE.Mesh(
            new THREE.PlaneGeometry(RW, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x6b5535 })
        );
        g.rotation.x = -Math.PI / 2;
        g.position.set(0, 0.001, i);
        room.add(g);
    }

    // ======================
    // ХАНУУД
    // ======================
    const wallMat = mat(0xd4c9b0, 0.9);

    function addWall(w, h, pos, ry = 0) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat.clone());
        m.position.set(...pos);
        m.rotation.y = ry;
        m.receiveShadow = true;
        room.add(m);
    }

    addWall(RW, RH, [0, RH / 2, -RD / 2]);
    addWall(RW, RH, [0, RH / 2, RD / 2], Math.PI);
    addWall(RD, RH, [-RW / 2, RH / 2, 0], Math.PI / 2);
    addWall(RD, RH, [RW / 2, RH / 2, 0], -Math.PI / 2);

    const ceil = new THREE.Mesh(
        new THREE.PlaneGeometry(RW, RD),
        mat(0xf0ece0, 0.9)
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, RH, 0);
    room.add(ceil);

    // ======================
    // НОГООН САМБАР — зүүн хана
    // ======================
    const boardCvs = document.createElement("canvas");
    boardCvs.width = 1024;
    boardCvs.height = 640;
    const bc = boardCvs.getContext("2d");

    bc.fillStyle = "#1b5c1b";
    bc.fillRect(0, 0, 1024, 640);

    const chalk = "rgba(240,240,220,0.90)";
    const chalkDim = "rgba(200,200,180,0.70)";

    bc.fillStyle = chalk;
    bc.font = "bold 38px Arial";
    bc.textAlign = "center";
    bc.textBaseline = "middle";
    bc.fillText("Сүлжээний топологи", 512, 38);

    bc.strokeStyle = chalkDim;
    bc.lineWidth = 2;
    bc.beginPath();
    bc.moveTo(60, 62);
    bc.lineTo(964, 62);
    bc.stroke();

    bc.fillStyle = chalk;
    bc.font = "bold 26px Arial";
    bc.textAlign = "center";
    bc.fillText("Star Topology", 256, 92);

    const cx = 256, cy = 330;
    const starNodes = [
        { x: cx, y: 220, label: "Router", shape: "diamond" },
        { x: cx, y: cy, label: "Switch", shape: "rect" },
        { x: cx - 160, y: cy + 120, label: "PC1", shape: "pc" },
        { x: cx - 55, y: cy + 130, label: "PC2", shape: "pc" },
        { x: cx + 55, y: cy + 130, label: "PC3", shape: "pc" },
        { x: cx + 160, y: cy + 120, label: "PC4", shape: "pc" },
    ];

    bc.strokeStyle = chalk;
    bc.lineWidth = 2.5;
    starNodes.slice(2).forEach(n => {
        bc.beginPath();
        bc.moveTo(starNodes[1].x, starNodes[1].y);
        bc.lineTo(n.x, n.y);
        bc.stroke();
    });

    bc.beginPath();
    bc.moveTo(starNodes[0].x, starNodes[0].y + 18);
    bc.lineTo(starNodes[1].x, starNodes[1].y - 18);
    bc.stroke();

    function chalkNode(x, y, label, shape) {
        bc.strokeStyle = chalk;
        bc.fillStyle = "rgba(255,255,220,0.15)";
        bc.lineWidth = 2.5;
        bc.font = "bold 14px Arial";
        bc.textAlign = "center";
        bc.textBaseline = "middle";

        if (shape === "diamond") {
            const s = 20;
            bc.beginPath();
            bc.moveTo(x, y - s);
            bc.lineTo(x + s, y);
            bc.lineTo(x, y + s);
            bc.lineTo(x - s, y);
            bc.closePath();
            bc.stroke();
            bc.fill();
            bc.fillStyle = chalk;
            bc.fillText("R", x, y);
        } else if (shape === "rect") {
            bc.beginPath();
            bc.roundRect(x - 32, y - 16, 64, 32, 4);
            bc.stroke();
            bc.fill();
            bc.fillStyle = chalk;
            bc.fillText("SW", x, y);
        } else {
            bc.strokeRect(x - 14, y - 11, 28, 19);
            bc.beginPath();
            bc.moveTo(x - 6, y + 8);
            bc.lineTo(x + 6, y + 8);
            bc.moveTo(x, y + 8);
            bc.lineTo(x, y + 13);
            bc.moveTo(x - 8, y + 13);
            bc.lineTo(x + 8, y + 13);
            bc.stroke();
        }
        bc.fillStyle = chalk;
        bc.font = "14px Arial";
        bc.fillText(label, x, y + (shape === "pc" ? 22 : 30));
    }

    starNodes.forEach(n => chalkNode(n.x, n.y, n.label, n.shape));

    bc.strokeStyle = chalkDim;
    bc.lineWidth = 1.5;
    bc.setLineDash([8, 6]);
    bc.beginPath();
    bc.moveTo(512, 70);
    bc.lineTo(512, 620);
    bc.stroke();
    bc.setLineDash([]);

    bc.fillStyle = chalk;
    bc.font = "bold 26px Arial";
    bc.textAlign = "center";
    bc.fillText("Bus Topology", 768, 92);

    const busY = 200;
    const busNodes = [580, 680, 780, 880, 980];
    bc.strokeStyle = chalk;
    bc.lineWidth = 3.5;
    bc.beginPath();
    bc.moveTo(560, busY);
    bc.lineTo(998, busY);
    bc.stroke();

    bc.lineWidth = 2;
    [560, 998].forEach(tx => {
        bc.beginPath();
        bc.arc(tx, busY, 7, 0, Math.PI * 2);
        bc.stroke();
        bc.fillStyle = "rgba(240,240,220,0.3)";
        bc.fill();
    });

    busNodes.forEach((bx, i) => {
        bc.strokeStyle = chalk;
        bc.lineWidth = 2;
        bc.beginPath();
        bc.moveTo(bx, busY);
        bc.lineTo(bx, busY + 35);
        bc.stroke();
        bc.strokeRect(bx - 13, busY + 35, 26, 18);
        bc.fillStyle = chalk;
        bc.font = "12px Arial";
        bc.textAlign = "center";
        bc.fillText(`PC${i}`, bx, busY + 67);
    });

    bc.fillStyle = chalk;
    bc.font = "bold 26px Arial";
    bc.textAlign = "center";
    bc.fillText("Ring Topology", 768, 340);

    const rcx = 768, rcy = 490, rr = 105;
    const ringCount = 6;
    const ringPts = Array.from({ length: ringCount }, (_, i) => {
        const a = (i / ringCount) * Math.PI * 2 - Math.PI / 2;
        return {
            x: rcx + Math.cos(a) * rr,
            y: rcy + Math.sin(a) * rr,
            label: `PC${i}`
        };
    });

    bc.strokeStyle = chalk;
    bc.lineWidth = 2.5;
    ringPts.forEach((p, i) => {
        const next = ringPts[(i + 1) % ringCount];
        bc.beginPath();
        bc.moveTo(p.x, p.y);
        bc.lineTo(next.x, next.y);
        bc.stroke();
    });

    ringPts.forEach(p => {
        bc.strokeStyle = chalk;
        bc.lineWidth = 2;
        bc.beginPath();
        bc.arc(p.x, p.y, 12, 0, Math.PI * 2);
        bc.stroke();
        bc.fillStyle = "rgba(240,240,220,0.15)";
        bc.fill();
        bc.fillStyle = chalk;
        bc.font = "11px Arial";
        bc.textAlign = "center";
        bc.textBaseline = "middle";
        bc.fillText(p.label, p.x, p.y);
    });

    bc.fillStyle = "rgba(255,255,180,0.65)";
    bc.font = "italic 17px Arial";
    bc.textAlign = "center";
    bc.textBaseline = "bottom";
    bc.fillText("Компьютерийн сүлжээ  —  Лекц 2", 512, 635);

    const boardFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 2.32, 3.62),
        mat(0x4a3010, 0.6)
    );
    boardFrame.position.set(-RW / 2 + 0.01, 2.2, -1.5);
    room.add(boardFrame);

    const boardTex = new THREE.CanvasTexture(boardCvs);
    const boardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.2),
        new THREE.MeshBasicMaterial({
            map: boardTex,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
        })
    );
    boardMesh.position.set(-RW / 2 + 0.05, 2.2, -1.5);
    boardMesh.rotation.y = Math.PI / 2;
    room.add(boardMesh);

    const chalTray = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.06, 3.5),
        mat(0x5a4020, 0.7)
    );
    chalTray.position.set(-RW / 2 + 0.1, 1.07, -1.5);
    room.add(chalTray);

    const chalkMat2 = new THREE.MeshStandardMaterial({ color: 0xeeeecc, roughness: 0.9 });
    [{ z: -1.8, rx: 0.15, len: 0.07 }, { z: -1.5, rx: -0.1, len: 0.055 }, { z: -1.2, rx: 0.2, len: 0.065 }]
        .forEach(({ z, rx, len }) => {
            const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 8), chalkMat2);
            ch.rotation.z = Math.PI / 2 + rx;
            ch.position.set(-RW / 2 + 0.1, 1.105, z);
            room.add(ch);
        });

    const boardLight = new THREE.PointLight(0xfff8e0, 0.6, 3);
    boardLight.position.set(-RW / 2 + 1.2, 2.5, -1.5);
    room.add(boardLight);

    // ======================
    // СУРАГЧИЙН ШИРЭЭ + САНДАЛ
    // ======================
    function addDesk(x, z) {
        const dm = mat(0x8B6914, 0.7);
        const lm = mat(0x333333, 0.5, 0.3);

        [[x, 0.75, z, 1, 0.05, 0.6],
         [x, 0.48, z + 0.55, 0.5, 0.04, 0.45],
         [x, 0.70, z + 0.77, 0.5, 0.40, 0.04]
        ].forEach(([px, py, pz, w, h, d], idx) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), dm);
            mesh.position.set(px, py, pz);
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            if (idx === 1) {
                mesh.userData = { kind: "studentChair",
                    sitX: px, sitY: 1.1, sitZ: pz + 0.2,
                    lookX: -5.5, lookY: 1.7, lookZ: -1.5 };
            }
            room.add(mesh);
        });

        [[0.43, 0.25], [0.43, -0.25], [-0.43, 0.25], [-0.43, -0.25]].forEach(([dx, dz]) => {
            const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.05), lm);
            l.position.set(x + dx, 0.36, z + dz);
            l.castShadow = false;
            room.add(l);
        });

        [[0.2, -0.2], [-0.2, -0.2]].forEach(([dx, dz]) => {
            const s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.04), lm);
            s.position.set(x + dx, 0.24, z + 0.55 + dz);
            room.add(s);
        });

        [[0.2, 0.2], [-0.2, 0.2]].forEach(([dx, dz]) => {
            const s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.90, 0.04), lm);
            s.position.set(x + dx, 0.45, z + 0.55 + dz);
            room.add(s);
        });
    }

    [[-2, 3], [-2, 1], [-2, -1],
     [0, 3], [0, 1], [0, -1],
     [2, 3], [2, 1], [2, -1]].forEach(([x, z]) => addDesk(x, z));

    // ======================
    // БАГШИЙН ШИРЭЭ
    // ======================
    const tDesk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.07, 0.8), mat(0x6B4C11, 0.6));
    tDesk.position.set(-3, 0.78, -3.5);
    tDesk.castShadow = false;
    tDesk.receiveShadow = true;
    tDesk.userData = { kind: "teacherDesk" };
    room.add(tDesk);

    const standCanvas = document.createElement("canvas");
    standCanvas.width = 192;
    standCanvas.height = 48;
    const sndCtx = standCanvas.getContext("2d");
    sndCtx.fillStyle = "rgba(0,0,0,0.55)";
    sndCtx.fillRect(0, 0, 192, 48);
    sndCtx.fillStyle = "#aaffaa";
    sndCtx.font = "bold 22px Arial";
    sndCtx.textAlign = "center";
    sndCtx.textBaseline = "middle";
    sndCtx.fillText("Босох", 96, 24);

    const standLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.12),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(standCanvas),
            transparent: true,
            depthTest: false,
            side: THREE.DoubleSide
        })
    );
    // Ширээний ар ирмэгт (багшийн тал) босоо байрлуулав — VR удирдлагаар дарагдана
    standLabel.position.set(-3, 0.87, -3.88);
    standLabel.rotation.y = Math.PI;
    standLabel.userData = { kind: "teacherDesk" };
    room.add(standLabel);

    [[0.8, 0.3], [-0.8, 0.3], [0.8, -0.3], [-0.8, -0.3]].forEach(([dx, dz]) => {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.07), mat(0x222222, 0.4, 0.4));
        l.position.set(-3 + dx, 0.39, -3.5 + dz);
        l.castShadow = false;
        room.add(l);
    });

    // ======================
    // БАГШИЙН САНДАЛ
    // ======================
    const chairG = new THREE.Group();
    const chM = mat(0x3a2210, 0.6);
    const chLM = mat(0x1a1a1a, 0.4, 0.3);

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.50), chM);
    chairSeat.position.set(0, 0.48, 0);
    chairSeat.castShadow = false;
    chairSeat.userData = { kind: "teacherChair" };
    chairG.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.50, 0.05), chM);
    chairBack.position.set(0, 0.75, -0.23);
    chairBack.castShadow = false;
    chairBack.userData = { kind: "teacherChair" };
    chairG.add(chairBack);

    [[0.22, 0.22], [0.22, -0.22], [-0.22, 0.22], [-0.22, -0.22]].forEach(([dx, dz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), chLM);
        leg.position.set(dx, 0.24, dz);
        leg.castShadow = false;
        chairG.add(leg);
    });

    [0.22, -0.22].forEach(dx => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, 0.04), chLM);
        p.position.set(dx, 0.74, -0.23);
        chairG.add(p);
    });

    chairG.position.set(-3, 0, -4.3);
    chairG.rotation.y = 0;
    chairG.userData = { kind: "teacherChair" };
    room.add(chairG);

    const sitCanvas = document.createElement("canvas");
    sitCanvas.width = 192;
    sitCanvas.height = 48;
    const sctx = sitCanvas.getContext("2d");
    sctx.fillStyle = "rgba(0,0,0,0.55)";
    sctx.fillRect(0, 0, 192, 48);
    sctx.fillStyle = "#ffdd44";
    sctx.font = "bold 22px Arial";
    sctx.textAlign = "center";
    sctx.textBaseline = "middle";
    sctx.fillText("Суух", 96, 24);

    const sitLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.12),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(sitCanvas),
            transparent: true,
            depthTest: false
        })
    );
    sitLabel.position.set(-3, 0.507, -4.3);
    sitLabel.rotation.x = -Math.PI / 2;
    room.add(sitLabel);

    // ======================
    // КОФЕНИЙ АЯГА
    // ======================
    const cupG = new THREE.Group();
    const cupMat = mat(0xf0ede8, 0.4, 0.1);

    const saucer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.050, 0.010, 16), cupMat
    );
    saucer.position.set(0, 0.005, 0);
    cupG.add(saucer);

    const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.028, 0.072, 16), cupMat
    );
    cup.position.set(0, 0.046, 0);
    cup.castShadow = false;
    cupG.add(cup);

    const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(0.033, 0.033, 0.004, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e0a00, roughness: 0.2 })
    );
    coffee.position.set(0, 0.080, 0);
    cupG.add(coffee);

    const steam = new THREE.Mesh(
        new THREE.TorusGeometry(0.012, 0.003, 6, 12),
        new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.4 })
    );
    steam.rotation.x = Math.PI / 2;
    steam.position.set(0, 0.108, 0);
    cupG.add(steam);

    const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.020, 0.005, 8, 16, Math.PI), cupMat
    );
    handle.rotation.z = -Math.PI / 2;
    handle.position.set(0.034, 0.046, 0);
    cupG.add(handle);

    cupG.position.set(-3 - 0.45, 0.815, -3.5);
    room.add(cupG);

    // ======================
    // NOTEBOOK
    // ======================
    const lapG = new THREE.Group();
    const lapMat = new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.25,
        metalness: 0.6
    });

    const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.018, 0.26), lapMat);
    lapBase.position.set(0, 0.009, 0);
    lapBase.castShadow = false;
    lapG.add(lapBase);

    const kbArea = new THREE.Mesh(
        new THREE.BoxGeometry(0.30, 0.002, 0.17),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
    );
    kbArea.position.set(0, 0.019, 0.02);
    lapG.add(kbArea);

    const tpad = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.002, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.4 })
    );
    tpad.position.set(0, 0.019, 0.09);
    lapG.add(tpad);

    const scrG = new THREE.Group();
    scrG.position.set(0, 0.018, -0.13);

    const scrFrame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.014), lapMat);
    scrFrame.position.set(0, 0.12, 0);
    scrFrame.castShadow = false;
    scrG.add(scrFrame);

    const scrCvs = document.createElement("canvas");
    scrCvs.width = 512;
    scrCvs.height = 320;
    const sc = scrCvs.getContext("2d");

    sc.fillStyle = "#0d1b3e";
    sc.fillRect(0, 0, 512, 320);

    sc.fillStyle = "#1a4080";
    sc.fillRect(0, 0, 512, 64);
    sc.fillStyle = "#ffffff";
    sc.font = "bold 26px Arial";
    sc.textAlign = "center";
    sc.fillText("Компьютерийн сүлжээ", 256, 28);
    sc.fillStyle = "#aad4ff";
    sc.font = "bold 19px Arial";
    sc.fillText("Хичээлийн лекц", 256, 54);

    sc.strokeStyle = "#3377cc";
    sc.lineWidth = 1.5;
    sc.beginPath();
    sc.moveTo(24, 70);
    sc.lineTo(488, 70);
    sc.stroke();

    const items = [
        "• Сүлжээний үндсэн ойлголтууд",
        "• OSI загвар — 7 давхарга",
        "• TCP / IP протокол",
        "• IP хаяглалт ба масклалт",
        "• Router & Switch тохиргоо",
    ];
    sc.fillStyle = "#ddeeff";
    sc.font = "17px Arial";
    sc.textAlign = "left";
    items.forEach((line, i) => sc.fillText(line, 28, 98 + i * 42));

    const scrMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32, 0.21),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(scrCvs) })
    );
    scrMesh.position.set(0, 0.12, 0.008);
    scrG.add(scrMesh);

    const scrLight = new THREE.PointLight(0x4488ff, 0.2, 0.8);
    scrLight.position.set(0, 0.18, 0.15);
    scrG.add(scrLight);

    scrG.rotation.x = -(5 * Math.PI / 180);
    lapG.add(scrG);

    lapG.position.set(-3.08, 0.815, -3.58);
    lapG.rotation.y = Math.PI;
    room.add(lapG);

    // ======================
    // TV
    // ======================
    const tvG = new THREE.Group();

    const tvFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 1.55, 0.1),
        mat(0x111111, 0.2, 0.7)
    );
    tvFrame.castShadow = false;
    tvFrame.userData = { kind: "tv" };
    tvG.add(tvFrame);

    const vid = document.createElement("video");
    vid.src = "js/view.mp4";
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = "auto";
    vid.style.display = "none";
    document.body.appendChild(vid);

    const videoTex = new THREE.VideoTexture(vid);
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;

    const tvScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.35),
        new THREE.MeshBasicMaterial({ map: videoTex })
    );
    tvScreen.position.z = 0.052;
    tvScreen.userData = { kind: "tv" };
    tvG.add(tvScreen);

    vid.pause();

    room.userData.toggleVideo = () => {
        if (vid.paused) {
            vid.muted = false;
            vid.play().catch(e => console.warn("Video play:", e));
        } else {
            vid.pause();
        }
    };

    const ledBar = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.04, 0.04),
        new THREE.MeshStandardMaterial({
            color: 0x1a88ff,
            emissive: 0x1a88ff,
            emissiveIntensity: 1.2
        })
    );
    ledBar.position.set(0, -0.76, 0.055);
    tvG.add(ledBar);


    tvG.position.set(0, 2.3, -RD / 2 + 0.03);
    room.add(tvG);

    // "Лекцийн танхим" — TV дээр
    const roomTitleCvs = document.createElement("canvas");
    roomTitleCvs.width = 1024;
    roomTitleCvs.height = 128;
    const rtctx = roomTitleCvs.getContext("2d");
    rtctx.clearRect(0, 0, 1024, 128);
    rtctx.fillStyle = "#2266dd";
    rtctx.font = "bold 72px Arial";
    rtctx.textAlign = "center";
    rtctx.textBaseline = "middle";
    rtctx.fillText("Лекцийн танхим", 512, 64);

    const roomTitleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 0.52),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(roomTitleCvs),
            transparent: true
        })
    );
    roomTitleMesh.position.set(0, 4.3, -RD / 2 + 0.05);
    room.add(roomTitleMesh);

    const tvLight = new THREE.PointLight(0x3366ff, 0.8, 4);
    tvLight.position.set(0, 2.3, -RD / 2 + 0.9);
    room.add(tvLight);

    // ======================
    // ПРОЕКТОР
    // ======================
    const projG = new THREE.Group();

    const projWire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6),
        mat(0x222222, 0.5)
    );
    projWire.position.set(0, 0.22, 0);
    projG.add(projWire);

    const projBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.14, 0.30),
        mat(0x2a2a2a, 0.3, 0.5)
    );
    projBody.castShadow = false;
    projG.add(projBody);

    const projLens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.07, 16),
        mat(0x111133, 0.1, 0.8)
    );
    projLens.rotation.x = Math.PI / 2;
    projLens.position.set(0, 0, -0.18);
    projG.add(projLens);

    const projGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.044, 16),
        new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            emissive: 0x4488ff,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.75
        })
    );
    projGlass.rotation.x = Math.PI / 2;
    projGlass.position.set(0, 0, -0.22);
    projG.add(projGlass);

    [-1, 1].forEach(side => {
        const vent = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.06, 0.14),
            mat(0x1a1a1a, 0.6)
        );
        vent.position.set(side * 0.18, 0.02, 0.02);
        projG.add(vent);
    });

    projG.position.set(0, RH - 0.48, 1.0);
    room.add(projG);

    const projSpot = new THREE.SpotLight(0xfff8e0, 1.2, 10, Math.PI / 9, 0.35, 1.2);
    projSpot.position.set(0, RH - 0.48, 1.0);
    projSpot.target.position.set(0, 2.3, -RD / 2);
    room.add(projSpot);
    room.add(projSpot.target);

    // ======================
    // ТААЗНЫ ГЭРЭЛ
    // ======================
    function addCeilingLight(x, z) {
        const g = new THREE.Group();

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.08, 0.6),
            mat(0xeeeeee, 0.4)
        );
        box.castShadow = false;
        g.add(box);

        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.02, 0.52),
            new THREE.MeshStandardMaterial({
                color: 0xfffde7,
                emissive: 0xfffde7,
                emissiveIntensity: 2
            })
        );
        panel.position.y = -0.05;
        g.add(panel);

        const wire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.25, 6),
            mat(0x333333, 0.5)
        );
        wire.position.y = 0.165;
        g.add(wire);

        g.position.set(x, RH - 0.04, z);
        room.add(g);

        const l = new THREE.PointLight(0xfffde7, 1.6, 7);
        l.position.set(x, RH - 0.2, z);
        l.castShadow = false;
        room.add(l);

        return { light: l };
    }

    const cl1 = addCeilingLight(-2, -1);
    const cl2 = addCeilingLight(2, -1);

    // ======================
    // БУЦАХ ХААЛГА
    // ======================
    const doorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 2.62, 1.62),
        new THREE.MeshStandardMaterial({ color: 0x2266dd, roughness: 0.3, metalness: 0.7, emissive: 0x2266dd, emissiveIntensity: 0.15 })
    );
    doorFrame.position.set(RW / 2 - 0.06, 1.31, 0);
    room.add(doorFrame);

    const backDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.5, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0x2266dd,
            transparent: true,
            opacity: 0.82,
            emissive: 0x2266dd,
            emissiveIntensity: 0.2
        })
    );
    backDoor.position.set(RW / 2 - 0.1, 1.25, 0);
    backDoor.userData = { kind: "backDoor" };
    room.add(backDoor);

    const lblCvs = document.createElement("canvas");
    lblCvs.width = 512;
    lblCvs.height = 128;
    const lctx = lblCvs.getContext("2d");
    lctx.clearRect(0, 0, 512, 128);
    lctx.fillStyle = "#2266dd";
    lctx.font = "bold 68px Arial";
    lctx.textAlign = "center";
    lctx.textBaseline = "middle";
    lctx.fillText("← Угтах танхим", 256, 64);

    const lblMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 0.44),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(lblCvs),
            transparent: true,
            depthTest: false
        })
    );
    lblMesh.position.set(RW / 2 - 0.05, 3.2, 0);
    lblMesh.rotation.y = -Math.PI / 2;
    room.add(lblMesh);

    const doorLight = new THREE.PointLight(0x2266dd, 0.6, 3);
    doorLight.position.set(RW / 2 - 0.8, 1.8, 0);
    room.add(doorLight);

    // ======================
    // CLICK HANDLER
    // ======================
    room.userData.handleClick = (obj) => {
        let current = obj;

        while (current) {
            if (current.userData?.onClick) {
                current.userData.onClick();
                return true;
            }
            current = current.parent;
        }

        return false;
    };

    // ======================
    // ======================
    // МУБСИ БААВГАЙ — багшийн ширээний ард
    // ======================
    let bearGroup2 = null;
    new THREE.TextureLoader().load("./assets/model.png", (tex) => {
        const aspect = tex.image.width / tex.image.height;
        const h = 1.9;
        const w = h * aspect;

        bearGroup2 = new THREE.Group();
        // Ширээ x=-3, z=-3.5 → ард нь z=-4.15
        bearGroup2.position.set(-3, h / 2, -4.15);
        room.add(bearGroup2);

        const bearPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 })
        );
        bearPlane.userData = { kind: "roomAudio" };
        bearGroup2.add(bearPlane);

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(w * 0.3, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(-3, 0.01, -4.15);
        room.add(shadow);
    });

    // АУДИО
    const roomAudio2 = new Audio("./assets/room2.m4a");
    roomAudio2.loop = false;
    room.userData.toggleAudio = () => {
        if (roomAudio2.paused) { roomAudio2.currentTime = 0; roomAudio2.play(); }
        else { roomAudio2.pause(); }
    };

    // Самбарын зурах боломж — main.js-д ашиглана
    room.userData.boardMesh  = boardMesh;
    room.userData.boardCtx   = bc;
    room.userData.boardTex   = boardTex;
    room.userData.boardCvs   = boardCvs;
    room.userData.chalkColor = "#f0f0dc";
    room.userData.chalkSize  = 4;

    // ======================
    // ТЕСТ СИСТЕМ
    // ======================
    const QUIZ = [
        { q: "OSI загварын хэдэн давхарга байдаг вэ?",
          opts: ["A) 5", "B) 6", "C) 7", "D) 8"], ans: 2 },
        { q: "TCP протокол ямар онцлогтой вэ?",
          opts: ["A) Хурдан, баталгаагүй", "B) Найдвартай, дарааллалтай", "C) Broadcast дамжуулдаг", "D) Connectionless"], ans: 1 },
        { q: "Subnet mask 255.255.255.0 — хэдэн хост байх вэ?",
          opts: ["A) 254", "B) 256", "C) 128", "D) 512"], ans: 0 },
        { q: "DHCP юу хийдэг вэ?",
          opts: ["A) DNS орчуулдаг", "B) IP хаяг автоматаар олгодог", "C) Пакет шүүдэг", "D) Маршрут тохируулдаг"], ans: 1 },
        { q: "Default gateway гэж юу вэ?",
          opts: ["A) DNS сервер", "B) Нэрийн сервер", "C) Өөр сүлжээ рүү гарах рутер", "D) DHCP сервер"], ans: 2 },
        { q: "MAC хаяг хэдэн бит байдаг вэ?",
          opts: ["A) 32 бит", "B) 48 бит", "C) 64 бит", "D) 128 бит"], ans: 1 },
        { q: "HTTP ямар портыг ашигладаг вэ?",
          opts: ["A) 21", "B) 25", "C) 80", "D) 443"], ans: 2 },
        { q: "Switch ямар хаягаар дамжуулдаг вэ?",
          opts: ["A) IP хаяг", "B) MAC хаяг", "C) Port дугаар", "D) URL"], ans: 1 },
    ];

    const qCvs = document.createElement("canvas");
    qCvs.width = 1024; qCvs.height = 768;
    const qCtx = qCvs.getContext("2d");
    const qTex = new THREE.CanvasTexture(qCvs);

    const qPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.6),
        new THREE.MeshBasicMaterial({ map: qTex, transparent: true })
    );
    qPanel.position.set(0, 2.5, RD/2 - 0.08);
    qPanel.rotation.y = Math.PI;
    qPanel.visible = false;
    room.add(qPanel);

    let qIdx = 0, qScore = 0, qActive = false, qDone = false;

    function drawQuiz() {
        const W = 1024, H = 768;
        qCtx.fillStyle = "#0f172a";
        qCtx.beginPath();
        if (qCtx.roundRect) qCtx.roundRect(8,8,W-16,H-16,20); else qCtx.rect(8,8,W-16,H-16);
        qCtx.fill();
        qCtx.strokeStyle = "#3b82f6"; qCtx.lineWidth = 5; qCtx.stroke();

        if (qDone) {
            qCtx.fillStyle = "#ffffff"; qCtx.font = "bold 58px Arial"; qCtx.textAlign = "center";
            qCtx.fillText("Шалгалт дууслаа!", W/2, 200);
            const pct = Math.round(qScore/QUIZ.length*100);
            const col = pct>=80?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
            qCtx.fillStyle = col; qCtx.font = "bold 100px Arial";
            qCtx.fillText(`${qScore}/${QUIZ.length}`, W/2, 340);
            qCtx.fillStyle = "#94a3b8"; qCtx.font = "42px Arial";
            qCtx.fillText(`${pct}% — ${pct>=80?"Маш сайн!":pct>=50?"Дундаж":"Дахин үзнэ үү"}`, W/2, 430);
            qCtx.fillStyle = "#3b82f6"; qCtx.font = "bold 36px Arial";
            qCtx.fillText("[ Дахин эхлэх ]", W/2, 560);
            qTex.needsUpdate = true;
            return;
        }

        // Явц
        qCtx.fillStyle = "#334155"; qCtx.fillRect(40, 30, W-80, 18);
        qCtx.fillStyle = "#3b82f6"; qCtx.fillRect(40, 30, (W-80)*(qIdx/QUIZ.length), 18);
        qCtx.fillStyle = "#94a3b8"; qCtx.font = "24px Arial"; qCtx.textAlign = "right";
        qCtx.fillText(`${qIdx+1} / ${QUIZ.length}`, W-40, 24);

        // Асуулт
        const q = QUIZ[qIdx];
        qCtx.fillStyle = "#f1f5f9"; qCtx.font = "bold 36px Arial"; qCtx.textAlign = "center";
        const words = q.q.split(" "); let line="", lines=[];
        words.forEach(w => { const t=line+w+" "; if(qCtx.measureText(t).width>880){lines.push(line);line=w+" ";}else line=t;});
        lines.push(line);
        lines.forEach((l,i) => qCtx.fillText(l.trim(), W/2, 110+i*44));

        // Хариултууд
        q.opts.forEach((opt, i) => {
            const oy = 280 + i * 110;
            qCtx.fillStyle = "#1e3a5f";
            qCtx.beginPath();
            if(qCtx.roundRect) qCtx.roundRect(60,oy,W-120,88,12); else qCtx.rect(60,oy,W-120,88);
            qCtx.fill();
            qCtx.strokeStyle = "#3b82f6"; qCtx.lineWidth = 2; qCtx.stroke();
            qCtx.fillStyle = "#e2e8f0"; qCtx.font = "bold 34px Arial"; qCtx.textAlign = "center";
            qCtx.fillText(opt, W/2, oy+53);
        });
        qTex.needsUpdate = true;
    }

    // Товч сонгох (0-3 хариулт)
    room.userData.answerQuiz = (optIdx) => {
        if (!qActive || qDone) return;
        if (optIdx === QUIZ[qIdx].ans) qScore++;
        qIdx++;
        if (qIdx >= QUIZ.length) { qDone = true; drawQuiz(); return; }
        drawQuiz();
    };

    // Тест нэмэлт товч → арын хана дээр
    const qBtnCvs = document.createElement("canvas");
    qBtnCvs.width = 256; qBtnCvs.height = 96;
    const qbc = qBtnCvs.getContext("2d");
    qbc.fillStyle = "#1d4ed8"; qbc.beginPath();
    if(qbc.roundRect) qbc.roundRect(4,4,248,88,14); else qbc.rect(4,4,248,88);
    qbc.fill();
    qbc.strokeStyle = "#60a5fa"; qbc.lineWidth = 3; qbc.stroke();
    qbc.fillStyle = "#fff"; qbc.font = "bold 38px Arial"; qbc.textAlign = "center"; qbc.textBaseline = "middle";
    qbc.fillText("Шалгалт", 128, 48);
    const qBtn = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.45),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(qBtnCvs), transparent: true })
    );
    qBtn.position.set(0, 3.6, RD/2 - 0.06);
    qBtn.rotation.y = Math.PI;
    qBtn.userData = { kind: "quizBtn" };
    room.add(qBtn);

    // Хариулт товчнуудын hit meshes (хяналтын тэгш өнцөгтүүд)
    const ansHitBoxes = [0,1,2,3].map(i => {
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(3.3, 0.7),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        m.position.set(0, 2.5 + 0.5 - i * 0.67, RD/2 - 0.07);
        m.rotation.y = Math.PI;
        m.userData = { kind: "quizAns", ansIdx: i };
        room.add(m);
        return m;
    });

    room.userData.onClick = (raycaster) => {
        const hits = raycaster.intersectObjects(room.children, true);
        for (const hit of hits) {
            let obj = hit.object;
            while (obj && !obj.userData?.kind) obj = obj.parent;
            if (!obj?.userData?.kind) continue;
            if (obj.userData.kind === "quizBtn") {
                if (!qActive) {
                    qActive = true; qIdx = 0; qScore = 0; qDone = false;
                    qPanel.visible = true;
                    ansHitBoxes.forEach(m => { m.visible = true; });
                    drawQuiz();
                } else {
                    qActive = false; qPanel.visible = false;
                    ansHitBoxes.forEach(m => { m.visible = false; });
                }
                return;
            }
            if (obj.userData.kind === "quizAns" && qActive) {
                if (qDone) {
                    qIdx = 0; qScore = 0; qDone = false; drawQuiz();
                } else {
                    room.userData.answerQuiz(obj.userData.ansIdx);
                }
                return;
            }
        }
    };
    ansHitBoxes.forEach(m => { m.visible = false; });

    // UPDATE LOOP
    // ======================
    room.userData.update = (camera) => {
        if (!vid.paused && !vid.ended) videoTex.needsUpdate = true;
        if (bearGroup2 && camera) {
            bearGroup2.rotation.y = Math.atan2(
                camera.position.x - bearGroup2.position.x,
                camera.position.z - bearGroup2.position.z
            );
        }
    };

    return room;
}