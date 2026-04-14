import * as THREE from "three";

export function createRoom4(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 10, RH = 5, RD = 10;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    // ГЭРЭЛ
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

    // ТААЗНЫ ГЭРЭЛ
    [[-2, 0], [2, 0], [0, -2], [0, 2]].forEach(([x, z]) => {
        const l = new THREE.PointLight(0xaa44ff, 2.0, 6);
        l.position.set(x, RH - 0.3, z);
        room.add(l);
    });

    // ГАРЧИГ
    const titleCvs = document.createElement("canvas");
    titleCvs.width = 768; titleCvs.height = 128;
    const tctx = titleCvs.getContext("2d");
    tctx.clearRect(0, 0, 768, 128);
    tctx.fillStyle = "#cc44ff";
    tctx.font = "bold 64px Arial";
    tctx.textAlign = "center"; tctx.textBaseline = "middle";
    tctx.fillText("AR лаборатори", 384, 64);
    const titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 0.58),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(titleCvs), transparent: true })
    );
    titleMesh.position.set(0, 4.3, -RD / 2 + 0.05);
    room.add(titleMesh);

    // ======================
    // ТОПОЛОГИ СОНГОХ ТОВЧНУУД — урд хананд
    // ======================
    const TOPOS = [
        { id: 'star', label: 'Star',  color: '#00aaff', hex: 0x00aaff, z:  3.0 },
        { id: 'bus',  label: 'Bus',   color: '#00ff88', hex: 0x00ff88, z:  1.0 },
        { id: 'ring', label: 'Ring',  color: '#ff8800', hex: 0xff8800, z: -1.0 },
        { id: 'mesh', label: 'Mesh',  color: '#ff44aa', hex: 0xff44aa, z: -3.0 },
    ];

    // "Сүлжээний топологи" гарчиг
    const panelTitleCvs = document.createElement("canvas");
    panelTitleCvs.width = 900; panelTitleCvs.height = 80;
    const ptc = panelTitleCvs.getContext("2d");
    ptc.clearRect(0, 0, 900, 80);
    ptc.fillStyle = "#ddaaff";
    ptc.font = "bold 48px Arial";
    ptc.textAlign = "center"; ptc.textBaseline = "middle";
    ptc.fillText("Сүлжээний топологи", 450, 40);
    const panelTitle = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 0.4),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(panelTitleCvs), transparent: true })
    );
    panelTitle.position.set(-RW / 2 + 0.04, 3.6, 0);
    panelTitle.rotation.y = Math.PI / 2;
    room.add(panelTitle);

    const topoBtns = [];

    TOPOS.forEach(({ id, label, color, hex, z }) => {
        const cvs = document.createElement("canvas");
        cvs.width = 256; cvs.height = 96;
        const ctx = cvs.getContext("2d");

        function drawBtn(active) {
            ctx.clearRect(0, 0, 256, 96);
            ctx.fillStyle = active ? color : "rgba(40,10,60,0.85)";
            ctx.roundRect?.(4, 4, 248, 88, 14) ?? ctx.fillRect(4, 4, 248, 88);
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.roundRect?.(4, 4, 248, 88, 14) ?? ctx.strokeRect(4, 4, 248, 88);
            ctx.stroke();
            ctx.fillStyle = active ? "#000000" : color;
            ctx.font = "bold 46px Arial";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(label, 128, 48);
        }

        drawBtn(false);
        const tex = new THREE.CanvasTexture(cvs);
        const btn = new THREE.Mesh(
            new THREE.PlaneGeometry(1.8, 0.68),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
        );
        btn.position.set(-RW / 2 + 0.04, 2.9, z);
        btn.rotation.y = Math.PI / 2;
        btn.userData = { kind: 'topoBtn', topoId: id };
        btn._cvs = cvs; btn._ctx = ctx; btn._tex = tex;
        btn._drawBtn = drawBtn;
        room.add(btn);
        topoBtns.push(btn);

        // Гэрэл
        const bl = new THREE.PointLight(hex, 0.4, 2.5);
        bl.position.set(-RW / 2 + 0.6, 2.9, z);
        room.add(bl);
    });

    // ======================
    // ТОПОЛОГИ ДЭЛГЭЦ (өрөөний дунд эргэдэг бүлэг)
    // ======================
    const displayGroup = new THREE.Group();
    displayGroup.position.set(0, 1.6, 0);
    room.add(displayGroup);

    // Нэмэлт гэрэл топологийн орчинд
    const topoLight = new THREE.PointLight(0xffffff, 1.2, 6);
    topoLight.position.set(0, 3, 0);
    room.add(topoLight);

    // Товч зурах тусгай функц (cylinder between two points)
    function makeCylLine(a, b, color = 0x88aaff, r = 0.018) {
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(r, r, len, 6),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 })
        );
        cyl.position.copy(mid);
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return cyl;
    }

    function makeLabel(text, color = "#ffffff") {
        const c = document.createElement("canvas");
        c.width = 256; c.height = 64;
        const cx = c.getContext("2d");
        cx.clearRect(0, 0, 256, 64);
        cx.fillStyle = color;
        cx.font = "bold 36px Arial";
        cx.textAlign = "center"; cx.textBaseline = "middle";
        cx.fillText(text, 128, 32);
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(0.55, 0.14),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false })
        );
        return m;
    }

    function makeNode(type, label, color) {
        const g = new THREE.Group();
        let body;
        if (type === 'hub' || type === 'switch') {
            body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.13, 0.07, 10),
                new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.4 })
            );
        } else {
            body = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.14, 0.18),
                new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2, roughness: 0.5 })
            );
        }
        body.castShadow = true;
        g.add(body);
        const lbl = makeLabel(label, "#ffffff");
        lbl.position.set(0, 0.18, 0);
        g.add(lbl);
        // Жижиг гэрэл
        const nl = new THREE.PointLight(color, 0.5, 0.8);
        g.add(nl);
        return g;
    }

    // ======================
    // ТОПОЛОГИ БҮТЭЭГЧ ФУНКЦҮҮД
    // ======================
    // OSI ЗАГВАР — баруун хананд
    // ======================
    const OSI_LAYERS = [
        { n: 7, name: 'Application',   mn: 'Хэрэглээний давхарга',  desc: 'HTTP, FTP, DNS, SMTP',   color: 0xaa44ff, hex: '#aa44ff',
          info: ['Хэрэглэгчтэй шууд харьцах давхарга', 'Протокол: HTTP, HTTPS, FTP, SMTP, DNS, DHCP, POP3', 'Веб хөтөч, и-мэйл, файл дамжуулалт', 'Өгөгдлийг хэрэглэгчид ойлгомжтой хэлбэрт оруулна'] },
        { n: 6, name: 'Presentation',  mn: 'Танилцуулгын давхарга', desc: 'SSL, TLS, JPEG, ASCII',  color: 0x4488ff, hex: '#4488ff',
          info: ['Өгөгдлийн форматыг хөрвүүлэх давхарга', 'Протокол: SSL, TLS, JPEG, PNG, MP3, ASCII', 'Шифрлэлт ба тайлалт (Encryption)', 'Шахалт (Compression) — өгөгдлийн хэмжээг багасгана'] },
        { n: 5, name: 'Session',       mn: 'Сессийн давхарга',      desc: 'NetBIOS, RPC, PPTP',     color: 0x00ccff, hex: '#00ccff',
          info: ['Холболтын сессийг удирдах давхарга', 'Протокол: NetBIOS, RPC, PPTP, SAP', 'Сесс нээх, хадгалах, хаах үйлдлүүд', 'Синхрончлол — өгөгдлийн дарааллыг баталгаажуулна'] },
        { n: 4, name: 'Transport',     mn: 'Тээврийн давхарга',     desc: 'TCP, UDP, порт дугаар',  color: 0x44ff88, hex: '#44ff88',
          info: ['Төгсгөл хооронд найдвартай дамжуулах давхарга', 'TCP — найдвартай, дарааллалтай (Reliable)', 'UDP — хурдан, баталгаагүй (Unreliable)', 'Порт дугаар: HTTP=80, HTTPS=443, DNS=53, FTP=21'] },
        { n: 3, name: 'Network',       mn: 'Сүлжээний давхарга',    desc: 'IP, Router, ICMP',       color: 0xffff00, hex: '#ffff00',
          info: ['Логик хаяглалт ба замчлал (Routing)', 'Протокол: IPv4, IPv6, ICMP, ARP, OSPF, BGP', 'Router — өөр сүлжээ хооронд packet дамжуулна', 'IP хаяг: 192.168.1.1 — сүлжээний бие даасан хаяг'] },
        { n: 2, name: 'Data Link',     mn: 'Өгөгдлийн холбоос',     desc: 'MAC, Switch, Ethernet',  color: 0xff8800, hex: '#ff8800',
          info: ['Физик хаяглалт ба алдааны шалгалт', 'Протокол: Ethernet, Wi-Fi (802.11), PPP', 'MAC хаяг: 00:1A:2B:3C:4D:5E — тоног төхөөрөмжийн хаяг', 'Switch — MAC хаягаар frame дамжуулна, CRC алдаа шалгана'] },
        { n: 1, name: 'Physical',      mn: 'Физик давхарга',        desc: 'Кабель, Hub, Битүүд',    color: 0xff4444, hex: '#ff4444',
          info: ['0 ба 1 битүүдийг физик дохиогоор дамжуулна', 'Орчин: UTP кабель, Fiber, Coaxial, Wi-Fi долгион', 'Тоног төхөөрөмж: Hub, Repeater, NIC карт', 'Хурд: 100Mbps, 1Gbps, 10Gbps — физик орчноос хамаарна'] },
    ];

    const layerH = 0.52;
    const layerW = 4.2;
    const startY  = 0.35;
    const wallX   = RW / 2 - 0.04;

    // OSI гарчиг
    const osiTitleCvs = document.createElement('canvas');
    osiTitleCvs.width = 512; osiTitleCvs.height = 80;
    const otc = osiTitleCvs.getContext('2d');
    otc.fillStyle = '#ddaaff';
    otc.font = 'bold 48px Arial';
    otc.textAlign = 'center'; otc.textBaseline = 'middle';
    otc.fillText('OSI загвар', 256, 40);
    const osiTitle = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.35),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(osiTitleCvs), transparent: true })
    );
    osiTitle.position.set(wallX - 0.04, startY + OSI_LAYERS.length * layerH + 0.25, 0);
    osiTitle.rotation.y = -Math.PI / 2;
    room.add(osiTitle);

    OSI_LAYERS.forEach((layer, i) => {
        const cvs = document.createElement('canvas');
        cvs.width = 1024; cvs.height = 128;
        const ctx = cvs.getContext('2d');

        // Арын өнгө
        ctx.fillStyle = layer.hex + '33';
        ctx.fillRect(0, 0, 1024, 128);
        ctx.strokeStyle = layer.hex;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 1020, 124);

        // Тоо
        ctx.fillStyle = layer.hex;
        ctx.font = 'bold 58px Arial';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(layer.n, 18, 64);

        // Англи нэр
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(layer.name, 80, 36);

        // Монгол нэр
        ctx.fillStyle = layer.hex;
        ctx.font = '26px Arial';
        ctx.fillText(layer.mn, 80, 72);

        // Протокол
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '22px Arial';
        ctx.fillText(layer.desc, 80, 104);

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(layerW, layerH - 0.04),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true, side: THREE.DoubleSide })
        );
        mesh.position.set(wallX - 0.04, startY + i * layerH + layerH / 2, 0);
        mesh.rotation.y = -Math.PI / 2;
        mesh.userData = { kind: 'osiLayer', layerIdx: i };
        room.add(mesh);

        // Давхаргын гэрэл
        const ll = new THREE.PointLight(layer.color, 0.3, 1.5);
        ll.position.set(wallX - 0.6, startY + i * layerH + layerH / 2, 0);
        room.add(ll);
    });

    // ======================
    function buildStar() {
        const g = new THREE.Group();
        const hubPos = new THREE.Vector3(0, 0, 0);
        const hub = makeNode('hub', 'Switch', 0x888888);
        hub.position.copy(hubPos);
        g.add(hub);

        const count = 5;
        const radius = 1.3;
        const pcColors = [0x00aaff, 0x00ffaa, 0xffaa00, 0xff44aa, 0xaaff00];
        const pcLabels = ['PC 1', 'PC 2', 'PC 3', 'PC 4', 'PC 5'];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const px = Math.sin(angle) * radius;
            const pz = Math.cos(angle) * radius;
            const pc = makeNode('pc', pcLabels[i], pcColors[i]);
            pc.position.set(px, 0, pz);
            g.add(pc);
            g.add(makeCylLine(hubPos, new THREE.Vector3(px, 0, pz), 0x4488ff));
        }
        return g;
    }

    function buildBus() {
        const g = new THREE.Group();
        const count = 5;
        const spacing = 1.1;
        const startX = -(count - 1) * spacing / 2;
        const busY = -0.5;
        const busA = new THREE.Vector3(startX - 0.3, busY, 0);
        const busB = new THREE.Vector3(-startX + 0.3, busY, 0);
        g.add(makeCylLine(busA, busB, 0x00ff88, 0.025));

        const pcColors = [0x00aaff, 0x00ffaa, 0xffaa00, 0xff44aa, 0xaaff00];
        const pcLabels = ['PC 1', 'PC 2', 'PC 3', 'PC 4', 'PC 5'];
        for (let i = 0; i < count; i++) {
            const px = startX + i * spacing;
            const pc = makeNode('pc', pcLabels[i], pcColors[i]);
            pc.position.set(px, 0.3, 0);
            g.add(pc);
            g.add(makeCylLine(new THREE.Vector3(px, 0.3, 0), new THREE.Vector3(px, busY, 0), 0x00ff88));
        }
        return g;
    }

    function buildRing() {
        const g = new THREE.Group();
        const count = 6;
        const radius = 1.3;
        const pcColors = [0x00aaff, 0x00ffaa, 0xffaa00, 0xff44aa, 0xaaff00, 0xaa44ff];
        const pcLabels = ['PC 1', 'PC 2', 'PC 3', 'PC 4', 'PC 5', 'PC 6'];
        const positions = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const px = Math.sin(angle) * radius;
            const pz = Math.cos(angle) * radius;
            positions.push(new THREE.Vector3(px, 0, pz));
            const pc = makeNode('pc', pcLabels[i], pcColors[i]);
            pc.position.set(px, 0, pz);
            g.add(pc);
        }
        for (let i = 0; i < count; i++) {
            g.add(makeCylLine(positions[i], positions[(i + 1) % count], 0xff8800));
        }
        return g;
    }

    function buildMesh() {
        const g = new THREE.Group();
        const count = 5;
        const radius = 1.2;
        const pcColors = [0x00aaff, 0x00ffaa, 0xffaa00, 0xff44aa, 0xaaff00];
        const pcLabels = ['Router 1', 'Router 2', 'Router 3', 'Router 4', 'Router 5'];
        const positions = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const px = Math.sin(angle) * radius;
            const pz = Math.cos(angle) * radius;
            positions.push(new THREE.Vector3(px, 0, pz));
            const pc = makeNode('pc', pcLabels[i], pcColors[i]);
            pc.position.set(px, 0, pz);
            g.add(pc);
        }
        // Бүгдийг бүгдтэй холбох (full mesh)
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                g.add(makeCylLine(positions[i], positions[j], 0xff44aa, 0.012));
            }
        }
        return g;
    }

    const topoBuilders = { star: buildStar, bus: buildBus, ring: buildRing, mesh: buildMesh };

    let currentTopoId = null;
    let currentTopoMesh = null;

    function showTopo(id) {
        if (currentTopoMesh) {
            displayGroup.remove(currentTopoMesh);
            currentTopoMesh = null;
        }
        currentTopoId = id;
        currentTopoMesh = topoBuilders[id]();
        displayGroup.add(currentTopoMesh);

        // Товчны харагдал шинэчлэх
        topoBtns.forEach(btn => {
            const active = btn.userData.topoId === id;
            btn._drawBtn(active);
            btn._tex.needsUpdate = true;
        });
    }

    // ======================
    // OSI INFO САМБАР — өрөөний дунд (дарахад гарна)
    // ======================
    const infoCvs = document.createElement('canvas');
    infoCvs.width = 1024; infoCvs.height = 512;
    const infoCtx = infoCvs.getContext('2d');
    const infoTex = new THREE.CanvasTexture(infoCvs);
    const infoPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(4.0, 2.0),
        new THREE.MeshBasicMaterial({ map: infoTex, transparent: true, side: THREE.DoubleSide, depthTest: false })
    );
    infoPanel.position.set(0, 2.5, -RD / 2 + 0.08);
    infoPanel.rotation.y = 0;
    infoPanel.visible = false;
    room.add(infoPanel);

    function showOsiInfo(layer) {
        infoCtx.clearRect(0, 0, 1024, 512);
        // Арын хайрцаг
        infoCtx.fillStyle = 'rgba(8,4,20,0.95)';
        infoCtx.fillRect(0, 0, 1024, 512);
        infoCtx.strokeStyle = layer.hex;
        infoCtx.lineWidth = 5;
        infoCtx.strokeRect(3, 3, 1018, 506);

        // Гарчиг мөр
        infoCtx.fillStyle = layer.hex + '44';
        infoCtx.fillRect(0, 0, 1024, 100);

        // Давхаргын дугаар + нэр
        infoCtx.fillStyle = layer.hex;
        infoCtx.font = 'bold 58px Arial';
        infoCtx.textAlign = 'left'; infoCtx.textBaseline = 'middle';
        infoCtx.fillText(`${layer.n}. ${layer.name}`, 24, 50);

        // Монгол нэр
        infoCtx.fillStyle = '#ffffff';
        infoCtx.font = 'bold 30px Arial';
        infoCtx.fillText(layer.mn, 24, 88);

        // Хуваагч шугам
        infoCtx.strokeStyle = layer.hex;
        infoCtx.lineWidth = 2;
        infoCtx.beginPath(); infoCtx.moveTo(20, 108); infoCtx.lineTo(1004, 108); infoCtx.stroke();

        // Дэлгэрэнгүй мэдээлэл
        infoCtx.fillStyle = '#dddddd';
        infoCtx.font = '28px Arial';
        layer.info.forEach((line, i) => {
            infoCtx.fillStyle = i === 0 ? '#ffffff' : '#cccccc';
            infoCtx.font = i === 0 ? 'bold 30px Arial' : '26px Arial';
            infoCtx.fillText('• ' + line, 30, 155 + i * 82);
        });

        // Хаах заавар
        infoCtx.fillStyle = '#666666';
        infoCtx.font = '22px Arial';
        infoCtx.textAlign = 'right';
        infoCtx.fillText('[ дахин дарж хаана ]', 1000, 490);

        infoTex.needsUpdate = true;
        infoPanel.visible = true;
    }

    // ======================
    // CLICK HANDLER
    // ======================
    room.userData.onClick = (raycaster) => {
        const hits = raycaster.intersectObjects(room.children, true);
        if (!hits.length) return;
        let obj = hits[0].object;
        while (obj && !obj.userData?.kind) obj = obj.parent;
        if (!obj?.userData?.kind) return;

        if (obj.userData.kind === 'topoBtn') {
            showTopo(obj.userData.topoId);
        } else if (obj.userData.kind === 'osiLayer') {
            const layer = OSI_LAYERS[obj.userData.layerIdx];
            if (infoPanel.visible && infoPanel._activeIdx === obj.userData.layerIdx) {
                infoPanel.visible = false;
            } else {
                infoPanel._activeIdx = obj.userData.layerIdx;
                showOsiInfo(layer);
            }
        }
    };

    // ======================
    // ХУЛГАНААР ЭРГҮҮЛЭХ
    // ======================
    let isDragging = false;
    let prevX = 0, prevY = 0;

    window.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        prevX = e.clientX; prevY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentTopoMesh) return;
        const dx = (e.clientX - prevX) * 0.012;
        const dy = (e.clientY - prevY) * 0.008;
        displayGroup.rotation.y += dx;
        displayGroup.rotation.x = Math.max(-0.8, Math.min(0.8, displayGroup.rotation.x + dy));
        prevX = e.clientX; prevY = e.clientY;
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // ======================
    // БУЦАХ ХААЛГА
    // ======================
    const doorFrame4 = new THREE.Mesh(
        new THREE.BoxGeometry(1.62, 2.62, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xbb33aa, roughness: 0.3, metalness: 0.7, emissive: 0xbb33aa, emissiveIntensity: 0.15 })
    );
    doorFrame4.position.set(0, 1.31, RD / 2 - 0.01);
    room.add(doorFrame4);

    const backDoor = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xbb33aa, transparent: true, opacity: 0.85 })
    );
    backDoor.position.set(0, 1.25, RD / 2 - 0.15);
    backDoor.userData = { kind: "backDoor" };
    room.add(backDoor);

    const lblCvs = document.createElement("canvas");
    lblCvs.width = 512; lblCvs.height = 80;
    const lctx = lblCvs.getContext("2d");
    lctx.clearRect(0, 0, 512, 80);
    lctx.fillStyle = "#ffffff";
    lctx.font = "bold 60px Arial";
    lctx.textAlign = "center"; lctx.textBaseline = "middle";
    lctx.fillText("← Угтах танхим", 256, 40);
    const lblMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.42),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lblCvs), transparent: true, depthTest: false })
    );
    lblMesh.position.set(0, 3.2, RD / 2 - 0.05);
    lblMesh.rotation.y = Math.PI;
    room.add(lblMesh);

    // ======================
    // UPDATE LOOP
    // ======================
    // ======================
    // МУБСИ БААВГАЙ — model2.png
    // ======================
    let bearGroup4 = null;
    new THREE.TextureLoader().load("./assets/model2.png", (tex) => {
        const aspect = tex.image.width / tex.image.height;
        const h = 1.9;
        const w = h * aspect;

        bearGroup4 = new THREE.Group();
        bearGroup4.position.set(3.0, h / 2, 2.0);
        room.add(bearGroup4);

        const bearPlane4 = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 })
        );
        bearPlane4.userData = { kind: "roomAudio" };
        bearGroup4.add(bearPlane4);

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(w * 0.3, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(3.0, 0.01, 2.0);
        room.add(shadow);
    });

    // АУДИО
    const roomAudio4 = new Audio("./assets/room4.m4a");
    roomAudio4.loop = false;
    room.userData.toggleAudio = () => {
        if (roomAudio4.paused) { roomAudio4.currentTime = 0; roomAudio4.play(); }
        else { roomAudio4.pause(); }
    };

    room.userData.displayGroup = displayGroup;
    room.userData.setDragging = (v) => { isDragging = v; };

    room.userData.update = (camera) => {
        backDoor.material.opacity = 0.65 + 0.2 * Math.sin(performance.now() * 0.0018);
        if (!isDragging && currentTopoMesh) {
            displayGroup.rotation.y += 0.004;
        }
        if (bearGroup4 && camera) {
            bearGroup4.rotation.y = Math.atan2(
                camera.position.x - bearGroup4.position.x,
                camera.position.z - bearGroup4.position.z
            );
        }
    };

    return room;
}
