import * as THREE from "three";

export function createRoom5(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 10, RH = 5, RD = 10;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    room.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(4, 10, 6);
    dir.castShadow = true;
    room.add(dir);

    // ШАЛ
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x6e5a3a, 0.9));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { teleport: true };
    room.add(floor);

    for (let i = -4; i <= 4; i++) {
        const hm = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.02), mat(0x5a4830, 0.5));
        hm.rotation.x = -Math.PI / 2; hm.position.set(0, 0.001, i);
        room.add(hm);
        const vm = new THREE.Mesh(new THREE.PlaneGeometry(0.02, RD), mat(0x5a4830, 0.5));
        vm.rotation.x = -Math.PI / 2; vm.position.set(i, 0.001, 0);
        room.add(vm);
    }

    // ХАНУУД
    const wallMat = mat(0xd4c9b0, 0.9);
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

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0xf0ece0, 0.9));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, RH, 0);
    room.add(ceil);

    // ГАРЧИГ
    const titleCvs = document.createElement("canvas");
    titleCvs.width = 1024; titleCvs.height = 128;
    const tctx = titleCvs.getContext("2d");
    tctx.clearRect(0, 0, 1024, 128);
    tctx.fillStyle = "#ff6600";
    tctx.font = "bold 60px Arial";
    tctx.textAlign = "center";
    tctx.textBaseline = "middle";
    tctx.fillText("Компьютерийн лаборатори", 512, 64);
    const titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 0.6),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(titleCvs), transparent: true })
    );
    titleMesh.position.set(0, 4.3, -RD / 2 + 0.05);
    room.add(titleMesh);

    // КОМПЬЮТЕРИЙН ШИРЭЭНҮҮД
    // Сурагчийн дэлгэц — Cisco Packet Tracer цонх
    const stuScrCvs = document.createElement("canvas");
    stuScrCvs.width = 512; stuScrCvs.height = 320;
    const ssc = stuScrCvs.getContext("2d");

    // Цонхны дэвсгэр
    ssc.fillStyle = "#1c1c2e";
    ssc.fillRect(0, 0, 512, 320);

    // Title bar
    ssc.fillStyle = "#0d3166";
    ssc.fillRect(0, 0, 512, 26);
    ssc.fillStyle = "#ffffff";
    ssc.font = "bold 12px Arial";
    ssc.textAlign = "left";
    ssc.textBaseline = "middle";
    ssc.fillText("Cisco Packet Tracer", 8, 13);
    [["#ff5f57", 488], ["#febc2e", 470], ["#28c840", 452]].forEach(([c, cx]) => {
        ssc.fillStyle = c;
        ssc.beginPath(); ssc.arc(cx, 13, 5, 0, Math.PI * 2); ssc.fill();
    });

    // Menu bar
    ssc.fillStyle = "#2a2a3e";
    ssc.fillRect(0, 26, 512, 20);
    ssc.fillStyle = "#cccccc";
    ssc.font = "10px Arial";
    ["File", "Edit", "Options", "View", "Tools", "Extensions", "Help"].forEach((m, i) => {
        ssc.fillText(m, 7 + i * 58, 36);
    });

    // Toolbar
    ssc.fillStyle = "#222233";
    ssc.fillRect(0, 46, 512, 22);
    ["#3399ff","#66cc44","#ff9933","#cc44cc","#44cccc","#ff4444","#ffffff"].forEach((c, i) => {
        ssc.fillStyle = c;
        ssc.fillRect(5 + i * 24, 50, 16, 14);
    });

    // Workspace (цагаан талбай)
    ssc.fillStyle = "#f4f4f8";
    ssc.fillRect(0, 68, 330, 226);

    // Right panel
    ssc.fillStyle = "#e0e0ee";
    ssc.fillRect(330, 68, 182, 226);
    ssc.fillStyle = "#444466";
    ssc.font = "bold 10px Arial";
    ssc.textAlign = "left";
    ssc.fillText("Device Panel", 336, 82);
    ssc.fillStyle = "#666688";
    ssc.font = "9px Arial";
    ["Router","Switch","Hub","PC","Server","Cloud"].forEach((d, i) => {
        ssc.fillStyle = i % 2 === 0 ? "#d8d8ee" : "#e8e8f4";
        ssc.fillRect(332, 90 + i * 28, 176, 26);
        ssc.fillStyle = "#333355";
        ssc.fillText(d, 338, 103 + i * 28);
    });

    // Network topology дотор
    const n = {
        r:  [165, 120],
        s1: [95,  185],
        s2: [235, 185],
        p1: [52,  250],
        p2: [138, 250],
        p3: [192, 250],
        p4: [278, 250],
    };

    // Холболтын шугам
    ssc.strokeStyle = "#2244aa";
    ssc.lineWidth = 1.5;
    [[n.r,n.s1],[n.r,n.s2],[n.s1,n.p1],[n.s1,n.p2],[n.s2,n.p3],[n.s2,n.p4]].forEach(([a,b]) => {
        ssc.beginPath(); ssc.moveTo(...a); ssc.lineTo(...b); ssc.stroke();
    });

    // Router
    ssc.fillStyle = "#1a6ad4";
    ssc.beginPath(); ssc.arc(...n.r, 13, 0, Math.PI*2); ssc.fill();
    ssc.fillStyle = "#fff"; ssc.font = "bold 9px Arial"; ssc.textAlign = "center"; ssc.textBaseline = "middle";
    ssc.fillText("R", ...n.r);
    ssc.fillStyle = "#333"; ssc.font = "8px Arial"; ssc.textBaseline = "top";
    ssc.fillText("Router0", n.r[0], n.r[1]+15);

    // Switches
    [[n.s1,"Sw0"],[n.s2,"Sw1"]].forEach(([pos, lbl]) => {
        ssc.fillStyle = "#2aaa44";
        ssc.fillRect(pos[0]-13, pos[1]-9, 26, 18);
        ssc.fillStyle = "#fff"; ssc.font = "bold 8px Arial"; ssc.textBaseline = "middle";
        ssc.fillText("SW", pos[0], pos[1]);
        ssc.fillStyle = "#333"; ssc.font = "8px Arial"; ssc.textBaseline = "top";
        ssc.fillText(lbl, pos[0], pos[1]+10);
    });

    // PCs
    [[n.p1,"PC0"],[n.p2,"PC1"],[n.p3,"PC2"],[n.p4,"PC3"]].forEach(([pos, lbl]) => {
        ssc.fillStyle = "#556688";
        ssc.fillRect(pos[0]-10, pos[1]-8, 20, 13);
        ssc.fillStyle = "#88aaff";
        ssc.fillRect(pos[0]-8, pos[1]-6, 16, 9);
        ssc.fillStyle = "#333"; ssc.font = "8px Arial"; ssc.textBaseline = "top";
        ssc.fillText(lbl, pos[0], pos[1]+6);
    });

    // Status bar
    ssc.fillStyle = "#1a1a2e";
    ssc.fillRect(0, 294, 512, 26);
    ssc.fillStyle = "#44dd44"; ssc.font = "10px Arial"; ssc.textAlign = "left"; ssc.textBaseline = "middle";
    ssc.fillText("● Realtime Mode", 8, 307);
    ssc.fillStyle = "#aaaaaa";
    ssc.fillText("Time: 00:00:12   |   Devices: 7", 150, 307);

    const stuScrTex = new THREE.CanvasTexture(stuScrCvs);

    function addCompDesk(x, z) {
        const dm = mat(0x8B6914, 0.7);
        const pm = mat(0x111111, 0.2, 0.7);
        const lm = mat(0x222222, 0.5);

        // Ширээ
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.6), dm);
        desk.position.set(x, 0.77, z);
        desk.castShadow = desk.receiveShadow = true;
        room.add(desk);

        // Ширээний хөл
        [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]].forEach(([dx, dz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), lm);
            leg.position.set(x + dx, 0.375, z + dz);
            leg.castShadow = true;
            room.add(leg);
        });

        // Монитор хүрээ — сүлжээний лабтай адил том
        const mon = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.022), pm);
        mon.position.set(x, 1.145, z - 0.1);
        mon.castShadow = true;
        room.add(mon);

        // Дэлгэц — "Дадлага ажил"
        const scr = new THREE.Mesh(
            new THREE.PlaneGeometry(0.55, 0.36),
            new THREE.MeshBasicMaterial({ map: stuScrTex })
        );
        scr.position.set(x, 1.145, z - 0.088);
        room.add(scr);

        // Монитор зогдол
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.04), pm);
        stand.position.set(x, 0.865, z - 0.1);
        room.add(stand);

        // Монитор суурь
        const mbase = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.014, 0.12), pm);
        mbase.position.set(x, 0.802, z - 0.1);
        room.add(mbase);

        // Гар
        const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.01, 0.12), mat(0x2a2a2a, 0.5));
        kbd.position.set(x, 0.795, z + 0.1);
        room.add(kbd);

        // Хулгана
        const mouseBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, 0.022, 0.088),
            mat(0x1a1a1a, 0.3, 0.3)
        );
        mouseBody.position.set(x + 0.22, 0.796, z + 0.1);
        room.add(mouseBody);
        const mouseWheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.007, 0.007, 0.026, 8),
            mat(0x555555, 0.4)
        );
        mouseWheel.rotation.x = Math.PI / 2;
        mouseWheel.position.set(x + 0.22, 0.808, z + 0.085);
        room.add(mouseWheel);

        // Дэлгэцний гэрэл
        const l = new THREE.PointLight(0x2255ff, 0.3, 1.2);
        l.position.set(x, 1.25, z + 0.1);
        room.add(l);

        // СУРАГЧИЙН САНДАЛ
        const cg = new THREE.Group();
        const cM  = mat(0x2a2a2a, 0.6);
        const cLM = mat(0x111111, 0.4, 0.3);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.38), cM);
        seat.position.set(0, 0.44, 0);
        cg.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.04), cM);
        back.position.set(0, 0.66, -0.17);
        cg.add(back);

        // Ширээ рүү харсан хөл (богино — тавцанд хүрнэ)
        [[0.18,0.17],[-0.18,0.17]].forEach(([dx,dz]) => {
            const fl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.04), cLM);
            fl.position.set(dx, 0.22, dz);
            cg.add(fl);
        });
        // Нуруулга талын хөл (өндөр — ар нуруулгыг дэмжинэ)
        [[0.18,-0.17],[-0.18,-0.17]].forEach(([dx,dz]) => {
            const bl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.80, 0.04), cLM);
            bl.position.set(dx, 0.40, dz);
            cg.add(bl);
        });

        cg.position.set(x, 0, z + 0.42);
        cg.rotation.y = Math.PI;   // дэлгэц рүү харна
        room.add(cg);
    }

    [[-3, 1], [-3, -1], [-3, -3],
     [ 0, 1], [ 0, -1], [ 0, -3],
     [ 3, 1], [ 3, -1], [ 3, -3]].forEach(([x, z]) => addCompDesk(x, z));

    // ТААЗНЫ ГЭРЭЛ
    [[-2, -1], [2, -1], [-2, 2], [2, 2]].forEach(([x, z]) => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.06, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xfffde7, emissive: 0xfffde7, emissiveIntensity: 2.5 })
        );
        panel.position.set(x, RH - 0.03, z);
        room.add(panel);
        const l = new THREE.PointLight(0xfffde7, 2.2, 8);
        l.position.set(x, RH - 0.2, z);
        l.castShadow = true;
        room.add(l);
    });

    // ======================
    // НОГООН САМБАР — сүлжээний топологи
    // ======================
    const boardCvs = document.createElement("canvas");
    boardCvs.width = 1024; boardCvs.height = 620;
    const bc = boardCvs.getContext("2d");

    // Ногоон дэвсгэр
    bc.fillStyle = "#1e5c1e";
    bc.fillRect(0, 0, 1024, 620);

    // Шохойн зураасны стиль
    bc.strokeStyle = "rgba(255,255,255,0.88)";
    bc.fillStyle   = "rgba(255,255,255,0.88)";
    bc.lineWidth   = 4;
    bc.font        = "bold 28px Arial";
    bc.textAlign   = "center";
    bc.textBaseline = "middle";

    // Зангилааны байрлалууд
    const nodes = {
        router:  [512, 90],
        switch:  [512, 290],
        pc1:     [170, 480],
        pc2:     [390, 500],
        pc3:     [634, 500],
        pc4:     [854, 480],
    };

    // Холболтын шугамууд
    [["router","switch"],["switch","pc1"],["switch","pc2"],["switch","pc3"],["switch","pc4"]
    ].forEach(([a, b]) => {
        bc.beginPath();
        bc.moveTo(...nodes[a]);
        bc.lineTo(...nodes[b]);
        bc.stroke();
    });

    // Зангилааны дүрс
    function drawNode(ctx, x, y, label, shape) {
        ctx.beginPath();
        if (shape === "rect") {
            ctx.strokeRect(x - 52, y - 22, 104, 44);
        } else {
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillText(label, x, y + (shape === "rect" ? 36 : 46));
    }

    drawNode(bc, ...nodes.router, "Router",  "circle");
    drawNode(bc, ...nodes.switch, "Switch",  "rect");
    drawNode(bc, ...nodes.pc1,   "PC1",     "circle");
    drawNode(bc, ...nodes.pc2,   "PC2",     "circle");
    drawNode(bc, ...nodes.pc3,   "PC3",     "circle");
    drawNode(bc, ...nodes.pc4,   "PC4",     "circle");

    // Гарчиг
    bc.font = "bold 22px Arial";
    bc.fillStyle = "rgba(255,255,200,0.7)";
    bc.fillText("Star Topology", 512, 570);

    const boardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 1.95),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(boardCvs) })
    );
    boardMesh.position.set(-1.5, 2.1, -RD / 2 + 0.05);
    room.add(boardMesh);

    // Самбарын хүрээ
    const boardFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 2.05, 0.05),
        mat(0x4a3010, 0.6)
    );
    boardFrame.position.set(-1.5, 2.1, -RD / 2 + 0.02);
    room.add(boardFrame);

    // Самбарын доор шохойн тавиур
    const chalTray = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.06, 0.1),
        mat(0x5a4020, 0.7)
    );
    chalTray.position.set(-1.5, 1.09, -RD / 2 + 0.1);
    room.add(chalTray);

    // Хугархай шохойнууд тавиур дээр
    const chalkMat = new THREE.MeshStandardMaterial({ color: 0xeeeecc, roughness: 0.9 });
    [
        { x: -1.2, rz: 0.18,  len: 0.07 },
        { x: -1.5, rz: -0.12, len: 0.055 },
        { x: -1.75, rz: 0.25,  len: 0.065 },
    ].forEach(({ x, rz, len }) => {
        const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 8), chalkMat);
        ch.rotation.z = Math.PI / 2 + rz;
        ch.position.set(x, 1.125, -RD / 2 + 0.1);
        room.add(ch);
    });

    // ======================
    // ТЕЛЕВИЗ — самбарын хажууд
    // ======================
    const tvFrm = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.95, 0.08),
        mat(0x111111, 0.2, 0.7)
    );
    tvFrm.position.set(3.0, 2.1, -RD / 2 + 0.06);
    tvFrm.castShadow = true;
    room.add(tvFrm);

    // TV дэлгэц — lab.mp4 видео, дарах үед тоглох/зогсоох
    const tvVid = document.createElement("video");
    tvVid.src = "./js/lab.mp4";
    tvVid.loop = true;
    tvVid.muted = false;
    tvVid.playsInline = true;
    const tvVidTex = new THREE.VideoTexture(tvVid);
    const tvScr = new THREE.Mesh(
        new THREE.PlaneGeometry(1.44, 0.80),
        new THREE.MeshBasicMaterial({ map: tvVidTex })
    );
    tvScr.position.set(3.0, 2.1, -RD / 2 + 0.11);
    tvScr.userData = { kind: "tv" };
    room.add(tvScr);

    room.userData.toggleVideo = () => {
        if (tvVid.paused) tvVid.play().catch(e => console.warn("TV play:", e));
        else tvVid.pause();
    };

    const tvLed = new THREE.Mesh(
        new THREE.BoxGeometry(1.44, 0.025, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1a88ff, emissive: 0x1a88ff, emissiveIntensity: 1.5 })
    );
    tvLed.position.set(3.0, 1.59, -RD / 2 + 0.1);
    room.add(tvLed);

    const tvLight = new THREE.PointLight(0x2255ff, 1.5, 4);
    tvLight.position.set(3.0, 2.1, -RD / 2 + 0.8);
    room.add(tvLight);

    // ======================
    // ПРОЕКТОР — таазнаас зүүгдсэн
    // ======================
    const projG = new THREE.Group();

    // Зүүлт утас
    const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6),
        mat(0x222222, 0.5)
    );
    wire.position.set(0, 0.25, 0);
    projG.add(wire);

    // Проекторын бие
    const projBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.13, 0.28),
        mat(0x2a2a2a, 0.3, 0.5)
    );
    projBody.castShadow = true;
    projG.add(projBody);

    // Линз — урагш харсан (-z чиглэл)
    const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.06, 16),
        mat(0x111133, 0.1, 0.8)
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, -0.17);
    projG.add(lens);

    // Линзний шил
    const lensGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.045, 16),
        new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 1.2, transparent: true, opacity: 0.7 })
    );
    lensGlass.rotation.x = Math.PI / 2;
    lensGlass.position.set(0, 0, -0.21);
    projG.add(lensGlass);

    projG.position.set(0, RH - 0.5, 0.5);
    room.add(projG);

    // Проекторын гэрэл — урагш (самбар руу)
    const projSpot = new THREE.SpotLight(0xfff8e0, 2.0, 9, Math.PI / 10, 0.4, 1.5);
    projSpot.position.set(0, RH - 0.5, 0.5);
    projSpot.target.position.set(0, 1.5, -5);
    room.add(projSpot);
    room.add(projSpot.target);

    // ======================
    // БАГШИЙН ШИРЭЭ (зүүн урд)
    // ======================
    const tDesk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.07, 0.8), mat(0x6B4C11, 0.6));
    tDesk.position.set(-3, 0.78, -4.0);
    tDesk.castShadow = tDesk.receiveShadow = true;
    tDesk.userData = { kind: "compTeacherDesk" };
    room.add(tDesk);

    // "Босох" шошго — ширээн дээр хэвтээ
    const deskLblCvs = document.createElement("canvas");
    deskLblCvs.width = 256; deskLblCvs.height = 128;
    const dlc = deskLblCvs.getContext("2d");
    dlc.fillStyle = "rgba(0,0,0,0)";
    dlc.clearRect(0, 0, 256, 128);
    dlc.fillStyle = "#ffcc00";
    dlc.font = "bold 52px Arial";
    dlc.textAlign = "center";
    dlc.textBaseline = "middle";
    dlc.fillText("Босох", 128, 64);
    const deskLbl = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.25),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(deskLblCvs), transparent: true, side: THREE.DoubleSide })
    );
    // Ширээний ар ирмэгт (багшийн тал) босоо байрлуулав — VR удирдлагаар дарагдана
    deskLbl.position.set(-3, 0.92, -4.38);
    deskLbl.rotation.y = Math.PI;
    deskLbl.userData = { kind: "compTeacherDesk" };
    room.add(deskLbl);

    // Ширээний хөл
    [[0.8,0.3],[-0.8,0.3],[0.8,-0.3],[-0.8,-0.3]].forEach(([dx, dz]) => {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.07), mat(0x222222, 0.4, 0.4));
        l.position.set(-3 + dx, 0.39, -4.0 + dz);
        l.castShadow = true;
        room.add(l);
    });

    // Сандал
    const chG = new THREE.Group();
    const chM  = mat(0x3a2210, 0.6);
    const chLM = mat(0x1a1a1a, 0.4, 0.3);

    const chSeat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.50), chM);
    chSeat.position.set(0, 0.48, 0);
    chG.add(chSeat);

    const chBack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.50, 0.05), chM);
    chBack.position.set(0, 0.75, -0.23);
    chG.add(chBack);

    [[0.22,0.22],[0.22,-0.22],[-0.22,0.22],[-0.22,-0.22]].forEach(([dx,dz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), chLM);
        leg.position.set(dx, 0.24, dz);
        chG.add(leg);
    });

    // Ар хөлүүд өндөр
    [0.22,-0.22].forEach(dx => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, 0.04), chLM);
        p.position.set(dx, 0.74, -0.23);
        chG.add(p);
    });

    chG.position.set(-3, 0, -4.75);
    chG.rotation.y = 0;
    chG.userData = { kind: "compTeacherChair" };
    room.add(chG);

    // "Суух" шошго — сандлын тавцан дээр хэвтээ
    const chairLblCvs = document.createElement("canvas");
    chairLblCvs.width = 256; chairLblCvs.height = 128;
    const clc = chairLblCvs.getContext("2d");
    clc.clearRect(0, 0, 256, 128);
    clc.fillStyle = "#00ccff";
    clc.font = "bold 52px Arial";
    clc.textAlign = "center";
    clc.textBaseline = "middle";
    clc.fillText("Суух", 128, 64);
    const chairLbl = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.2),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(chairLblCvs), transparent: true })
    );
    chairLbl.rotation.x = -Math.PI / 2;
    chairLbl.position.set(-3, 0.507, -4.75);
    room.add(chairLbl);

    // БАГШИЙН МОНИТОР — ширээн дээр
    const labCvs = document.createElement("canvas");
    labCvs.width = 512; labCvs.height = 320;
    const lbc = labCvs.getContext("2d");
    lbc.fillStyle = "#0a1628";
    lbc.fillRect(0, 0, 512, 320);
    lbc.fillStyle = "#1a4080";
    lbc.fillRect(0, 0, 512, 72);
    lbc.fillStyle = "#ffffff";
    lbc.font = "bold 30px Arial";
    lbc.textAlign = "center";
    lbc.textBaseline = "middle";
    lbc.fillText("Лаборатори 1", 256, 26);
    lbc.font = "bold 26px Arial";
    lbc.fillStyle = "#aad4ff";
    lbc.fillText("Свич түүний тохиргоо", 256, 56);
    lbc.strokeStyle = "#3377cc";
    lbc.lineWidth = 1.5;
    lbc.beginPath(); lbc.moveTo(20, 76); lbc.lineTo(492, 76); lbc.stroke();
    lbc.fillStyle = "#ddeeff";
    lbc.font = "17px Arial";
    lbc.textAlign = "left";
    ["• enable", "• configure terminal", "• interface fa0/1", "• switchport mode access"].forEach((t, i) => {
        lbc.fillText(t, 24, 106 + i * 48);
    });
    const labTex = new THREE.CanvasTexture(labCvs);

    // Монитор хүрээ
    const tMon = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.30, 0.022), mat(0x111111, 0.2, 0.7));
    tMon.position.set(-3 + 0.45, 1.04, -4.0 - 0.08);
    tMon.rotation.y = Math.PI;
    tMon.castShadow = true;
    room.add(tMon);

    // Дэлгэц — багш руу харна (-z чиглэл)
    const tScr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.40, 0.24),
        new THREE.MeshBasicMaterial({ map: labTex })
    );
    tScr.position.set(-3 + 0.45, 1.04, -4.0 - 0.092);
    tScr.rotation.y = Math.PI;
    room.add(tScr);

    // Зогдол
    const tSt = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), mat(0x111111, 0.3));
    tSt.position.set(-3 + 0.45, 0.85, -4.0 - 0.08);
    room.add(tSt);
    const tBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.12), mat(0x111111, 0.3));
    tBase.position.set(-3 + 0.45, 0.80, -4.0 - 0.08);
    room.add(tBase);

    // ======================
    // БУЦАХ ХААЛГА → Угтах танхим (баруун ханан дээр)
    const backDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0xff6600, transparent: true, opacity: 0.85 })
    );
    backDoor.position.set(RW / 2 - 0.15, 1, 0);
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
    lblMesh.position.set(RW / 2 - 0.05, 2.4, 0);
    lblMesh.rotation.y = -Math.PI / 2;
    room.add(lblMesh);

    // ======================
    // МУБСИ БААВГАЙ — багшийн ширээний ард (x=-3, z=-4.65)
    // ======================
    let bearGroup5 = null;
    new THREE.TextureLoader().load("./assets/model.png", (tex) => {
        const aspect = tex.image.width / tex.image.height;
        const h = 1.9;
        const w = h * aspect;

        bearGroup5 = new THREE.Group();
        bearGroup5.position.set(-3, h / 2, -4.65);
        room.add(bearGroup5);

        const bearPlane5 = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 })
        );
        bearPlane5.userData = { kind: "roomAudio" };
        bearGroup5.add(bearPlane5);

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(w * 0.3, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(-3, 0.01, -4.65);
        room.add(shadow);
    });

    // АУДИО
    const roomAudio5 = new Audio("./assets/room5.m4a");
    roomAudio5.loop = false;
    room.userData.toggleAudio = () => {
        if (roomAudio5.paused) { roomAudio5.currentTime = 0; roomAudio5.play(); }
        else { roomAudio5.pause(); }
    };

    room.userData.update = (camera) => {
        const t = performance.now() * 0.001;
        backDoor.material.opacity = 0.65 + 0.2 * Math.sin(t * 1.8);
        if (bearGroup5 && camera) {
            bearGroup5.rotation.y = Math.atan2(
                camera.position.x - bearGroup5.position.x,
                camera.position.z - bearGroup5.position.z
            );
        }
    };

    return room;
}
