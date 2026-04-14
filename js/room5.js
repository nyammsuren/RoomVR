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

        // Дэлгэц — өөрийн terminal canvas-тай
        const scrCvs = document.createElement("canvas");
        scrCvs.width = 512; scrCvs.height = 320;
        const scrCtx = scrCvs.getContext("2d");
        // Анхны дэлгэцийн агуулга (stuScrCvs-аас хуулна)
        scrCtx.drawImage(stuScrCvs, 0, 0, 512, 320);
        const scrTex = new THREE.CanvasTexture(scrCvs);
        scrTex.needsUpdate = true;

        const scr = new THREE.Mesh(
            new THREE.PlaneGeometry(0.55, 0.36),
            new THREE.MeshBasicMaterial({ map: scrTex })
        );
        scr.position.set(x, 1.145, z - 0.075);
        scr.userData = { kind: "compScreen", deskX: x, deskZ: z, scrCvs, scrCtx, scrTex };
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
        seat.userData = { kind: "studentChair",
            sitX: x, sitY: 1.1, sitZ: z + 0.42,
            lookX: x, lookY: 1.145, lookZ: z - 0.1 };
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

    // TV дэлгэц — YouTube projected iframe
    const COMP_YT_ID    = "qJ1WrPHNCnc";
    const COMP_YT_EMBED = `https://www.youtube.com/embed/${COMP_YT_ID}`;

    const tvScrCvs = document.createElement("canvas");
    tvScrCvs.width = 720; tvScrCvs.height = 400;
    const tvScrCtx = tvScrCvs.getContext("2d");
    const tvScrTex = new THREE.CanvasTexture(tvScrCvs);
    tvScrTex.minFilter = THREE.LinearFilter;
    tvScrTex.magFilter = THREE.LinearFilter;

    function drawCompTVIdle() {
        tvScrCtx.fillStyle = "#050d1a";
        tvScrCtx.fillRect(0, 0, 720, 400);
        tvScrCtx.fillStyle = "#ff0000";
        tvScrCtx.beginPath();
        if (tvScrCtx.roundRect) tvScrCtx.roundRect(240, 110, 240, 140, 18);
        else tvScrCtx.rect(240, 110, 240, 140);
        tvScrCtx.fill();
        tvScrCtx.fillStyle = "#ffffff";
        tvScrCtx.beginPath();
        tvScrCtx.moveTo(302, 140); tvScrCtx.lineTo(302, 228); tvScrCtx.lineTo(418, 184);
        tvScrCtx.closePath(); tvScrCtx.fill();
        tvScrCtx.fillStyle = "#aaa";
        tvScrCtx.font = "bold 24px Arial"; tvScrCtx.textAlign = "center";
        tvScrCtx.fillText("YouTube", 360, 285);
        tvScrCtx.fillStyle = "#666";
        tvScrCtx.font = "18px Arial";
        tvScrCtx.fillText("▶  Дарж тоглуулна уу", 360, 320);
        tvScrTex.needsUpdate = true;
    }
    drawCompTVIdle();

    const tvScr = new THREE.Mesh(
        new THREE.PlaneGeometry(1.44, 0.80),
        new THREE.MeshBasicMaterial({ map: tvScrTex })
    );
    tvScr.position.set(3.0, 2.1, -RD / 2 + 0.11);
    tvScr.userData = { kind: "tv" };
    room.add(tvScr);

    // TV дэлгэцийн projected iframe
    // TV screen world pos: (3.0, 2.1, -RD/2+0.11) = (3.0, 2.1, -4.89)
    const _compTvCorners = [
        new THREE.Vector3(3.0 - 0.72, 2.1 + 0.40, -4.89),
        new THREE.Vector3(3.0 + 0.72, 2.1 + 0.40, -4.89),
        new THREE.Vector3(3.0 + 0.72, 2.1 - 0.40, -4.89),
        new THREE.Vector3(3.0 - 0.72, 2.1 - 0.40, -4.89),
    ];

    const compYtDiv = document.createElement("div");
    compYtDiv.style.cssText =
        "display:none;position:fixed;z-index:100;overflow:hidden;border-radius:2px;pointer-events:auto;";
    const compYtIframe = document.createElement("iframe");
    compYtIframe.style.cssText = "width:100%;height:100%;border:none;";
    compYtIframe.allow = "autoplay;fullscreen;picture-in-picture";
    compYtIframe.allowFullscreen = true;
    compYtDiv.appendChild(compYtIframe);
    document.body.appendChild(compYtDiv);

    const compYtClose = document.createElement("button");
    compYtClose.textContent = "✕";
    compYtClose.style.cssText =
        "display:none;position:fixed;z-index:101;width:24px;height:24px;" +
        "background:rgba(0,0,0,0.75);color:#fff;border:none;border-radius:50%;" +
        "font-size:13px;line-height:24px;text-align:center;cursor:pointer;";
    document.body.appendChild(compYtClose);

    function closeCompYT() {
        compYtOpen = false;
        compYtDiv.style.display  = "none";
        compYtClose.style.display = "none";
        compYtIframe.src = "";
        drawCompTVIdle();
    }
    compYtClose.onclick = closeCompYT;

    function updateCompYtPos(cam) {
        if (!compYtOpen) return;
        const W = window.innerWidth, H = window.innerHeight;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        _compTvCorners.forEach(wv => {
            const v = wv.clone().project(cam);
            const sx = (v.x + 1) / 2 * W;
            const sy = (-v.y + 1) / 2 * H;
            if (sx < minX) minX = sx; if (sx > maxX) maxX = sx;
            if (sy < minY) minY = sy; if (sy > maxY) maxY = sy;
        });
        compYtDiv.style.left   = `${minX}px`;
        compYtDiv.style.top    = `${minY}px`;
        compYtDiv.style.width  = `${maxX - minX}px`;
        compYtDiv.style.height = `${maxY - minY}px`;
        compYtClose.style.left = `${maxX - 28}px`;
        compYtClose.style.top  = `${minY + 3}px`;
    }

    let compYtOpen = false;
    room.userData.toggleVideo = () => {
        compYtOpen = !compYtOpen;
        if (compYtOpen) {
            compYtIframe.src = `${COMP_YT_EMBED}?autoplay=1&rel=0`;
            compYtDiv.style.display  = "block";
            compYtClose.style.display = "block";
        } else {
            closeCompYT();
        }
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
        new THREE.BoxGeometry(0.2, 2.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xff6600, transparent: true, opacity: 0.85 })
    );
    backDoor.position.set(RW / 2 - 0.15, 1.25, 0);
    backDoor.userData = { kind: "backDoor" };
    room.add(backDoor);

    const lblCvs = document.createElement("canvas");
    lblCvs.width = 512; lblCvs.height = 80;
    const lctx = lblCvs.getContext("2d");
    lctx.clearRect(0, 0, 512, 80);
    lctx.fillStyle = "#ffffff";
    lctx.font = "bold 60px Arial";
    lctx.textAlign = "center";
    lctx.textBaseline = "middle";
    lctx.fillText("← Угтах танхим", 256, 40);
    const lblMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.42),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lblCvs), transparent: true, depthTest: false })
    );
    lblMesh.position.set(RW / 2 - 0.05, 3.2, 0);
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

    // ======================
    // TERMINAL СИСТЕМ — дэлгэц дотор
    // ======================
    let activeScr = null; // идэвхтэй монитор

    const COMMANDS = {
        help: () => [
            "Боломжтой командууд:",
            "  ipconfig     — IP тохиргоо харах",
            "  ping <host>  — хост шалгах",
            "  tracert <ip> — маршрут харах",
            "  arp -a       — ARP хүснэгт",
            "  netstat      — нээлттэй портууд",
            "  cls / clear  — цэвэрлэх",
            "  exit         — терминал хаах",
        ],
        ipconfig: () => [
            "Windows IP Configuration",
            "",
            "Ethernet adapter Ethernet0:",
            "   IPv4 Address  . . . : 192.168.1.105",
            "   Subnet Mask . . . . : 255.255.255.0",
            "   Default Gateway . . : 192.168.1.1",
            "",
            "DNS Servers . . . . . . : 8.8.8.8",
            "                          8.8.4.4",
        ],
        arp: () => [
            "Interface: 192.168.1.105 --- 0x3",
            "  Internet Address    Physical Address    Type",
            "  192.168.1.1         00-14-22-01-23-45   dynamic",
            "  192.168.1.100       00-1A-2B-3C-4D-5E   dynamic",
            "  192.168.1.255       ff-ff-ff-ff-ff-ff   static",
        ],
        netstat: () => [
            "Active Connections",
            "",
            "  Proto  Local Addr       Foreign Addr      State",
            "  TCP    192.168.1.105:80  0.0.0.0:0        LISTENING",
            "  TCP    192.168.1.105:443 0.0.0.0:0        LISTENING",
            "  TCP    192.168.1.105:53  8.8.8.8:53       ESTABLISHED",
            "  UDP    192.168.1.105:68  192.168.1.1:67   —",
        ],
    };

    let termLines = [];
    let termOpen = false;

    function drawTerminal() {
        if (!activeScr) return;
        const ctx = activeScr.userData.scrCtx;
        const tex = activeScr.userData.scrTex;
        const W = 512, H = 320;
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(0, 0, W, H);
        // Гарчгийн мөр
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(0, 0, W, 18);
        ctx.fillStyle = "#ff5f57"; ctx.beginPath(); ctx.arc(8, 9, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#febc2e"; ctx.beginPath(); ctx.arc(20, 9, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#28c840"; ctx.beginPath(); ctx.arc(32, 9, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#8b9eb0"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("cmd.exe", W/2, 12);
        // Мөрүүд
        ctx.textAlign = "left"; ctx.font = "9px monospace";
        const maxLines = 28;
        const visible = termLines.slice(-maxLines);
        visible.forEach((line, i) => {
            ctx.fillStyle = line.startsWith("C:\\>") ? "#00ff88" : "#c9d1d9";
            ctx.fillText(line, 6, 30 + i * 10);
        });
        // Cursor
        ctx.fillStyle = "#00ff88";
        ctx.fillText("C:\\> _", 6, 30 + visible.length * 10);
        tex.needsUpdate = true;
    }

    function runCommand(cmd) {
        const parts = cmd.trim().toLowerCase().split(" ");
        const base = parts[0];
        termLines.push("C:\\> " + cmd);
        if (base === "cls" || base === "clear") { termLines = []; drawTerminal(); return; }
        if (base === "exit") { closeTerminal(); return; }
        if (base === "ping") {
            const host = parts[1] || "192.168.1.1";
            termLines.push(`Pinging ${host} with 32 bytes of data:`);
            ["64ms","71ms","68ms","70ms"].forEach((t,i) =>
                termLines.push(`Reply from ${host}: bytes=32 time=${t} TTL=64`));
            termLines.push(`Ping statistics: Packets: Sent=4, Received=4, Lost=0 (0% loss)`);
        } else if (base === "tracert") {
            const host = parts[1] || "8.8.8.8";
            termLines.push(`Tracing route to ${host}:`);
            [["1","192.168.1.1","1ms"],["2","10.0.0.1","8ms"],["3","72.14.215.1","22ms"],["4",host,"35ms"]].forEach(([n,ip,t]) =>
                termLines.push(`  ${n.padEnd(3)} ${t.padEnd(8)} ${ip}`));
            termLines.push("Trace complete.");
        } else if (COMMANDS[base]) {
            COMMANDS[base]().forEach(l => termLines.push(l));
        } else if (base === "") {
            // хоосон
        } else {
            termLines.push(`'${cmd}' is not recognized as a command.`);
            termLines.push("Type 'help' for available commands.");
        }
        termLines.push("");
        drawTerminal();
    }

    // VR товч товчнууд
    const VR_CMDS = [
        { label: "ipconfig",      cmd: "ipconfig" },
        { label: "ping 8.8.8.8", cmd: "ping 8.8.8.8" },
        { label: "arp -a",        cmd: "arp" },
        { label: "netstat",       cmd: "netstat" },
        { label: "tracert",       cmd: "tracert 8.8.8.8" },
        { label: "help",          cmd: "help" },
        { label: "clear",         cmd: "clear" },
        { label: "✕ exit",        cmd: "exit" },
    ];

    const cmdBtnGroup = new THREE.Group();
    cmdBtnGroup.visible = false;
    room.add(cmdBtnGroup);

    // 4 багана × 2 эгнээ — ширээн дээр хэвтэлгүүлж байрлуулна
    VR_CMDS.forEach(({ label, cmd }, i) => {
        const bc = document.createElement("canvas");
        bc.width = 256; bc.height = 80;
        const bx = bc.getContext("2d");
        const isExit = label.startsWith("✕");
        bx.fillStyle = isExit ? "#7f1d1d" : "#1a3050";
        bx.beginPath();
        if (bx.roundRect) bx.roundRect(3, 3, 250, 74, 8); else bx.rect(3, 3, 250, 74);
        bx.fill();
        bx.strokeStyle = isExit ? "#ef4444" : "#38bdf8";
        bx.lineWidth = 3; bx.stroke();
        bx.fillStyle = "#e2e8f0"; bx.font = "bold 24px monospace";
        bx.textAlign = "center"; bx.textBaseline = "middle";
        bx.fillText(label, 128, 40);

        const btn = new THREE.Mesh(
            new THREE.PlaneGeometry(0.22, 0.08),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, side: THREE.DoubleSide })
        );
        // 4 багана × 2 эгнээ — монитор дээгүүр босоогоор
        const col = i % 4;
        const row = Math.floor(i / 4);
        btn.position.set((col - 1.5) * 0.24, row * 0.10, 0);
        btn.userData = { kind: "termCmd", cmd };
        cmdBtnGroup.add(btn);
    });

    function openTerminal(scrMesh) {
        if (termOpen && activeScr === scrMesh) { closeTerminal(); return; }
        if (termOpen) closeTerminal();
        termOpen = true;
        activeScr = scrMesh;
        termLines = [
            "Microsoft Windows [Version 10.0.19045]",
            "(c) Microsoft Corporation. All rights reserved.",
            "",
            "Type 'help' or use buttons.",
            "",
        ];
        // Товчнуудыг монитор дээгүүр босоогоор, сурагч руу харуулж байрлуул
        const { deskX, deskZ } = scrMesh.userData;
        cmdBtnGroup.position.set(deskX, 1.48, deskZ - 0.07);
        cmdBtnGroup.rotation.set(0, 0, 0); // босоо, сурагч руу харна (+Z)
        cmdBtnGroup.visible = true;
        drawTerminal();
    }

    function closeTerminal() {
        if (activeScr) {
            // Анхны дэлгэцийн зурагруу буцаана
            const { scrCtx, scrTex } = activeScr.userData;
            scrCtx.drawImage(stuScrCvs, 0, 0, 512, 320);
            scrTex.needsUpdate = true;
            activeScr = null;
        }
        termOpen = false;
        cmdBtnGroup.visible = false;
        if (termInput) { termInput.remove(); termInput = null; }
    }

    // Non-VR: HTML input
    let termInput = null;
    room.userData.openTerminal = (scrMesh) => {
        openTerminal(scrMesh);
        if (termOpen && !document.querySelector('#termInput')) {
            termInput = document.createElement("input");
            termInput.id = "termInput";
            termInput.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:400px;padding:10px;font:18px monospace;background:#0d1117;color:#00ff88;border:1px solid #00ff88;border-radius:4px;outline:none;z-index:9999;";
            termInput.placeholder = "команд оруулна уу...";
            document.body.appendChild(termInput);
            termInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { runCommand(termInput.value); termInput.value = ""; }
                if (e.key === "Escape") closeTerminal();
                e.stopPropagation();
            });
            setTimeout(() => termInput?.focus(), 50);
        }
    };

    room.userData.onClick = (raycaster) => {
        const hits = raycaster.intersectObjects(room.children, true);
        for (const hit of hits) {
            let obj = hit.object;
            while (obj && !obj.userData?.kind) obj = obj.parent;
            if (obj?.userData?.kind === "termCmd") {
                runCommand(obj.userData.cmd);
                return;
            }
            if (obj?.userData?.kind === "compScreen") {
                room.userData.openTerminal(obj);
                return;
            }
        }
    };

    room.userData.update = (camera) => {
        updateCompYtPos(camera);
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
