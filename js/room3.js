import * as THREE from "three";

export function createRoom3(scene, camera, renderer) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 10, RH = 5, RD = 10;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    // ======================
    // ГЭРЭЛ
    // ======================
    room.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(4, 10, 6);
    dir.castShadow = true;
    room.add(dir);

    // ======================
    // ШАЛ
    // ======================
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x1e2030, 0.9));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { teleport: true };
    room.add(floor);

    for (let i = -4; i <= 4; i++) {
        const hm = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.02), mat(0x2a2d48, 0.5));
        hm.rotation.x = -Math.PI / 2; hm.position.set(0, 0.001, i);
        room.add(hm);
        const vm = new THREE.Mesh(new THREE.PlaneGeometry(0.02, RD), mat(0x2a2d48, 0.5));
        vm.rotation.x = -Math.PI / 2; vm.position.set(i, 0.001, 0);
        room.add(vm);
    }

    // ======================
    // ХАНУУД
    // ======================
    const wallMat = mat(0xf0f0f0, 0.9);
    [
        [RW, RH, [0, RH/2, -RD/2], 0],
        [RW, RH, [0, RH/2,  RD/2], Math.PI],
        [RD, RH, [-RW/2, RH/2, 0],  Math.PI/2],
        [RD, RH, [ RW/2, RH/2, 0], -Math.PI/2],
    ].forEach(([w, h, pos, ry]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat.clone());
        m.position.set(...pos); m.rotation.y = ry;
        room.add(m);
    });

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0xf0f0f0, 0.9));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, RH, 0);
    room.add(ceil);

    // ======================
    // ТААЗНЫ ГЭРЭЛ
    // ======================
    [[-2,-1],[2,-1],[-2,2],[2,2]].forEach(([x,z]) => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.06, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xfffde7, emissive: 0xfffde7, emissiveIntensity: 2.5 })
        );
        panel.position.set(x, RH - 0.03, z);
        room.add(panel);
        const l = new THREE.PointLight(0xfffde7, 2.2, 9);
        l.position.set(x, RH - 0.2, z);
        l.castShadow = true;
        room.add(l);
    });

    // ======================
    // ГАРЧИГ
    // ======================
    const titleCvs = document.createElement('canvas');
    titleCvs.width = 1024; titleCvs.height = 128;
    const ttx = titleCvs.getContext('2d');
    ttx.clearRect(0, 0, 1024, 128);
    ttx.fillStyle = '#229944';
    ttx.font = 'bold 60px Arial';
    ttx.textAlign = 'center'; ttx.textBaseline = 'middle';
    ttx.fillText('Сүлжээний лаборатори', 512, 64);
    const titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 0.6),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(titleCvs), transparent: true })
    );
    titleMesh.position.set(RW/2 - 0.05, 3.8, 0);
    titleMesh.rotation.y = -Math.PI / 2;
    room.add(titleMesh);

    // ======================
    // БУЦАХ ХААЛГА → Угтах танхим (зүүн хана)
    // ======================
    const backDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 2.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x229944, transparent: true, opacity: 0.85,
            emissive: 0x229944, emissiveIntensity: 0.2 })
    );
    backDoor.position.set(-RW/2 + 0.1, 1.25, 0);
    backDoor.userData = { kind: 'backDoor' };
    room.add(backDoor);

    const bdCvs = document.createElement('canvas');
    bdCvs.width = 512; bdCvs.height = 80;
    const bdc = bdCvs.getContext('2d');
    bdc.clearRect(0, 0, 512, 80);
    bdc.fillStyle = '#229944';
    bdc.font = 'bold 60px Arial';
    bdc.textAlign = 'center'; bdc.textBaseline = 'middle';
    bdc.fillText('← Угтах танхим', 256, 40);
    const bdLbl = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.42),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bdCvs), transparent: true, depthTest: false })
    );
    bdLbl.position.set(-RW/2 + 0.1, 3.2, 0);
    bdLbl.rotation.y = Math.PI / 2;
    room.add(bdLbl);

    // ======================
    // КАБЕЛИЙН ПАНЕЛ — урд хана
    // CABLE_DEFS: id, label, sub, color
    // ======================
    const CABLE_DEFS = [
        { id: 'straight', label: 'Straight-through', sub: 'PC-Switch, PC-Router',     color: 0x2266ff, hex: '#2266ff' },
        { id: 'crossover', label: 'Crossover',        sub: 'PC-PC, Router-Router',      color: 0xff7700, hex: '#ff7700' },
        { id: 'console',   label: 'Console',           sub: 'PC-Router (тохиргоо)',       color: 0x22ccaa, hex: '#22ccaa' },
        { id: 'serial',    label: 'Serial (V.35)',     sub: 'Router-Router WAN',          color: 0xcc44cc, hex: '#cc44cc' },
    ];

    // Кабель зурах функцүүд
    function drawStraight(ctx) {
        const cols = ['#ff8800','#ff8800','#00aa44','#cc0000','#cc0000','#00aa44','#0055cc','#888888'];
        cols.forEach((c, j) => {
            ctx.strokeStyle = c; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(28 + j*26, 85); ctx.lineTo(28 + j*26, 295); ctx.stroke();
        });
        ctx.fillStyle = '#999'; ctx.fillRect(14, 62, 228, 26);
        ctx.fillRect(14, 293, 228, 26);
        ctx.fillStyle = '#666'; ctx.fillRect(90, 52, 76, 14);
        ctx.fillRect(90, 317, 76, 14);
    }
    function drawCrossover(ctx) {
        const fromX = [24, 58, 92, 126, 160, 194, 228, 24];
        const toX   = [228, 194, 160, 126, 92,  58,  24, 228];
        const cols = ['#ff8800','#0055cc','#cc0000','#00aa44','#00aa44','#cc0000','#0055cc','#ff8800'];
        fromX.slice(0,6).forEach((fx, j) => {
            ctx.strokeStyle = cols[j]; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(fx, 85); ctx.lineTo(toX[j], 295); ctx.stroke();
        });
        ctx.fillStyle = '#999'; ctx.fillRect(14, 62, 228, 26);
        ctx.fillRect(14, 293, 228, 26);
        ctx.fillStyle = '#666'; ctx.fillRect(90, 52, 76, 14);
        ctx.fillRect(90, 317, 76, 14);
    }
    function drawConsole(ctx) {
        ctx.strokeStyle = '#22ccaa'; ctx.lineWidth = 28; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(128, 85); ctx.lineTo(128, 295); ctx.stroke();
        // RJ45 дээд
        ctx.fillStyle = '#aaaaaa'; ctx.fillRect(90, 62, 76, 24);
        ctx.fillStyle = '#777'; ctx.fillRect(104, 52, 48, 14);
        // DB9 доод (oval)
        ctx.fillStyle = '#bbbbbb';
        ctx.beginPath(); ctx.ellipse(128, 308, 58, 20, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#888';
        [90,107,124,141,158].forEach((x,i) => {
            ctx.beginPath(); ctx.arc(x, 308, 4, 0, Math.PI*2); ctx.fill();
        });
        [99,116,133,150].forEach(x => {
            ctx.beginPath(); ctx.arc(x, 318, 4, 0, Math.PI*2); ctx.fill();
        });
    }
    function drawSerial(ctx) {
        ctx.strokeStyle = '#888888'; ctx.lineWidth = 20; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(128, 85); ctx.lineTo(128, 295); ctx.stroke();
        // V.35 connector дээд
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.moveTo(62, 62); ctx.lineTo(194, 62);
        ctx.lineTo(206, 85); ctx.lineTo(50, 85);
        ctx.closePath(); ctx.fill();
        // V.35 connector доод
        ctx.beginPath();
        ctx.moveTo(62, 318); ctx.lineTo(194, 318);
        ctx.lineTo(206, 295); ctx.lineTo(50, 295);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#666';
        for(let i=0;i<6;i++) {
            ctx.beginPath(); ctx.arc(80+i*22, 75, 3, 0, Math.PI*2); ctx.fill();
        }
        for(let i=0;i<6;i++) {
            ctx.beginPath(); ctx.arc(80+i*22, 305, 3, 0, Math.PI*2); ctx.fill();
        }
    }
    const drawFns = [drawStraight, drawCrossover, drawConsole, drawSerial];

    const cableMeshes = [];
    const cableGlowLights = [];
    const cablePX = [-3.0, -1.0, 1.0, 3.0];

    CABLE_DEFS.forEach((cd, i) => {
        const px = cablePX[i];
        const py = 2.0;
        const pz = -RD/2 + 0.05;

        // Frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.65, 2.3, 0.06),
            mat(0x1a1a2e, 0.8)
        );
        frame.position.set(px, py, pz - 0.02);
        room.add(frame);

        // Border glow strip
        const border = new THREE.Mesh(
            new THREE.BoxGeometry(1.68, 2.33, 0.03),
            new THREE.MeshStandardMaterial({ color: cd.color, emissive: cd.color, emissiveIntensity: 0.3 })
        );
        border.position.set(px, py, pz - 0.055);
        room.add(border);

        // Cable canvas
        const cvs = document.createElement('canvas');
        cvs.width = 256; cvs.height = 420;
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, 256, 420);

        // Draw cable icon
        drawFns[i](ctx);

        // Label
        ctx.fillStyle = cd.hex;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cd.label, 128, 348);

        // Sub label
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '14px Arial';
        ctx.fillText(cd.sub, 128, 372);

        // Click hint
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '13px Arial';
        ctx.fillText('[ дарж сонгох ]', 128, 395);

        const cableMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.52, 2.12),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true })
        );
        cableMesh.position.set(px, py, pz + 0.04);
        cableMesh.userData = { kind: 'cable', cableType: cd.id };
        room.add(cableMesh);
        cableMeshes.push(cableMesh);

        // Glow light
        const gl = new THREE.PointLight(cd.color, 0.3, 2.5);
        gl.position.set(px, py, pz + 0.5);
        room.add(gl);
        cableGlowLights.push(gl);
    });

    // Заавар бичиг компьютерийн дэлгэцэнд харагдана (хананаас устгав)

    // ======================
    // ШИРЭЭНҮҮД
    // ======================
    const TY = 0.78;

    // Сүлжээний төхөөрөмжийн урт ширээ
    const netTbl = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.06, 0.95), mat(0x4a3810, 0.7));
    netTbl.position.set(0, TY, -2.2);
    room.add(netTbl);
    [[-4.4,-2.62],[4.4,-2.62],[-4.4,-1.78],[4.4,-1.78]].forEach(([x,z]) => {
        const legH = TY - 0.03;
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, legH, 0.08), mat(0x222222, 0.5));
        l.position.set(x, legH / 2, z);
        room.add(l);
    });

    // Компьютерийн ширээнүүд (2 тус тус)
    [[-2.0, 2.2],[2.0, 2.2]].forEach(([tx, tz]) => {
        const t = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.85), mat(0x4a3810, 0.7));
        t.position.set(tx, TY, tz);
        room.add(t);
        [[0.64,0.36],[0.64,-0.36],[-0.64,0.36],[-0.64,-0.36]].forEach(([dx,dz]) => {
            const legH = TY - 0.03;
            const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, legH, 0.07), mat(0x222222, 0.5));
            l.position.set(tx+dx, legH / 2, tz+dz);
            room.add(l);
        });
    });

    // ======================
    // СҮЛЖЭЭНИЙ ТӨХӨӨРӨМЖҮҮД
    // ======================
    const DEVICE_DEFS = [
        { id: 'router1',  type: 'router',  label: 'Router 1',   x: -3.8, z: -2.2 },
        { id: 'switch1',  type: 'switch',  label: 'Switch',     x: -0.8, z: -2.2 },
        { id: 'router2',  type: 'router',  label: 'Router 2',   x:  1.5, z: -2.2 },
        { id: 'wrouter',  type: 'wrouter', label: 'WiFi Router', x: 3.6, z: -2.2 },
        { id: 'pc1',      type: 'pc',      label: 'PC 1',       x: -2.0, z:  2.2 },
        { id: 'pc2',      type: 'pc',      label: 'PC 2',       x:  2.0, z:  2.2 },
    ];

    const deviceObjects = [];
    const pcScrTexs = []; // PC дэлгэцийн texture-үүд — renderStatus үүнийг шинэчилнэ

    DEVICE_DEFS.forEach(def => {
        const g = new THREE.Group();
        const dk = { kind: 'device', deviceId: def.id, deviceType: def.type };

        if (def.type === 'router') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.30), mat(0x999999, 0.3, 0.5));
            body.userData = dk;
            g.add(body);
            // Антен
            const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), mat(0x666666, 0.4));
            ant.position.set(0.19, 0.155, -0.12);
            g.add(ant);
            // Портууд
            for (let j = 0; j < 4; j++) {
                const p = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.022, 0.016), mat(0x222222, 0.5));
                p.position.set(-0.12 + j*0.075, 0.025, -0.15);
                g.add(p);
            }
            // LED
            ['#00ff44','#00ff44','#ff8800','#00ff44'].forEach((c, j) => {
                const led = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.011, 0.011),
                    new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 2 }));
                led.position.set(-0.12 + j*0.075, 0.040, -0.15);
                g.add(led);
            });
            g.position.set(def.x, TY + 0.045, def.z);
        }
        else if (def.type === 'switch') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.058, 0.25), mat(0x1e3344, 0.3, 0.6));
            body.userData = dk;
            g.add(body);
            for (let j = 0; j < 8; j++) {
                const p = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.022, 0.018), mat(0x111111, 0.5));
                p.position.set(-0.25 + j*0.066, 0.026, -0.10);
                g.add(p);
                const led = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.009, 0.009),
                    new THREE.MeshStandardMaterial({ color: '#00ff44', emissive: '#00ff44', emissiveIntensity: 2 }));
                led.position.set(-0.25 + j*0.066, 0.037, -0.10);
                g.add(led);
            }
            g.position.set(def.x, TY + 0.029, def.z);
        }
        else if (def.type === 'wrouter') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.058, 0.23), mat(0xdddddd, 0.25, 0.1));
            body.userData = dk;
            g.add(body);
            [-0.11, 0, 0.11].forEach(ax => {
                const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.21, 6), mat(0xbbbbbb, 0.4));
                ant.position.set(ax, 0.14, -0.10);
                g.add(ant);
            });
            const wled = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.013, 0.012),
                new THREE.MeshStandardMaterial({ color: 0x0088ff, emissive: 0x0088ff, emissiveIntensity: 2.5 }));
            wled.position.set(0.12, 0.034, 0.10);
            g.add(wled);
            g.position.set(def.x, TY + 0.029, def.z);
        }
        else if (def.type === 'pc') {
            // Системийн блок — тавцангийн баруун хэсэгт (x=+0.35), төвөөс холдуулав
            const caseM = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.40, 0.36), mat(0x252535, 0.5, 0.3));
            caseM.position.set(0.35, 0.20, 0);
            caseM.userData = dk;
            g.add(caseM);
            const pled = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.011, 0.011),
                new THREE.MeshStandardMaterial({ color: 0x0044ff, emissive: 0x0044ff, emissiveIntensity: 2 }));
            pled.position.set(0.35, 0.37, -0.182);
            g.add(pled);
            // Монитор — системийн блокийн зүүн талд (x=-0.35), томруулав
            const mon = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.022), mat(0x111111, 0.2, 0.7));
            mon.position.set(-0.35, 0.35, -0.05);
            g.add(mon);
            const scrCvs = document.createElement('canvas');
            scrCvs.width = 512; scrCvs.height = 320;
            const sctx = scrCvs.getContext('2d');
            const scrTex = new THREE.CanvasTexture(scrCvs);
            pcScrTexs.push({ cvs: scrCvs, ctx: sctx, tex: scrTex });
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.36),
                new THREE.MeshBasicMaterial({ map: scrTex }));
            scr.position.set(-0.35, 0.35, -0.038);
            g.add(scr);
            // Монитор стенд
            const mst = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.04), mat(0x111111, 0.3));
            mst.position.set(-0.35, 0.07, -0.05);
            g.add(mst);
            // Монитор суурь (жижиг тавиур)
            const mbase = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.014, 0.12), mat(0x111111, 0.3));
            mbase.position.set(-0.35, 0.007, -0.05);
            g.add(mbase);
            // Гар — мониторын урд талд (суугчийн тал)
            const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.011, 0.11), mat(0x1a1a2a, 0.6));
            kbd.position.set(-0.22, 0.006, 0.12);
            g.add(kbd);
            // Хулгана — гарны хажууд
            const ms = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.019, 0.082), mat(0x111111, 0.3));
            ms.position.set(0.04, 0.006, 0.12);
            g.add(ms);
            g.position.set(def.x, TY + 0.03, def.z);
        }

        // Шошго (label)
        const lc = document.createElement('canvas');
        lc.width = 256; lc.height = 60;
        const lctx = lc.getContext('2d');
        lctx.fillStyle = 'rgba(0,0,0,0.78)';
        lctx.fillRect(0, 0, 256, 60);
        lctx.fillStyle = '#ffff55';
        lctx.font = 'bold 28px Arial';
        lctx.textAlign = 'center'; lctx.textBaseline = 'middle';
        lctx.fillText(def.label, 128, 30);
        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(0.54, 0.13),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true, depthTest: false })
        );
        const lblY = def.type === 'pc' ? 0.43 : (def.type === 'switch' || def.type === 'wrouter' ? 0.10 : 0.14);
        const lblX = def.type === 'pc' ? 0.35 : 0;
        lbl.position.set(lblX, lblY, 0.01);
        g.add(lbl);

        g.userData = dk;
        room.add(g);
        deviceObjects.push({ id: def.id, type: def.type, label: def.label, mesh: g });
    });

    // ======================
    // GAME STATE
    // ======================
    let selectedCable = null;
    let selectedDevice = null;
    let score = 0;
    const connections = [];   // { devA, devB, line, valid, posA, posB, flashCount, flashTimer, dots }
    const connectedPairs = new Set();

    // Кабель хүчинтэй байдлын дүрэм
    function isValid(typeA, typeB, cable) {
        const pair = [typeA, typeB].sort().join('+');
        const rules = {
            'pc+pc':         ['crossover'],
            'router+router': ['crossover', 'serial'],
            'switch+switch': ['crossover'],
            'pc+router':     ['straight', 'console'],
            'pc+switch':     ['straight', 'console'],
            'pc+wrouter':    ['straight', 'console'],
            'router+switch': ['straight'],
            'router+wrouter':['straight'],
            'switch+wrouter':['straight'],
        };
        return (rules[pair] || ['straight']).includes(cable);
    }

    function pairKey(a, b) { return [a, b].sort().join('~~'); }

    // ======================
    // ОНОО ДЭЛГЭЦ
    // ======================
    const scoreCvs = document.createElement('canvas');
    scoreCvs.width = 300; scoreCvs.height = 160;
    const scoreCtx = scoreCvs.getContext('2d');
    const scoreTex = new THREE.CanvasTexture(scoreCvs);
    const scoreMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 0.9),
        new THREE.MeshBasicMaterial({ map: scoreTex, transparent: true })
    );
    scoreMesh.position.set(4.0, 4.2, -RD/2 + 0.05);
    room.add(scoreMesh);

    function renderScore() {
        scoreCtx.fillStyle = '#0a180a';
        scoreCtx.fillRect(0, 0, 300, 160);
        scoreCtx.strokeStyle = '#229944';
        scoreCtx.lineWidth = 3;
        scoreCtx.strokeRect(3, 3, 294, 154);
        scoreCtx.fillStyle = '#229944';
        scoreCtx.font = 'bold 28px Arial';
        scoreCtx.textAlign = 'center'; scoreCtx.textBaseline = 'middle';
        scoreCtx.fillText('Оноо / Score', 150, 44);
        scoreCtx.fillStyle = '#ffffff';
        scoreCtx.font = 'bold 70px Arial';
        scoreCtx.fillText(score, 150, 112);
        scoreTex.needsUpdate = true;
    }
    renderScore();

    // ======================
    // СТАТУС — PC дэлгэц дээр харуулна
    // ======================
    function renderStatus(line1, line2, color = '#aaddff') {
        pcScrTexs.forEach(({ cvs, ctx, tex }) => {
            ctx.fillStyle = '#001133';
            ctx.fillRect(0, 0, 512, 320);
            ctx.fillStyle = '#1a4080';
            ctx.fillRect(0, 0, 512, 80);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Лаборатори ажил', 256, 28);
            ctx.strokeStyle = '#3377cc';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(20, 82); ctx.lineTo(492, 82); ctx.stroke();
            ctx.fillStyle = '#aad4ff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('Сүлжээний кабель холболт', 256, 120);
            ctx.strokeStyle = '#2255aa';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(20, 155); ctx.lineTo(492, 155); ctx.stroke();
            ctx.fillStyle = color;
            ctx.font = 'bold 28px Arial';
            ctx.fillText(line1, 256, 200);
            ctx.fillStyle = '#cccccc';
            ctx.font = '22px Arial';
            ctx.fillText(line2, 256, 260);
            tex.needsUpdate = true;
        });
    }
    renderStatus('Кабель сонгоно уу', 'ханан дээр байгаа кабелиас нэгийг сонгоно уу');

    // ======================
    // FEEDBACK ДЭЛГЭЦ (урд ханан дээд)
    // ======================
    const feedCvs = document.createElement('canvas');
    feedCvs.width = 512; feedCvs.height = 96;
    const feedCtx = feedCvs.getContext('2d');
    const feedTex = new THREE.CanvasTexture(feedCvs);
    const feedMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 0.6),
        new THREE.MeshBasicMaterial({ map: feedTex, transparent: true })
    );
    feedMesh.position.set(0, 4.0, -RD/2 + 0.05);
    feedMesh.visible = false;
    room.add(feedMesh);
    let feedTimer = 0;

    function showFeedback(text, type) {
        const bg   = type === 'ok' ? 'rgba(0,35,0,0.9)'  : type === 'warn' ? 'rgba(35,20,0,0.9)' : 'rgba(40,0,0,0.9)';
        const bord = type === 'ok' ? '#00ff44'            : type === 'warn' ? '#ffaa00'            : '#ff2200';
        feedCtx.fillStyle = bg;
        feedCtx.fillRect(0, 0, 512, 96);
        feedCtx.strokeStyle = bord;
        feedCtx.lineWidth = 3;
        feedCtx.strokeRect(3, 3, 506, 90);
        feedCtx.fillStyle = bord;
        feedCtx.font = 'bold 28px Arial';
        feedCtx.textAlign = 'center'; feedCtx.textBaseline = 'middle';
        feedCtx.fillText(text, 256, 48);
        feedTex.needsUpdate = true;
        feedMesh.visible = true;
        feedTimer = 2.8;
    }

    // ======================
    // СОНГОЛТЫН ТОЙРОГ
    // ======================
    let selRing = null;
    function setSelRing(dev) {
        if (selRing) { room.remove(selRing); selRing = null; }
        if (!dev) return;
        selRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.30, 0.022, 8, 36),
            new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        const wp = new THREE.Vector3();
        dev.mesh.getWorldPosition(wp);
        selRing.position.set(wp.x, TY + 0.012, wp.z);
        selRing.rotation.x = -Math.PI / 2;
        room.add(selRing);
    }

    function setCableHighlight(type) {
        cableMeshes.forEach(cm => {
            cm.material.opacity = (!type || cm.userData.cableType === type) ? 1.0 : 0.3;
        });
        cableGlowLights.forEach((gl, i) => {
            gl.intensity = (!type || CABLE_DEFS[i].id === type) ? 1.0 : 0.1;
        });
    }

    // ======================
    // ХОЛБОЛТЫН ШУГАМ
    // ======================
    function createLine(devA, devB, valid) {
        const pA = new THREE.Vector3(), pB = new THREE.Vector3();
        devA.mesh.getWorldPosition(pA); devB.mesh.getWorldPosition(pB);
        pA.y += 0.18; pB.y += 0.18;

        const lm = new THREE.LineBasicMaterial({ color: valid ? 0x00ff44 : 0xff2200, linewidth: 2 });
        const lg = new THREE.BufferGeometry().setFromPoints([pA, pB]);
        const line = new THREE.Line(lg, lm);
        room.add(line);

        const conn = { devA, devB, line, valid, posA: pA.clone(), posB: pB.clone(),
                       flashCount: 0, flashTimer: 0, dots: [] };
        if (valid) {
            for (let i = 0; i < 4; i++) {
                const dot = new THREE.Mesh(
                    new THREE.SphereGeometry(0.032, 6, 6),
                    new THREE.MeshBasicMaterial({ color: 0x00ff88 })
                );
                dot.userData.t = i / 4;
                room.add(dot);
                conn.dots.push(dot);
            }
        }
        connections.push(conn);
    }

    // ======================
    // CLICK HANDLER
    // ======================
    room.userData.onClick = (raycaster) => {
        const hits = raycaster.intersectObjects(room.children, true);
        if (!hits.length) return;

        // Hits бүрийг сканнална — frame/border шиг kind-гүй объект алгасна
        let obj = null;
        for (const hit of hits) {
            let o = hit.object;
            while (o && !o.userData?.kind) o = o.parent;
            if (o?.userData?.kind === 'cable' || o?.userData?.kind === 'device') {
                obj = o; break;
            }
        }
        if (!obj) return;

        const k = obj.userData.kind;

        // ── Кабель сонгох ──
        if (k === 'cable') {
            selectedCable = obj.userData.cableType;
            selectedDevice = null;
            setSelRing(null);
            setCableHighlight(selectedCable);
            const cd = CABLE_DEFS.find(c => c.id === selectedCable);
            renderStatus(`${cd.label} сонгогдлоо`, '1-р төхөөрөмжийг дарна уу', cd.hex);
            return;
        }

        // ── Төхөөрөмж дарах ──
        if (k === 'device') {
            if (!selectedCable) {
                showFeedback('Эхлээд кабель сонгоно уу!', 'warn');
                return;
            }

            const dev = deviceObjects.find(d => d.id === obj.userData.deviceId);
            if (!dev) return;

            // Эхний төхөөрөмж
            if (!selectedDevice) {
                selectedDevice = dev;
                setSelRing(dev);
                const cd = CABLE_DEFS.find(c => c.id === selectedCable);
                renderStatus(`${dev.label} сонгогдлоо`, '2-р төхөөрөмжийг дарна уу', cd.hex);
                return;
            }

            // Ижил төхөөрөмж дарвал цуцлах
            if (selectedDevice.id === dev.id) {
                selectedDevice = null;
                setSelRing(null);
                renderStatus('Өөр төхөөрөмж сонгоно уу', '');
                return;
            }

            // Аль хэдийн холбогдсон эсэх шалгах
            const key = pairKey(selectedDevice.id, dev.id);
            if (connectedPairs.has(key)) {
                showFeedback('Аль хэдийн холбогдсон байна!', 'warn');
                selectedDevice = null;
                setSelRing(null);
                selectedCable = null;
                setCableHighlight(null);
                renderStatus('Кабель сонгоно уу', 'ханан дээр байгаа кабелиас нэгийг сонгоно уу');
                return;
            }

            // Зөв/буруу шалгах
            const valid = isValid(selectedDevice.type, dev.type, selectedCable);
            createLine(selectedDevice, dev, valid);

            if (valid) {
                score++;
                connectedPairs.add(key);
                renderScore();
                showFeedback(`Зөв! ${selectedDevice.label} ↔ ${dev.label}   +1 оноо`, 'ok');
            } else {
                const cd = CABLE_DEFS.find(c => c.id === selectedCable);
                showFeedback(`Буруу кабель! ${cd.label} тохирохгүй`, 'err');
            }

            // Дахин тохируулах
            selectedDevice = null;
            selectedCable = null;
            setSelRing(null);
            setCableHighlight(null);
            renderStatus('Кабель сонгоно уу', 'ханан дээр байгаа кабелиас нэгийг сонгоно уу');
        }
    };

    // ======================
    // UPDATE LOOP
    // ======================
    // ======================
    // МУБСИ БААВГАЙ — model2.png
    // ======================
    let bearGroup3 = null;
    new THREE.TextureLoader().load("./assets/model2.png", (tex) => {
        const aspect = tex.image.width / tex.image.height;
        const h = 1.9;
        const w = h * aspect;

        bearGroup3 = new THREE.Group();
        bearGroup3.position.set(4.0, h / 2, 2.5);
        room.add(bearGroup3);

        const bearPlane3 = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 })
        );
        bearPlane3.userData = { kind: "roomAudio" };
        bearGroup3.add(bearPlane3);

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(w * 0.3, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(4.0, 0.01, 2.5);
        room.add(shadow);
    });

    // АУДИО
    const roomAudio3 = new Audio("./assets/room3.m4a");
    roomAudio3.loop = false;
    room.userData.toggleAudio = () => {
        if (roomAudio3.paused) { roomAudio3.currentTime = 0; roomAudio3.play(); }
        else { roomAudio3.pause(); }
    };

    room.userData.update = (delta, camera) => {
        const t = performance.now() * 0.001;

        // Feedback таймер
        if (feedMesh.visible) {
            feedTimer -= delta;
            if (feedTimer <= 0) feedMesh.visible = false;
        }

        // Холболтын шугамнуудын анимац
        for (let i = connections.length - 1; i >= 0; i--) {
            const c = connections[i];
            if (c.valid) {
                c.dots.forEach(dot => {
                    dot.userData.t = (dot.userData.t + delta * 0.38) % 1;
                    dot.position.lerpVectors(c.posA, c.posB, dot.userData.t);
                });
            } else {
                c.flashTimer += delta;
                if (c.flashTimer >= 0.25) {
                    c.flashTimer = 0;
                    c.flashCount++;
                    c.line.visible = !c.line.visible;
                }
                if (c.flashCount >= 6) {
                    room.remove(c.line);
                    connections.splice(i, 1);
                }
            }
        }

        // Сонголтын тойрог эргэлт
        if (selRing) selRing.rotation.z = t * 1.6;

        // Кабелийн гэрэл анивчих
        cableGlowLights.forEach((gl, i) => {
            const base = (!selectedCable || CABLE_DEFS[i].id === selectedCable) ? 0.8 : 0.08;
            gl.intensity = base + Math.sin(t * 2.2 + i * 1.1) * 0.15;
        });

        // Буцах хаалга анивчих
        backDoor.material.opacity = 0.65 + Math.sin(t * 1.8) * 0.2;

        // Billboard
        if (bearGroup3 && camera) {
            bearGroup3.rotation.y = Math.atan2(
                camera.position.x - bearGroup3.position.x,
                camera.position.z - bearGroup3.position.z
            );
        }
    };

    room.userData.onKey = () => {};

    // ======================
    // VR ТОВЧ ФУНКЦҮҮД
    // ======================
    const routerPowerState = {};
    DEVICE_DEFS.filter(d => d.type === 'router').forEach(d => { routerPowerState[d.id] = true; });

    // X товч — Straight кабель сонгох
    // Y товч — Crossover кабель сонгох
    room.userData.selectCable = (id) => {
        const cd = CABLE_DEFS.find(c => c.id === id);
        if (!cd) return;
        selectedCable = id;
        selectedDevice = null;
        setSelRing(null);
        setCableHighlight(id);
        renderStatus(`${cd.label} сонгогдлоо`, '1-р төхөөрөмжийг дарна уу', cd.hex);
        showFeedback(`${cd.label} кабель сонгогдлоо`, 'ok');
    };

    // B товч — Сүүлийн холболтыг арилгах
    room.userData.undoLastConnection = () => {
        if (!connections.length) {
            showFeedback('Арилгах холболт байхгүй', 'warn');
            return;
        }
        const c = connections[connections.length - 1];
        if (c.valid) {
            const key = pairKey(c.devA.id, c.devB.id);
            connectedPairs.delete(key);
            score = Math.max(0, score - 1);
            renderScore();
        }
        room.remove(c.line);
        c.dots.forEach(dot => room.remove(dot));
        connections.pop();
        selectedCable = null;
        selectedDevice = null;
        setSelRing(null);
        setCableHighlight(null);
        showFeedback('Сүүлийн холболт арилгагдлаа', 'warn');
        renderStatus('Кабель сонгоно уу', 'ханан дээр байгаа кабелиас нэгийг сонгоно уу');
    };

    // A товч — Router 1 асаах/унтраах
    room.userData.toggleRouterPower = () => {
        routerPowerState['router1'] = !routerPowerState['router1'];
        const on = routerPowerState['router1'];
        const dev = deviceObjects.find(d => d.id === 'router1');
        if (!dev) return;
        dev.mesh.traverse(child => {
            if (child.isMesh && child.material?.emissive) {
                child.material.emissiveIntensity = on ? 2 : 0;
            }
        });
        showFeedback(`Router 1 ${on ? 'асаагдлаа ✓' : 'унтрагдлаа'}`, on ? 'ok' : 'warn');
    };

    return room;
}
