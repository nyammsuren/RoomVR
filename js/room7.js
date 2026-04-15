import * as THREE from "three";

export function createRoom7(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 8, RH = 4, RD = 10;

    function mat(color, rough = 0.8, metal = 0.0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    // ======================
    // FLOOR — raised floor grid
    // ======================
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x0e0e18, 0.95));
    floor.rotation.x = -Math.PI / 2;
    floor.userData = { teleport: true };
    room.add(floor);

    const gridMat = mat(0x1a1a30, 1.0);
    for (let x = -RW / 2; x <= RW / 2; x += 0.6) {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(0.012, RD), gridMat);
        l.rotation.x = -Math.PI / 2; l.position.set(x, 0.001, 0); room.add(l);
    }
    for (let z = -RD / 2; z <= RD / 2; z += 0.6) {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.012), gridMat);
        l.rotation.x = -Math.PI / 2; l.position.set(0, 0.001, z); room.add(l);
    }

    // ======================
    // CEILING & WALLS
    // ======================
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x0a0a14, 0.9));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; room.add(ceil);

    [
        [RW, RH, [0, RH/2, -RD/2], 0],
        [RW, RH, [0, RH/2,  RD/2], Math.PI],
        [RD, RH, [-RW/2, RH/2, 0],  Math.PI/2],
        [RD, RH, [ RW/2, RH/2, 0], -Math.PI/2],
    ].forEach(([w, h, pos, ry]) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(0x0b0c18, 0.9));
        wall.position.set(...pos); wall.rotation.y = ry; room.add(wall);
    });

    // ======================
    // LIGHTS
    // ======================
    room.add(new THREE.AmbientLight(0x08102a, 1.0));
    const bl1 = new THREE.PointLight(0x0044ff, 0.7, 6); bl1.position.set(0, 2.2, -2); room.add(bl1);
    const bl2 = new THREE.PointLight(0x0044ff, 0.7, 6); bl2.position.set(0, 2.2,  2); room.add(bl2);

    // ======================
    // LED STRIPS
    // ======================
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, emissive: 0x0033cc, emissiveIntensity: 2.5 });
    [-RW/2+0.04, RW/2-0.04].forEach(x => {
        [0.02, RH-0.06].forEach(y => {
            const s = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, RD-0.2), ledMat);
            s.position.set(x, y, 0); room.add(s);
        });
    });

    // ======================
    // CABLE TRAYS — ceiling
    // ======================
    const trayMat = mat(0x181820, 0.7, 0.6);
    [-2, 0, 2].forEach(x => {
        const tray = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, RD-0.4), trayMat);
        tray.position.set(x, RH-0.15, 0); room.add(tray);
        for (let z = -RD/2+0.5; z < RD/2; z += 0.8) {
            const c = new THREE.Mesh(
                new THREE.CylinderGeometry(0.006, 0.006, 0.3+Math.random()*0.2, 4),
                new THREE.MeshStandardMaterial({ color: 0x223344 })
            );
            c.position.set(x+(Math.random()-0.5)*0.15, RH-0.32, z); room.add(c);
        }
    });

    // ======================
    // SERVER RACKS — 2 rows × 4
    // ======================
    const rackDefs = [
        { x: -2.8, z: -3.5, side: "left" }, { x: -2.8, z: -1.2, side: "left" },
        { x: -2.8, z:  1.2, side: "left" }, { x: -2.8, z:  3.5, side: "left" },
        { x:  2.8, z: -3.5, side: "right" }, { x:  2.8, z: -1.2, side: "right" },
        { x:  2.8, z:  1.2, side: "right" }, { x:  2.8, z:  3.5, side: "right" },
    ];
    const rackPanels = [];

    rackDefs.forEach((def, rackIdx) => {
        const g = new THREE.Group();
        g.position.set(def.x, 0, def.z);
        g.rotation.y = def.side === "left" ? Math.PI/2 : -Math.PI/2;

        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 1.0), mat(0x0d0d0d, 0.5, 0.4));
        cab.position.y = 1.1; g.add(cab);

        const topEdge = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 1.02),
            new THREE.MeshStandardMaterial({ color: 0x003366, emissive: 0x001133, emissiveIntensity: 1.5 }));
        topEdge.position.y = 2.215; g.add(topEdge);

        [[-0.3,-0.44],[-0.3,0.44],[0.3,-0.44],[0.3,0.44]].forEach(([dx,dz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.12,0.06), mat(0x1a1a1a,0.4,0.6));
            leg.position.set(dx, 0.06, dz); g.add(leg);
        });

        const cvs = document.createElement("canvas");
        cvs.width = 256; cvs.height = 896;
        const ctx = cvs.getContext("2d");
        const tex = new THREE.CanvasTexture(cvs);

        function drawPanel(blink) {
            ctx.fillStyle = "#080810"; ctx.fillRect(0, 0, 256, 896);
            ctx.fillStyle = "#111122"; ctx.fillRect(0, 0, 256, 42);
            ctx.fillStyle = "#4466aa"; ctx.font = "bold 16px monospace"; ctx.textAlign = "center";
            ctx.fillText(`RACK-${String(rackIdx+1).padStart(2,"0")}`, 128, 28);
            const unitH = 48;
            for (let s = 0; s < 17; s++) {
                const sy = 46 + s * unitH;
                if (s >= 14) { ctx.fillStyle = "#0a0a0a"; ctx.fillRect(6, sy+2, 244, unitH-4); continue; }
                ctx.fillStyle = "#0d1020"; ctx.fillRect(6, sy+2, 244, unitH-4);
                ctx.strokeStyle = "#1a2040"; ctx.lineWidth = 1; ctx.strokeRect(6, sy+2, 244, unitH-4);
                ctx.fillStyle = "#3a5070"; ctx.font = "13px monospace"; ctx.textAlign = "left";
                ctx.fillText(`SRV-${String(rackIdx*14+s+1).padStart(3,"0")}`, 14, sy+unitH*0.58);
                const pOn = blink ? Math.random() > 0.05 : true;
                ctx.fillStyle = pOn ? "#00ee44" : "#003311";
                ctx.beginPath(); ctx.arc(228, sy+14, 5, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = Math.random()>0.4 ? "#0088ff" : "#001133";
                ctx.beginPath(); ctx.arc(214, sy+14, 4, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = Math.random()>0.65 ? "#ff7700" : "#221100";
                ctx.beginPath(); ctx.arc(200, sy+14, 4, 0, Math.PI*2); ctx.fill();
                const cpu = 20 + Math.random() * 70;
                ctx.fillStyle = "#111a11"; ctx.fillRect(14, sy+unitH-14, 200, 8);
                ctx.fillStyle = cpu>80?"#ff4400":cpu>60?"#ffaa00":"#00cc33";
                ctx.fillRect(14, sy+unitH-14, 200*(cpu/100), 8);
                tex.needsUpdate = true;
            }
            tex.needsUpdate = true;
        }
        drawPanel(false);

        const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 2.05),
            new THREE.MeshBasicMaterial({ map: tex }));
        panel.position.set(0, 1.1, 0.51); g.add(panel);
        room.add(g);
        rackPanels.push(drawPanel);
    });

    // ======================
    // MAIN MONITORING WALL
    // ======================
    const monCvs = document.createElement("canvas");
    monCvs.width = 1024; monCvs.height = 512;
    const monCtx = monCvs.getContext("2d");
    const monTex = new THREE.CanvasTexture(monCvs);

    const monFrm = new THREE.Mesh(new THREE.BoxGeometry(3.9, 2.1, 0.08), mat(0x0c0c0c, 0.4, 0.6));
    monFrm.position.set(0, 2.5, -RD/2+0.02); monFrm.userData = { kind: "tv" }; room.add(monFrm);
    const monScr = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 1.95),
        new THREE.MeshBasicMaterial({ map: monTex }));
    monScr.position.set(0, 2.5, -RD/2+0.07); monScr.userData = { kind: "tv" }; room.add(monScr);
    const monLed = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.03, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x0055ff, emissive: 0x0033cc, emissiveIntensity: 2 }));
    monLed.position.set(0, 1.46, -RD/2+0.05); room.add(monLed);

    const SERVERS = [
        { name:"WEB-01", cpu:45, mem:62, status:"online",  ip:"10.0.1.10" },
        { name:"WEB-02", cpu:38, mem:58, status:"online",  ip:"10.0.1.11" },
        { name:"DB-01",  cpu:72, mem:85, status:"online",  ip:"10.0.2.10" },
        { name:"DB-02",  cpu:15, mem:71, status:"standby", ip:"10.0.2.11" },
        { name:"APP-01", cpu:55, mem:68, status:"online",  ip:"10.0.3.10" },
        { name:"APP-02", cpu:48, mem:74, status:"online",  ip:"10.0.3.11" },
        { name:"MAIL",   cpu:22, mem:44, status:"online",  ip:"10.0.4.10" },
        { name:"BACKUP", cpu: 8, mem:31, status:"online",  ip:"10.0.5.10" },
    ];

    function drawMonitor() {
        const W=1024, H=512;
        monCtx.fillStyle="#040c18"; monCtx.fillRect(0,0,W,H);
        monCtx.fillStyle="#071830"; monCtx.fillRect(0,0,W,46);
        monCtx.fillStyle="#44aaff"; monCtx.font="bold 20px monospace"; monCtx.textAlign="left";
        monCtx.fillText("⚡  SERVER MONITORING — МУБИС ДАТАЦЕНТР", 18, 30);
        monCtx.fillStyle="#336688"; monCtx.font="14px monospace"; monCtx.textAlign="right";
        monCtx.fillText(new Date().toLocaleTimeString("mn-MN"), W-18, 30);
        const cols=4, cW=(W-32)/cols, cH=(H-60)/2-8;
        SERVERS.forEach((s,i)=>{
            s.cpu = Math.max(5, Math.min(95, s.cpu+(Math.random()-0.5)*4));
            const col=i%cols, row=Math.floor(i/cols), cx=16+col*cW, cy=54+row*(cH+8);
            monCtx.fillStyle=s.cpu>80?"#1a0808":"#081420"; monCtx.fillRect(cx,cy,cW-8,cH);
            monCtx.strokeStyle=s.cpu>80?"#aa2200":"#0d3060"; monCtx.lineWidth=1; monCtx.strokeRect(cx,cy,cW-8,cH);
            const sc={online:"#00ee44",standby:"#ffaa00",offline:"#ff2200"};
            monCtx.fillStyle=sc[s.status]||"#888";
            monCtx.beginPath(); monCtx.arc(cx+13,cy+16,5,0,Math.PI*2); monCtx.fill();
            monCtx.fillStyle="#88ccff"; monCtx.font="bold 15px monospace"; monCtx.textAlign="left";
            monCtx.fillText(s.name,cx+24,cy+20);
            monCtx.fillStyle="#2a5070"; monCtx.font="11px monospace"; monCtx.fillText(s.ip,cx+8,cy+36);
            monCtx.fillStyle="#0e1e0e"; monCtx.fillRect(cx+8,cy+46,cW-24,12);
            monCtx.fillStyle=s.cpu>80?"#ff3300":s.cpu>60?"#ffaa00":"#00cc44";
            monCtx.fillRect(cx+8,cy+46,(cW-24)*(s.cpu/100),12);
            monCtx.fillStyle="#99aacc"; monCtx.font="10px monospace";
            monCtx.fillText(`CPU ${Math.floor(s.cpu)}%`,cx+10,cy+56);
            monCtx.fillStyle="#0a0a1e"; monCtx.fillRect(cx+8,cy+64,cW-24,10);
            monCtx.fillStyle="#0077dd"; monCtx.fillRect(cx+8,cy+64,(cW-24)*(s.mem/100),10);
            monCtx.fillStyle="#99aacc"; monCtx.fillText(`MEM ${s.mem}%`,cx+10,cy+73);
        });
        monCtx.fillStyle="#071830"; monCtx.fillRect(0,H-34,W,34);
        monCtx.fillStyle="#2a5888"; monCtx.font="12px monospace"; monCtx.textAlign="left";
        monCtx.fillText("▶  Бүх систем хэвийн  |  Uptime: 247 хоног  |  Rack: 8/8  |  Сервер: 112/136 идэвхтэй",16,H-12);
        monTex.needsUpdate=true;
    }
    drawMonitor();

    // ======================
    // TEMPERATURE PANEL — зүүн хана
    // ======================
    const tmpCvs = document.createElement("canvas");
    tmpCvs.width=256; tmpCvs.height=160;
    const tmpCtx=tmpCvs.getContext("2d");
    const tmpTex=new THREE.CanvasTexture(tmpCvs);

    function drawTemp() {
        tmpCtx.fillStyle="#050c14"; tmpCtx.fillRect(0,0,256,160);
        tmpCtx.strokeStyle="#0044aa"; tmpCtx.lineWidth=2; tmpCtx.strokeRect(3,3,250,154);
        tmpCtx.textAlign="center";
        tmpCtx.fillStyle="#3399ff"; tmpCtx.font="bold 13px monospace"; tmpCtx.fillText("❄  COLD AISLE",128,24);
        tmpCtx.fillStyle="#55ddff"; tmpCtx.font="bold 32px monospace";
        tmpCtx.fillText(`${(18+Math.random()*1.5).toFixed(1)}°C`,128,64);
        tmpCtx.fillStyle="#ff6600"; tmpCtx.font="bold 13px monospace"; tmpCtx.fillText("🔥  HOT AISLE",128,96);
        tmpCtx.fillStyle="#ffaa44"; tmpCtx.font="bold 28px monospace";
        tmpCtx.fillText(`${(29+Math.random()*3).toFixed(1)}°C`,128,136);
        tmpTex.needsUpdate=true;
    }
    drawTemp();

    const tmpScr = new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.7),
        new THREE.MeshBasicMaterial({ map: tmpTex }));
    tmpScr.position.set(-RW/2+0.06, 2.0, 0); tmpScr.rotation.y=Math.PI/2; room.add(tmpScr);

    // ======================
    // UPS UNITS
    // ======================
    [-2.5, 2.5].forEach(x => {
        const ups = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.4), mat(0x111111,0.5,0.3));
        ups.position.set(x, 0.25, RD/2-0.4); room.add(ups);
        const uLed = new THREE.Mesh(new THREE.BoxGeometry(0.58,0.02,0.01),
            new THREE.MeshStandardMaterial({color:0x00ff44,emissive:0x00aa22,emissiveIntensity:2}));
        uLed.position.set(x, 0.52, RD/2-0.19); room.add(uLed);
    });

    // ======================
    // TITLE
    // ======================
    const titCvs=document.createElement("canvas"); titCvs.width=512; titCvs.height=72;
    const titCtx=titCvs.getContext("2d");
    titCtx.fillStyle="#44aaff"; titCtx.font="bold 38px Arial";
    titCtx.textAlign="center"; titCtx.textBaseline="middle";
    titCtx.fillText("⚡ Серверийн өрөө", 256, 36);
    const titMesh=new THREE.Mesh(new THREE.PlaneGeometry(3.0,0.45),
        new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(titCvs),transparent:true}));
    titMesh.position.set(0, 3.65, -RD/2+0.06); room.add(titMesh);

    // ======================
    // NOTEBOOK ШИРЭЭ + ТОМХОН ДЭЛГЭЦ
    // ======================
    const TY = 0.78;
    // Ширээ
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.9), mat(0x2a1e0e, 0.7));
    desk.position.set(0, TY, -2.8); room.add(desk);
    [[0.8,0.42],[0.8,-0.42],[-0.8,0.42],[-0.8,-0.42]].forEach(([dx,dz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, TY-0.03, 0.07), mat(0x1a1a1a,0.5,0.3));
        leg.position.set(dx, (TY-0.03)/2, -2.8+dz); room.add(leg);
    });

    // Notebook суурь
    const nbBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.025, 0.9),
        mat(0x1a1a2a, 0.4, 0.5));
    nbBase.position.set(0, TY+0.013, -2.85); room.add(nbBase);

    // Notebook гар/touchpad
    const nbKbd = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.006, 0.4), mat(0x111120, 0.7));
    nbKbd.position.set(0, TY+0.026+0.003, -2.7); room.add(nbKbd);
    const nbPad = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.004, 0.2), mat(0x1a1a30, 0.4));
    nbPad.position.set(0, TY+0.026+0.002, -2.55); room.add(nbPad);

    // Notebook lid + томхон дэлгэц
    const nbLidG = new THREE.Group();
    nbLidG.position.set(0, TY+0.025, -3.15);
    room.add(nbLidG);

    const nbLid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.022), mat(0x1a1a2a, 0.4, 0.5));
    nbLid.position.set(0, 0.45, 0); nbLidG.add(nbLid);
    nbLidG.rotation.x = -0.22; // дэлгэц арагш налсан

    // Router simulation canvas
    const termW = 1200, termH = 750;
    const termCvs = document.createElement("canvas");
    termCvs.width = termW; termCvs.height = termH;
    const termCtx = termCvs.getContext("2d");
    const termTex = new THREE.CanvasTexture(termCvs);

    const termScr = new THREE.Mesh(
        new THREE.PlaneGeometry(1.32, 0.83),
        new THREE.MeshBasicMaterial({ map: termTex })
    );
    termScr.position.set(0, 0.45, 0.012);
    termScr.userData = { kind: "serverTerminal" };
    nbLidG.add(termScr);

    // Дэлгэцний гэрэл
    const termLight = new THREE.PointLight(0x88aaff, 0.6, 3);
    termLight.position.set(0, TY+0.7, -2.5); room.add(termLight);

    // ======================
    // ROUTER SIMULATION STATE
    // ======================
    // r1Done, r2Done: тохируулсан эсэх
    // termState: 0=overview, 1=r1 input, 2=r2 input
    let termState = 0;
    let currentCmd = "";
    let r1Done = false, r2Done = false;
    let r1Error = false, r2Error = false;
    let feedbackMsg = "";
    let feedbackTimer = 0;
    let feedbackOk = false;
    let cursorBlink = true;

    // Зөв тушаалын pattern: ip route 0.0.0.0 0.0.0.0 <ip>
    const DEFAULT_ROUTE_RE = /^ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+(\d{1,3}\.){3}\d{1,3}$/i;

    function drawTerminal() {
        const W = termW, H = termH;
        termCtx.fillStyle = "#0a0f18";
        termCtx.fillRect(0, 0, W, H);

        // Header
        termCtx.fillStyle = "#0d1e30";
        termCtx.fillRect(0, 0, W, 56);
        termCtx.fillStyle = "#55aaff";
        termCtx.font = "bold 26px monospace";
        termCtx.textAlign = "center";
        termCtx.fillText("🌐  Network Configuration Terminal", W/2, 36);

        if (termState === 0) {
            // ── Overview: 2 router харуулна ──
            termCtx.fillStyle = "#112030";
            termCtx.fillRect(20, 70, W-40, 130);
            termCtx.fillStyle = "#3388bb";
            termCtx.font = "18px monospace";
            termCtx.textAlign = "left";
            termCtx.fillText("Даалгавар: Рутер бүр дээр default route тохируулна уу.", 36, 100);
            termCtx.fillStyle = "#66bbdd";
            termCtx.fillText("Тушаал: ip route 0.0.0.0 0.0.0.0 <gateway_ip>", 36, 130);
            termCtx.fillStyle = "#3388bb";
            termCtx.fillText("Рутер дэлгэц дээр дарж тушаал оруулна уу.", 36, 160);

            // Router 1 box
            const r1x = 100, r1y = 230, r1w = 420, r1h = 380;
            termCtx.fillStyle = r1Done ? "#061a06" : r1Error ? "#1a0606" : "#0a1428";
            termCtx.fillRect(r1x, r1y, r1w, r1h);
            termCtx.strokeStyle = r1Done ? "#00cc44" : r1Error ? "#cc2200" : "#224488";
            termCtx.lineWidth = 3; termCtx.strokeRect(r1x, r1y, r1w, r1h);

            // Router 1 icon
            drawRouterIcon(termCtx, r1x + r1w/2, r1y + 120, r1Done ? "#00ee44" : r1Error ? "#ff4400" : "#4488ff");
            termCtx.fillStyle = r1Done ? "#00ee44" : r1Error ? "#ff6600" : "#88ccff";
            termCtx.font = "bold 26px monospace"; termCtx.textAlign = "center";
            termCtx.fillText("Router 1", r1x + r1w/2, r1y + 240);
            termCtx.fillStyle = "#4477aa"; termCtx.font = "18px monospace";
            termCtx.fillText("192.168.1.0/24", r1x + r1w/2, r1y + 272);
            termCtx.fillText("GW: 192.168.1.1", r1x + r1w/2, r1y + 300);

            if (r1Done) {
                termCtx.fillStyle = "#00ee44"; termCtx.font = "bold 20px monospace";
                termCtx.fillText("✅ Тохируулсан", r1x + r1w/2, r1y + 348);
            } else if (r1Error) {
                termCtx.fillStyle = "#ff6600"; termCtx.font = "16px monospace";
                termCtx.fillText("❌ Алдаа — дахин оролдоно уу", r1x + r1w/2, r1y + 348);
            } else {
                termCtx.fillStyle = "#336699"; termCtx.font = "16px monospace";
                termCtx.fillText("[ Дарж тохируулна уу ]", r1x + r1w/2, r1y + 348);
            }

            // Router 2 box
            const r2x = 680, r2y = 230, r2w = 420, r2h = 380;
            termCtx.fillStyle = r2Done ? "#061a06" : r2Error ? "#1a0606" : "#0a1428";
            termCtx.fillRect(r2x, r2y, r2w, r2h);
            termCtx.strokeStyle = r2Done ? "#00cc44" : r2Error ? "#cc2200" : "#224488";
            termCtx.lineWidth = 3; termCtx.strokeRect(r2x, r2y, r2w, r2h);

            drawRouterIcon(termCtx, r2x + r2w/2, r2y + 120, r2Done ? "#00ee44" : r2Error ? "#ff4400" : "#4488ff");
            termCtx.fillStyle = r2Done ? "#00ee44" : r2Error ? "#ff6600" : "#88ccff";
            termCtx.font = "bold 26px monospace"; termCtx.textAlign = "center";
            termCtx.fillText("Router 2", r2x + r2w/2, r2y + 240);
            termCtx.fillStyle = "#4477aa"; termCtx.font = "18px monospace";
            termCtx.fillText("10.0.0.0/8", r2x + r2w/2, r2y + 272);
            termCtx.fillText("GW: 10.0.0.1", r2x + r2w/2, r2y + 300);

            if (r2Done) {
                termCtx.fillStyle = "#00ee44"; termCtx.font = "bold 20px monospace";
                termCtx.fillText("✅ Тохируулсан", r2x + r2w/2, r2y + 348);
            } else if (r2Error) {
                termCtx.fillStyle = "#ff6600"; termCtx.font = "16px monospace";
                termCtx.fillText("❌ Алдаа — дахин оролдоно уу", r2x + r2w/2, r2y + 348);
            } else {
                termCtx.fillStyle = "#336699"; termCtx.font = "16px monospace";
                termCtx.fillText("[ Дарж тохируулна уу ]", r2x + r2w/2, r2y + 348);
            }

            // Center arrow
            termCtx.strokeStyle = "#224466"; termCtx.lineWidth = 3;
            termCtx.beginPath(); termCtx.moveTo(540, 430); termCtx.lineTo(660, 430); termCtx.stroke();
            termCtx.fillStyle = "#224466"; termCtx.font = "24px monospace"; termCtx.textAlign = "center";
            termCtx.fillText("↔", 600, 436);

            // Both done message
            if (r1Done && r2Done) {
                termCtx.fillStyle = "rgba(0,20,0,0.88)";
                termCtx.fillRect(160, 650, W-320, 80);
                termCtx.strokeStyle = "#00ff44"; termCtx.lineWidth = 2;
                termCtx.strokeRect(160, 650, W-320, 80);
                termCtx.fillStyle = "#00ff88"; termCtx.font = "bold 28px Arial"; termCtx.textAlign = "center";
                termCtx.fillText("🎉  Сүлжээ амжилттай тохирууллаа!", W/2, 697);
            }

        } else {
            // ── Command input mode ──
            const rName = termState === 1 ? "Router 1" : "Router 2";
            const rGW   = termState === 1 ? "192.168.1.1" : "10.0.0.1";
            const rNet  = termState === 1 ? "192.168.1.0/24" : "10.0.0.0/8";

            // Router info
            termCtx.fillStyle = "#0d1e30"; termCtx.fillRect(20, 70, W-40, 90);
            termCtx.fillStyle = "#88ccff"; termCtx.font = "bold 22px monospace"; termCtx.textAlign = "left";
            termCtx.fillText(`${rName} — Default Route тохируулна уу`, 36, 100);
            termCtx.fillStyle = "#4477aa"; termCtx.font = "17px monospace";
            termCtx.fillText(`Сүлжээ: ${rNet}  |  Gateway: ${rGW}`, 36, 132);

            // Terminal area
            termCtx.fillStyle = "#050c0a"; termCtx.fillRect(20, 180, W-40, H-240);
            termCtx.strokeStyle = "#0d3020"; termCtx.lineWidth = 1;
            termCtx.strokeRect(20, 180, W-40, H-240);

            termCtx.fillStyle = "#00cc44"; termCtx.font = "20px monospace"; termCtx.textAlign = "left";
            termCtx.fillText(`${rName}(config)#`, 40, 240);

            // Command line
            const prompt = `${rName}(config)# `;
            const cursor = cursorBlink ? "█" : " ";
            termCtx.fillStyle = "#00ff88"; termCtx.font = "bold 22px monospace";
            termCtx.fillText(prompt + currentCmd + cursor, 40, 320);

            // Hint
            termCtx.fillStyle = "#224433"; termCtx.font = "16px monospace";
            termCtx.fillText(`Жишээ: ip route 0.0.0.0 0.0.0.0 ${rGW}`, 40, H-80);
            termCtx.fillStyle = "#1a3322";
            termCtx.fillText("[Enter] илгээх   [Esc] буцах   [Backspace] устгах", 40, H-50);

            // Feedback
            if (feedbackMsg && feedbackTimer > 0) {
                termCtx.fillStyle = feedbackOk ? "rgba(0,40,0,0.92)" : "rgba(40,0,0,0.92)";
                termCtx.fillRect(20, H-160, W-40, 60);
                termCtx.strokeStyle = feedbackOk ? "#00ff44" : "#ff2200"; termCtx.lineWidth = 2;
                termCtx.strokeRect(20, H-160, W-40, 60);
                termCtx.fillStyle = feedbackOk ? "#00ff88" : "#ff6666";
                termCtx.font = "bold 22px Arial"; termCtx.textAlign = "center";
                termCtx.fillText(feedbackMsg, W/2, H-122);
            }
        }

        termTex.needsUpdate = true;
    }

    function drawRouterIcon(ctx, cx, cy, color) {
        // Router body
        ctx.fillStyle = color === "#4488ff" ? "#1a2a40" : color === "#00ee44" ? "#0a2010" : "#2a0a0a";
        ctx.fillRect(cx-50, cy-28, 100, 56);
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(cx-50, cy-28, 100, 56);
        // Ports
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = color; ctx.fillRect(cx-38+i*20, cy+10, 14, 10);
        }
        // LED
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx+36, cy-16, 5, 0, Math.PI*2); ctx.fill();
        // Antenna
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx-20, cy-28); ctx.lineTo(cx-20, cy-60); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+20, cy-28); ctx.lineTo(cx+20, cy-60); ctx.stroke();
    }

    drawTerminal();

    // ======================
    // NOTEBOOK САНДАЛ
    // ======================
    const nbChairX = 0, nbChairZ = -1.8;
    const chM  = mat(0x2a3a5a, 0.6);
    const chLM = mat(0x1a1a1a, 0.4, 0.4);
    const nbChG = new THREE.Group();
    nbChG.position.set(nbChairX, 0, nbChairZ);

    const nbSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.46), chM);
    nbSeat.position.set(0, 0.50, 0);
    nbSeat.userData = {
        kind: "studentChair",
        sitX: nbChairX, sitY: 1.1, sitZ: nbChairZ,
        lookX: 0, lookY: TY + 0.5, lookZ: -3.15
    };
    nbChG.add(nbSeat);

    const nbBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.46, 0.06), chM);
    nbBack.position.set(0, 0.78, 0.22); nbBack.userData = nbSeat.userData; nbChG.add(nbBack);

    [[0.2,0.2],[0.2,-0.2],[-0.2,0.2],[-0.2,-0.2]].forEach(([dx,dz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.5, 0.045), chLM);
        leg.position.set(dx, 0.25, dz); nbChG.add(leg);
    });
    [0.2, -0.2].forEach(dx => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.46, 0.045), chLM);
        p.position.set(dx, 0.76, 0.22); nbChG.add(p);
    });

    room.add(nbChG);

    // Сандалын label
    const slCvs = document.createElement("canvas"); slCvs.width=192; slCvs.height=48;
    const slCtx = slCvs.getContext("2d");
    slCtx.fillStyle="rgba(0,0,0,0.6)"; slCtx.fillRect(0,0,192,48);
    slCtx.fillStyle="#ffdd44"; slCtx.font="bold 24px Arial";
    slCtx.textAlign="center"; slCtx.textBaseline="middle"; slCtx.fillText("Суух",96,24);
    const slMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.1),
        new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(slCvs),transparent:true,depthTest:false}));
    slMesh.position.set(nbChairX, 0.56, nbChairZ);
    slMesh.rotation.x = -Math.PI/2;
    slMesh.userData = nbSeat.userData;
    room.add(slMesh);

    // ======================
    // BACK DOOR
    // ======================
    const backDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x112233, transparent: true, opacity: 0.8 }));
    backDoor.position.set(0, 1.1, RD/2-0.08);
    backDoor.userData = { kind: "backDoor" };
    room.add(backDoor);

    const dlCvs=document.createElement("canvas"); dlCvs.width=256; dlCvs.height=64;
    const dlCtx=dlCvs.getContext("2d");
    dlCtx.fillStyle="rgba(0,20,40,0.85)"; dlCtx.fillRect(0,0,256,64);
    dlCtx.fillStyle="#44aaff"; dlCtx.font="bold 24px Arial";
    dlCtx.textAlign="center"; dlCtx.textBaseline="middle"; dlCtx.fillText("← Буцах",128,32);
    const dlLbl=new THREE.Sprite(new THREE.SpriteMaterial({
        map:new THREE.CanvasTexture(dlCvs), transparent:true }));
    dlLbl.position.set(0, 2.6, RD/2-0.08); dlLbl.scale.set(1.2,0.3,1); room.add(dlLbl);

    const portalRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.09, 16, 48),
        new THREE.MeshStandardMaterial({ color:0x0066ff, emissive:0x0033cc, emissiveIntensity:2.5,
            transparent:true, opacity:0.9 }));
    portalRing.position.set(0, 1.2, RD/2-0.1); room.add(portalRing);

    // ======================
    // HTML INPUT — VR virtual keyboard-д зориулсан
    // ======================
    let termInput = null;
    let termForm  = null;

    function openTermInput() {
        if (termForm) return;
        termForm = document.createElement("form");
        termForm.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:9999;";

        termInput = document.createElement("input");
        termInput.style.cssText = "width:500px;padding:12px 16px;font:20px monospace;background:#0a0f18;color:#00ff88;border:2px solid #00ff88;border-radius:6px;outline:none;";
        termInput.placeholder = "ip route 0.0.0.0 0.0.0.0 <gateway>...";
        termInput.value = currentCmd;

        const sendBtn = document.createElement("button");
        sendBtn.type = "submit";
        sendBtn.textContent = "→";
        sendBtn.style.cssText = "padding:12px 18px;font:20px monospace;background:#0a2a10;color:#00ff88;border:2px solid #00ff88;border-radius:6px;cursor:pointer;";

        termForm.appendChild(termInput);
        termForm.appendChild(sendBtn);
        document.body.appendChild(termForm);

        termInput.addEventListener("input", () => {
            currentCmd = termInput.value;
            drawTerminal();
        });
        // form submit — Enter болон → товч хоёулаа
        termForm.addEventListener("submit", (e) => {
            e.preventDefault();
            room.userData.onKey("Enter");
        });
        termInput.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Escape") { e.preventDefault(); room.userData.onKey("Escape"); }
        });
        setTimeout(() => termInput?.focus(), 50);
    }

    function closeTermInput() {
        if (termForm) { termForm.remove(); termForm = null; }
        termInput = null;
    }

    // ======================
    // CLICK HANDLER
    // ======================
    room.userData.onClick = (raycaster) => {
        const hits = raycaster.intersectObjects(room.children, true);
        for (const hit of hits) {
            if (hit.object === termScr && hit.uv) {
                const u = hit.uv.x;
                if (termState === 0) {
                    // Overview: зүүн тал = Router1, баруун тал = Router2
                    termState = u < 0.5 ? 1 : 2;
                    currentCmd = "";
                    openTermInput();
                    drawTerminal();
                }
                return;
            }
        }
    };

    // ======================
    // KEYBOARD HANDLER
    // ======================
    room.userData.onKey = (key) => {
        if (termState === 0) return;
        if (key === "Escape") {
            termState = 0; currentCmd = ""; feedbackMsg = "";
            closeTermInput(); drawTerminal(); return;
        }
        if (key === "Enter") {
            const cmd = currentCmd.trim();
            closeTermInput();
            if (!cmd) { termState = 0; currentCmd = ""; drawTerminal(); return; }
            const expectedGW = termState === 1 ? "192.168.1.1" : "10.0.0.1";
            const fmtOk  = DEFAULT_ROUTE_RE.test(cmd);
            const gwMatch = cmd.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
            const gwOk   = gwMatch && gwMatch[0] === expectedGW;
            if (fmtOk && gwOk) {
                if (termState === 1) { r1Done = true; r1Error = false; }
                else                 { r2Done = true; r2Error = false; }
                feedbackMsg = "✅  Сүлжээ амжилттай тохирууллаа!";
                feedbackOk = true;
            } else {
                if (termState === 1) r1Error = true;
                else                 r2Error = true;
                feedbackMsg = "❌  Сүлжээ тохируулахад алдаа гарлаа!";
                feedbackOk = false;
            }
            // termState хэвээр үлдэнэ — feedback харуулна, 2.5с дараа update loop state=0 болгоно
            feedbackTimer = 2.5;
            currentCmd = "";
            drawTerminal(); return;
        }
        // HTML input байхгүй үед (window keydown-аас) гараар бичих
        if (!termInput) {
            if (key === "Backspace") { currentCmd = currentCmd.slice(0, -1); }
            else if (key.length === 1 && currentCmd.length < 60) { currentCmd += key; }
            drawTerminal();
        }
    };

    // ======================
    // UPDATE LOOP
    // ======================
    let blinkTimer=0, blinkOn=false, monTimer=0, tmpTimer=0, cursorTimer=0;

    room.userData.onLeave = () => {
        closeTermInput();
        termState = 0; currentCmd = ""; feedbackMsg = ""; feedbackTimer = 0;
    };

    room.userData.update = (delta) => {
        blinkTimer += delta;
        if (blinkTimer > 0.35) {
            blinkTimer = 0; blinkOn = !blinkOn;
            rackPanels.forEach(fn => fn(blinkOn));
        }
        monTimer += delta; if (monTimer > 1.5) { monTimer = 0; drawMonitor(); }
        tmpTimer += delta; if (tmpTimer > 3.0) { tmpTimer = 0; drawTemp(); }

        if (feedbackTimer > 0) {
            feedbackTimer -= delta;
            if (feedbackTimer <= 0) {
                feedbackMsg = "";
                // Feedback дууссаны дараа overview руу буцна
                if (termState !== 0) { termState = 0; currentCmd = ""; }
                drawTerminal();
            }
        }

        cursorTimer += delta;
        if (cursorTimer > 0.5) { cursorTimer = 0; cursorBlink = !cursorBlink; if (termState !== 0) drawTerminal(); }

        portalRing.rotation.z += delta * 0.8;
        portalRing.material.opacity = 0.7 + Math.sin(performance.now()*0.002)*0.2;
    };

    return room;
}
