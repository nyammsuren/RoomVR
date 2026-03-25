import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

export function createRoom1(scene, camera, renderer) {

    const room = new THREE.Group();
    scene.add(room);

    // ── CABLE RULES ──
    const CABLE_RULES = {
        'router-switch': 'straight',
        'pc1-switch'   : 'straight',
        'pc2-switch'   : 'straight',
        'pc1-pc2'      : 'crossover',
        'switch-switch': 'crossover',
    };
    const CONN_PAIRS  = { 1:'router-switch', 2:'pc1-switch', 3:'pc2-switch', 4:'pc1-pc2' };
    const CONN_LABELS = { 1:'Router → Switch', 2:'Switch → PC1', 3:'Switch → PC2', 4:'PC1 ↔ PC2' };

    const state = {
        routerOn: false, selectedCableType: null, activeConn: null,
        cables: { rs:false, sp1:false, sp2:false, pp:false },
        positions: {}, packets: [], indicators: {},
        powerLight: null,
        ceilingLights: { light1:null, light2:null },
        lightStates:   { light1:true, light2:true },
        vrCableHeld: false, vrCableStart: null, vrTempCable: null,
        vrHoveredNode: null, vrFirstNode: null,
        moveSpeed: 0.03,
        correctConns: 0, wrongAttempts: 0,
    };

    // ── UI ──
    const hud = document.createElement('div');
    hud.innerHTML = `
        <b>🖧 VR Network Lab</b><br>
        <span id="powerStatus">Router: Унтарсан</span><br>
        <span id="cableStatus">Холболт: 0/4</span><br>
        <span id="dataStatus">Өгөгдөл: Зогссон</span>
        <hr style="border-color:rgba(255,255,255,.15);margin:6px 0">
        <div style="font-size:11px;color:#aaa">
            <b style="color:#4ade80">Straight:</b> PC↔Switch, Router↔Switch<br>
            <b style="color:#f97316">Crossover:</b> PC↔PC, Switch↔Switch
        </div>
        <hr style="border-color:rgba(255,255,255,.15);margin:6px 0">
        <small>
            [P] Router ON/OFF &nbsp; [R] Арилгах<br>
            [1] Straight &nbsp; [2] Crossover &nbsp; [L] Гэрэл<br>
            <b>Хулгана drag</b> — эргэх &nbsp; <b>WASD</b> — явах
        </small>`;
    hud.style.cssText = 'position:fixed;top:10px;left:10px;color:white;background:rgba(0,0,0,.80);padding:14px 18px;border-radius:14px;font-size:13px;line-height:1.9;border:1px solid rgba(0,200,255,0.35);pointer-events:none;z-index:10;max-width:310px;display:none;';
    document.body.appendChild(hud);

    const statusEl = document.createElement('div');
    statusEl.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);color:white;background:rgba(0,0,0,.88);padding:10px 28px;border-radius:22px;font-size:14px;z-index:10;border:1px solid rgba(0,200,255,0.4);transition:all 0.4s;pointer-events:none;display:none;';
    document.body.appendChild(statusEl);

    const tooltipEl = document.createElement('div');
    tooltipEl.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);color:#ffcc44;font-size:12px;background:rgba(0,0,0,.75);padding:6px 16px;border-radius:8px;z-index:10;pointer-events:none;display:none;';
    document.body.appendChild(tooltipEl);

    const powerBtn = document.createElement('button');
    powerBtn.textContent = '⚡ Router Асаах';
    powerBtn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:20;background:rgba(0,0,0,.85);border:2px solid #ff4444;color:#ff4444;padding:10px 20px;border-radius:10px;font-size:14px;cursor:pointer;display:none;';
    powerBtn.onclick = togglePower;
    document.body.appendChild(powerBtn);

    const cablePanel = document.createElement('div');
    cablePanel.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);display:none;gap:12px;z-index:20;align-items:center;';
    cablePanel.innerHTML = `
        <button id="r1btnStraight" style="background:rgba(0,0,0,.85);padding:10px 22px;border-radius:10px;font-size:13px;cursor:pointer;border:2px solid #4ade80;color:#4ade80;font-weight:600;" onclick="window.r1setCableType('straight')">🟢 Straight</button>
        <button id="r1btnCrossover" style="background:rgba(0,0,0,.85);padding:10px 22px;border-radius:10px;font-size:13px;cursor:pointer;border:2px solid #f97316;color:#f97316;font-weight:600;" onclick="window.r1setCableType('crossover')">🟠 Crossover</button>`;
    document.body.appendChild(cablePanel);

    const connPanel = document.createElement('div');
    connPanel.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);display:none;gap:8px;z-index:20;flex-wrap:wrap;justify-content:center;';
    connPanel.innerHTML = `
        <button class="r1conn" style="background:rgba(0,0,0,.8);border:2px solid #888;color:white;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;" onclick="window.r1selectConn(1)">Router→Switch</button>
        <button class="r1conn" style="background:rgba(0,0,0,.8);border:2px solid #888;color:white;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;" onclick="window.r1selectConn(2)">Switch→PC1</button>
        <button class="r1conn" style="background:rgba(0,0,0,.8);border:2px solid #888;color:white;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;" onclick="window.r1selectConn(3)">Switch→PC2</button>
        <button class="r1conn" style="background:rgba(0,0,0,.8);border:2px solid #888;color:white;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;" onclick="window.r1selectConn(4)">PC1↔PC2</button>
        <button style="background:rgba(0,0,0,.8);border:2px solid #ff6666;color:#ff6666;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;" onclick="window.r1resetCables()">🗑 Арилгах</button>`;
    document.body.appendChild(connPanel);

    const lightPanel = document.createElement('div');
    lightPanel.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:20;display:none;flex-direction:column;gap:8px;';
    lightPanel.innerHTML = `
        <button id="r1lightBtn1" style="background:#ffaa00;color:black;border:2px solid #fff;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;width:120px;" onclick="window.r1toggleLight(1)">💡 Гэрэл 1</button>
        <button id="r1lightBtn2" style="background:#ffaa00;color:black;border:2px solid #fff;padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;width:120px;" onclick="window.r1toggleLight(2)">💡 Гэрэл 2</button>`;
    document.body.appendChild(lightPanel);

    const scoreBoard = document.createElement('div');
    scoreBoard.style.cssText = 'position:fixed;top:10px;right:160px;z-index:20;background:rgba(0,0,0,.82);border:1px solid rgba(0,200,255,0.3);color:white;padding:10px 16px;border-radius:10px;font-size:12px;line-height:1.8;min-width:170px;display:none;';
    scoreBoard.innerHTML = `<b>📊 Дүн</b><br>Зөв холболт: <span id="r1correctCount" style="color:#00ff88">0</span> / 4<br>Буруу оролдлого: <span id="r1wrongCount" style="color:#ff4444">0</span><br><span id="r1resultMsg"></span>`;
    document.body.appendChild(scoreBoard);

    function showUI(show) {
        const db = show ? 'block' : 'none';
        const df = show ? 'flex'  : 'none';
        hud.style.display        = db;
        statusEl.style.display   = db;
        powerBtn.style.display   = db;
        cablePanel.style.display = df;
        connPanel.style.display  = df;
        lightPanel.style.display = df;
        scoreBoard.style.display = db;
    }

    function setStatus(msg, type='') {
        statusEl.textContent = msg;
        statusEl.style.borderColor = type==='success'?'#00ff88':type==='error'?'#ff4444':'rgba(0,200,255,0.4)';
        statusEl.style.color       = type==='success'?'#00ff88':type==='error'?'#ff4444':'white';
    }
    function showTooltip(msg) {
        tooltipEl.textContent = msg; tooltipEl.style.display='block';
        setTimeout(()=>tooltipEl.style.display='none',3000);
    }

    // ── ГЭРЭЛ ──
    scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));
    scene.add(new THREE.AmbientLight(0x404040,2));
    const dirLight = new THREE.DirectionalLight(0xffffff,1);
    dirLight.position.set(3,10,10); dirLight.castShadow=true;
    room.add(dirLight);

    // ── BOARD ──
    const boardGroup = new THREE.Group();
    const frameB = new THREE.Mesh(new THREE.BoxGeometry(1.55,0.55,0.03), new THREE.MeshStandardMaterial({color:0x222222}));
    frameB.position.z = -0.02;
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.5,0.5,0.05), new THREE.MeshStandardMaterial({color:0xffffff}));
    boardGroup.add(frameB, board);
    boardGroup.position.set(-1.4,1.5,0.05);
    boardGroup.rotation.y = Math.PI/2;
    room.add(boardGroup);

    const clickableObjects = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // ── VR CONTROLLERS ──
    const cmf = new XRControllerModelFactory();
    const ctrlR = renderer.xr.getController(0);
    const ctrlRGrip = renderer.xr.getControllerGrip(0);
    ctrlRGrip.add(cmf.createControllerModel(ctrlRGrip));
    scene.add(ctrlR); scene.add(ctrlRGrip);
    const ctrlL = renderer.xr.getController(1);
    const ctrlLGrip = renderer.xr.getControllerGrip(1);
    ctrlLGrip.add(cmf.createControllerModel(ctrlLGrip));
    scene.add(ctrlL); scene.add(ctrlLGrip);

    const rayGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-3)]);
    const rayMat  = new THREE.LineBasicMaterial({color:0x00d4ff,transparent:true,opacity:0.75});
    const rayLine = new THREE.Line(rayGeom,rayMat);
    ctrlR.add(rayLine);

    const hoverSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.13,16,16),
        new THREE.MeshBasicMaterial({color:0x00ffcc,transparent:true,opacity:0.35,wireframe:true})
    );
    hoverSphere.visible=false; scene.add(hoverSphere);

    const firstNodeMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.1,16,16),
        new THREE.MeshBasicMaterial({color:0xffaa00,transparent:true,opacity:0.6,wireframe:true})
    );
    firstNodeMarker.visible=false; scene.add(firstNodeMarker);

    ctrlR.addEventListener('selectstart', onVRTrigger);
    ctrlR.addEventListener('squeezestart', onVRGripDown);
    ctrlR.addEventListener('squeezeend',   onVRGripUp);

    // ── FIRST PERSON ХЯНАЛТ ──
    let yaw=0, pitch=0, isDragging=false, prevX=0, prevY=0;
    const keys = {};

    renderer.domElement.addEventListener('mousedown', e=>{
        if (!room.visible||e.button!==0) return;
        isDragging=true; prevX=e.clientX; prevY=e.clientY;
    });
    window.addEventListener('mouseup', ()=>isDragging=false);

    window.addEventListener('mousemove', e=>{
        if (!isDragging||!room.visible) return;
        yaw   -= (e.clientX-prevX)*0.003;
        pitch -= (e.clientY-prevY)*0.003;
        pitch  = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
        prevX=e.clientX; prevY=e.clientY;
        camera.rotation.order='YXZ';
        camera.rotation.y=yaw;
        camera.rotation.x=pitch;
    });

    renderer.domElement.addEventListener('wheel', e=>{
        if (!room.visible) return;
        const dir=new THREE.Vector3();
        camera.getWorldDirection(dir);
        camera.position.addScaledVector(dir,-e.deltaY*0.005);
        e.preventDefault();
    },{passive:false});

    let lastTX=0, lastTY=0;
    renderer.domElement.addEventListener('touchstart', e=>{
        if (!room.visible) return;
        lastTX=e.touches[0].clientX; lastTY=e.touches[0].clientY;
    });
    renderer.domElement.addEventListener('touchmove', e=>{
        if (!room.visible) return;
        yaw   -= (e.touches[0].clientX-lastTX)*0.003;
        pitch -= (e.touches[0].clientY-lastTY)*0.003;
        pitch  = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
        lastTX=e.touches[0].clientX; lastTY=e.touches[0].clientY;
        camera.rotation.order='YXZ';
        camera.rotation.y=yaw;
        camera.rotation.x=pitch;
        e.preventDefault();
    },{passive:false});

    window.addEventListener('keydown', e=>{
        if (!room.visible) return;
        keys[e.key.toLowerCase()]=true;
        if (e.key==='p'||e.key==='P') togglePower();
        if (e.key==='1') setCableType('straight');
        if (e.key==='2') setCableType('crossover');
        if (e.key==='r'||e.key==='R') resetCables();
        if (e.key==='l'||e.key==='L'){toggleLight(1);setTimeout(()=>toggleLight(2),200);}
        if (e.key==='q'||e.key==='Q') selectConn(1);
        if (e.key==='e'||e.key==='E') selectConn(3);
        if (e.key==='t'||e.key==='T') selectConn(4);
    });
    window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });

    // ── CABLE TYPE ──
    function setCableType(type) {
        state.selectedCableType=type;
        state.vrFirstNode=null; firstNodeMarker.visible=false;
        document.getElementById('r1btnStraight').style.background  = type==='straight'?'#4ade80':'rgba(0,0,0,.85)';
        document.getElementById('r1btnStraight').style.color        = type==='straight'?'#000':'#4ade80';
        document.getElementById('r1btnCrossover').style.background  = type==='crossover'?'#f97316':'rgba(0,0,0,.85)';
        document.getElementById('r1btnCrossover').style.color       = type==='crossover'?'#000':'#f97316';
        setStatus(`${type==='straight'?'🟢 Straight':'🟠 Crossover'} кабель сонгогдлоо`,'');
        showTooltip('Холбох заглуур сонгоно уу');
    }
    window.r1setCableType = setCableType;

    function selectConn(n) {
        if (!state.routerOn)         {setStatus('Эхлээд Router асаана уу!','error');return;}
        if (!state.selectedCableType){setStatus('Эхлээд кабелийн төрөл сонгоно уу!','error');return;}
        state.activeConn=n;
        document.querySelectorAll('.r1conn').forEach((b,i)=>{
            b.style.borderColor=i===n-1?'#ffaa00':'#888';
            b.style.color      =i===n-1?'#ffaa00':'white';
        });
        setStatus(`${CONN_LABELS[n]} → ${state.selectedCableType} кабелиар холбоно`,'');
    }
    window.r1selectConn = selectConn;

    const CONN_KEYS    = {1:'rs',2:'sp1',3:'sp2',4:'pp'};
    const cableObjects = {rs:null,sp1:null,sp2:null,pp:null};
    const cableLabels  = {};

    function validateAndConnect(connIndex) {
        if (!state.routerOn)         {setStatus('Router асаагаагүй!','error');return;}
        if (!state.selectedCableType){setStatus('Кабелийн төрөл сонгоно уу!','error');return;}
        const pairKey  = CONN_PAIRS[connIndex];
        const required = CABLE_RULES[pairKey];
        const chosen   = state.selectedCableType;
        const key      = CONN_KEYS[connIndex];
        if (chosen===required) {
            drawCable(key,chosen);
            state.correctConns++;
            setStatus(`✅ Зөв! ${CONN_LABELS[connIndex]} — ${chosen}`,'success');
            updateScoreBoard(); checkAllConnected();
        } else {
            state.wrongAttempts++;
            setStatus(`❌ Буруу! ${CONN_LABELS[connIndex]}-д ${required} хэрэгтэй`,'error');
            updateScoreBoard();
        }
        state.activeConn=null; state.vrFirstNode=null; firstNodeMarker.visible=false;
        document.querySelectorAll('.r1conn').forEach(b=>{b.style.borderColor='#888';b.style.color='white';});
    }

    function drawCable(key,cableType) {
        const p=state.positions; if(!p.router) return;
        if(cableObjects[key]){scene.remove(cableObjects[key]);cableObjects[key]=null;}
        if(cableLabels[key]) {scene.remove(cableLabels[key]); cableLabels[key]=null;}
        let start,end;
        if(key==='rs') {start=p.router.clone(); end=p.switch1.clone();}
        if(key==='sp1'){start=p.switch1.clone();end=p.pc1.clone();}
        if(key==='sp2'){start=p.switch1.clone();end=p.pc2.clone();}
        if(key==='pp') {start=p.pc1.clone();    end=p.pc2.clone();}
        const color=cableType==='straight'?0x4ade80:0xf97316;
        cableObjects[key]=makeCableMesh(start,end,color);
        const mid=new THREE.Vector3().addVectors(start,end).multiplyScalar(0.5); mid.y+=0.22;
        cableLabels[key]=makeFloatingLabel(cableType==='straight'?'Straight':'Crossover',color,mid);
        state.cables[key]=true;
        if(key==='rs') hideDashedCable();
        updateStatusUI();
    }

    function makeFloatingLabel(text,color,position) {
        const c=document.createElement('canvas'); c.width=256; c.height=64;
        const ctx=c.getContext('2d');
        ctx.fillStyle='rgba(0,0,0,0.72)'; ctx.roundRect(4,4,248,56,12); ctx.fill();
        const hex='#'+color.toString(16).padStart(6,'0');
        ctx.strokeStyle=hex; ctx.lineWidth=3; ctx.roundRect(4,4,248,56,12); ctx.stroke();
        ctx.fillStyle=hex; ctx.font='bold 28px Segoe UI,Arial';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,128,34);
        const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));
        sp.scale.set(0.45,0.11,1); sp.position.copy(position); scene.add(sp); return sp;
    }

    function resetCables() {
        ['rs','sp1','sp2','pp'].forEach(k=>{
            if(cableObjects[k]){scene.remove(cableObjects[k]);cableObjects[k]=null;}
            if(cableLabels[k]) {scene.remove(cableLabels[k]); cableLabels[k]=null;}
            state.cables[k]=false;
        });
        state.packets.forEach(p=>scene.remove(p.mesh)); state.packets.length=0;
        state.activeConn=null; state.vrFirstNode=null;
        state.correctConns=0; state.wrongAttempts=0;
        firstNodeMarker.visible=false;
        document.querySelectorAll('.r1conn').forEach(b=>{b.style.borderColor='#888';b.style.color='white';});
        document.getElementById('r1resultMsg').innerHTML='';
        showDashedCable();
        updateStatusUI(); updateScoreBoard(); setStatus('Кабелиуд арилгагдлаа.','');
    }
    window.r1resetCables = resetCables;

    // ── DESKTOP CLICK ──
    renderer.domElement.addEventListener('click', e=>{
        if (!room.visible||!state.activeConn) return;
        mouse.x= (e.clientX/innerWidth)*2-1;
        mouse.y=-(e.clientY/innerHeight)*2+1;
        raycaster.setFromCamera(mouse,camera);
        const hits=raycaster.intersectObjects(clickableObjects,true);
        if (!hits.length) return;
        const nodeName=hits[0].object.userData.nodeName; if(!nodeName) return;
        const needed={1:['router','switch'],2:['switch','pc1'],3:['switch','pc2'],4:['pc1','pc2']}[state.activeConn];
        if (needed&&needed.includes(nodeName)) validateAndConnect(state.activeConn);
        else setStatus('Буруу объект дарлаа!','error');
    });

    // ── VR TRIGGER ──
    function onVRTrigger() {
        if (!room.visible) return;
        if (!state.routerOn)         {setStatus('Router асаана уу!','error');return;}
        if (!state.selectedCableType){setStatus('Кабель төрөл сонгоно уу!','error');return;}
        const hit=vrRayHit(); if(!hit) return;
        const nodeName=hit.object.userData.nodeName; if(!nodeName) return;
        if (state.vrFirstNode) {
            const first=state.vrFirstNode, second=nodeName;
            if (first===second){setStatus('Өөр node сонгоно уу!','error');return;}
            const sorted=[first,second].sort().join('-');
            let connIdx=null;
            if(sorted==='router-switch') connIdx=1;
            else if(sorted==='pc1-switch') connIdx=(first==='pc1'||second==='pc1')?2:3;
            else if(sorted==='pc2-switch') connIdx=3;
            else if(sorted==='pc1-pc2') connIdx=4;
            if(connIdx){selectConn(connIdx);validateAndConnect(connIdx);vrFlash(hit.point,state.selectedCableType==='straight'?0x4ade80:0xf97316);}
            else setStatus(`❌ "${first}" ↔ "${second}" холболт тодорхойгүй`,'error');
            state.vrFirstNode=null; firstNodeMarker.visible=false; rayMat.color.setHex(0x00d4ff);
        } else {
            state.vrFirstNode=nodeName;
            const wp=new THREE.Vector3(); hit.object.getWorldPosition(wp);
            firstNodeMarker.position.copy(wp); firstNodeMarker.visible=true;
            rayMat.color.setHex(0xffaa00);
            setStatus(`✅ "${nodeName}" сонгогдлоо — хоёрдох node дарна уу`,'');
            vrPulse(nodeName);
        }
    }

    function onVRGripDown() {
        if (!room.visible) return;
        const hit=vrRayHit(); if(!hit||!hit.object.userData.nodeName) return;
        state.vrCableHeld=true; state.vrCableStart=hit.object.userData.nodeName;
        state.vrFirstNode=null; firstNodeMarker.visible=false;
        rayMat.color.setHex(0xffaa00);
    }

    function onVRGripUp() {
        if (!state.vrCableHeld) return;
        state.vrCableHeld=false; rayMat.color.setHex(0x00d4ff);
        if(state.vrTempCable){scene.remove(state.vrTempCable);state.vrTempCable=null;}
        const hit=vrRayHit();
        if(!hit||!hit.object.userData.nodeName){setStatus('Холбогдсонгүй','error');state.vrCableStart=null;return;}
        const startNode=state.vrCableStart, endNode=hit.object.userData.nodeName;
        if(startNode===endNode){setStatus('Өөр node сонгоно уу!','error');state.vrCableStart=null;return;}
        const sorted=[startNode,endNode].sort().join('-');
        let connIdx=null;
        if(sorted==='router-switch') connIdx=1;
        else if(sorted==='pc1-switch') connIdx=(startNode==='pc1'||endNode==='pc1')?2:3;
        else if(sorted==='pc2-switch') connIdx=3;
        else if(sorted==='pc1-pc2') connIdx=4;
        if(connIdx){selectConn(connIdx);validateAndConnect(connIdx);vrFlash(hit.point,state.selectedCableType==='straight'?0x4ade80:0xf97316);}
        else setStatus(`❌ "${startNode}" → "${endNode}" холболт байхгүй`,'error');
        state.vrCableStart=null;
    }

    // ── VR GAMEPAD ──
    const vrBtns={A:false,B:false,X:false,Y:false};
    function handleVRGamepad(playerRig) {
        if (!room.visible) return;
        const session=renderer.xr.getSession(); if(!session) return;
        session.inputSources.forEach(src=>{
            const gp=src.gamepad; if(!gp) return;
            const h=src.handedness;
            if(h==='right'){
                if(gp.buttons[4]?.pressed&&!vrBtns.A){vrBtns.A=true;togglePower();}else if(!gp.buttons[4]?.pressed)vrBtns.A=false;
                if(gp.buttons[5]?.pressed&&!vrBtns.B){vrBtns.B=true;resetCables();}else if(!gp.buttons[5]?.pressed)vrBtns.B=false;
            }
            if(h==='left'){
                if(gp.buttons[4]?.pressed&&!vrBtns.X){vrBtns.X=true;setCableType('straight');}else if(!gp.buttons[4]?.pressed)vrBtns.X=false;
                if(gp.buttons[5]?.pressed&&!vrBtns.Y){vrBtns.Y=true;setCableType('crossover');}else if(!gp.buttons[5]?.pressed)vrBtns.Y=false;
                const ax=gp.axes[2]||0, ay=gp.axes[3]||0;
                if(Math.abs(ax)>0.15||Math.abs(ay)>0.15){
                    const dir=new THREE.Vector3(); camera.getWorldDirection(dir); dir.y=0; dir.normalize();
                    const right=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0));
                    playerRig.position.addScaledVector(dir,  -ay*state.moveSpeed);
                    playerRig.position.addScaledVector(right,  ax*state.moveSpeed);
                }
            }
        });
    }

    function updateVRHover() {
        if(!renderer.xr.isPresenting||!room.visible) return;
        const hit=vrRayHit();
        if(hit&&hit.object.userData.nodeName){
            const wp=new THREE.Vector3(); hit.object.getWorldPosition(wp);
            hoverSphere.position.copy(wp); hoverSphere.visible=true;
            rayLine.geometry.setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-hit.distance)]);
        } else {
            hoverSphere.visible=false;
            rayLine.geometry.setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-3)]);
        }
        if(state.vrCableHeld&&state.vrCableStart){
            if(state.vrTempCable) scene.remove(state.vrTempCable);
            const sp=state.positions[{router:'router',switch:'switch1',pc1:'pc1',pc2:'pc2'}[state.vrCableStart]];
            if(sp){const ep=new THREE.Vector3();ctrlR.getWorldPosition(ep);state.vrTempCable=makeCableMesh(sp.clone(),ep,state.selectedCableType==='crossover'?0xf97316:0x4ade80);}
        }
        if(state.vrFirstNode&&!state.vrCableHeld){
            if(state.vrTempCable) scene.remove(state.vrTempCable);
            const sp=state.positions[{router:'router',switch:'switch1',pc1:'pc1',pc2:'pc2'}[state.vrFirstNode]];
            if(sp){const ep=new THREE.Vector3();ctrlR.getWorldPosition(ep);state.vrTempCable=makeCableMesh(sp.clone(),ep,state.selectedCableType==='crossover'?0xf97316:0x4ade80);}
        } else if(!state.vrCableHeld&&!state.vrFirstNode&&state.vrTempCable){
            scene.remove(state.vrTempCable); state.vrTempCable=null;
        }
    }

    function vrRayHit() {
        const m=new THREE.Matrix4(); m.identity().extractRotation(ctrlR.matrixWorld);
        const rc=new THREE.Raycaster();
        rc.ray.origin.setFromMatrixPosition(ctrlR.matrixWorld);
        rc.ray.direction.set(0,0,-1).applyMatrix4(m);
        const hits=rc.intersectObjects(clickableObjects,true);
        return hits.length?hits[0]:null;
    }
    function vrPulse(nodeName) {
        const pos=state.positions[{router:'router',switch:'switch1',pc1:'pc1',pc2:'pc2'}[nodeName]]; if(!pos) return;
        const ring=new THREE.Mesh(new THREE.RingGeometry(0.1,0.15,32),new THREE.MeshBasicMaterial({color:0x00d4ff,transparent:true,opacity:0.8,side:THREE.DoubleSide}));
        ring.position.copy(pos); ring.rotation.x=-Math.PI/2; scene.add(ring);
        let t=0;
        const anim=()=>{t+=0.04;ring.scale.setScalar(1+t*2);ring.material.opacity=Math.max(0,0.8-t);if(t<1)requestAnimationFrame(anim);else scene.remove(ring);}; anim();
    }
    function vrFlash(pos,color) {
        const l=new THREE.PointLight(color,5,2); l.position.copy(pos); scene.add(l);
        let v=5; const fade=()=>{v-=0.3;l.intensity=v;if(v>0)requestAnimationFrame(fade);else scene.remove(l);}; fade();
    }

    // ── CABLE MESH ──
    function makeCableMesh(start,end,color) {
        const mid=new THREE.Vector3().addVectors(start,end).multiplyScalar(0.5); mid.y-=0.18;
        const curve=new THREE.QuadraticBezierCurve3(start,mid,end);
        const pts=curve.getPoints(40);
        const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,0.016,8,false);
        const mat=new THREE.MeshStandardMaterial({color,emissive:0x000000,emissiveIntensity:0});
        const mesh=new THREE.Mesh(geo,mat); scene.add(mesh); return mesh;
    }

    // ── DASHED CABLE ──
    const dashedState={segs:[],fillT:0,filling:false,done:false,TOTAL:20};

    function buildDashedCable(fromPos,toPos) {
        dashedState.segs.forEach(s=>{scene.remove(s.dash);scene.remove(s.fill);});
        dashedState.segs=[]; dashedState.fillT=0; dashedState.filling=false; dashedState.done=false;
        const mid=new THREE.Vector3((fromPos.x+toPos.x)*0.5,Math.max(fromPos.y,toPos.y)+0.2,(fromPos.z+toPos.z)*0.5);
        const curve=new THREE.QuadraticBezierCurve3(fromPos.clone(),mid,toPos.clone());
        const N=dashedState.TOTAL;
        for(let i=0;i<N;i++){
            const t0=i/N, t1=(i+0.55)/N;
            const pts=[]; for(let s=0;s<=8;s++) pts.push(curve.getPoint(THREE.MathUtils.clamp(t0+(t1-t0)*(s/8),0,1)));
            const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,0.012,6,false);
            const dashMesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x445566,transparent:true,opacity:0.5}));
            scene.add(dashMesh);
            const fillMesh=new THREE.Mesh(geo.clone(),new THREE.MeshBasicMaterial({color:0x00ff88,transparent:true,opacity:0}));
            fillMesh.visible=false; scene.add(fillMesh);
            dashedState.segs.push({dash:dashMesh,fill:fillMesh});
        }
    }
    function hideDashedCable(){dashedState.segs.forEach(s=>{s.dash.visible=false;s.fill.visible=false;});}
    function showDashedCable(){
        dashedState.segs.forEach(s=>{s.dash.visible=true;s.fill.visible=false;});
        dashedState.fillT=0; dashedState.filling=false; dashedState.done=false;
    }
    function startDashedFill(){
        if(state.cables.rs) return;
        dashedState.fillT=0; dashedState.filling=true; dashedState.done=false;
        dashedState.segs.forEach(s=>{s.dash.visible=true;s.fill.visible=false;});
    }
    function stopDashedFill(){
        dashedState.filling=false; dashedState.done=false; dashedState.fillT=0;
        dashedState.segs.forEach(s=>{s.fill.visible=false;});
    }
    function updateDashedCable(delta) {
        if(!dashedState.segs.length) return;
        if(state.cables.rs){hideDashedCable();return;}
        const N=dashedState.TOTAL;
        if(dashedState.done){
            const p=0.5+0.5*Math.sin(Date.now()*0.004);
            dashedState.segs.forEach(s=>{s.fill.visible=true;s.fill.material.opacity=0.5+p*0.5;});
            return;
        }
        if(!dashedState.filling) return;
        dashedState.fillT=Math.min(1,dashedState.fillT+delta*1.2);
        const visCount=Math.floor(dashedState.fillT*N);
        for(let i=0;i<N;i++){
            const s=dashedState.segs[i];
            if(i<visCount){s.fill.visible=true;s.fill.material.opacity=i===visCount-1?1.0:0.85;}
            else s.fill.visible=false;
        }
        if(dashedState.fillT>=1){dashedState.done=true;dashedState.filling=false;}
    }

    // ── WIFI + PHONE ──
    const wifiGroup=new THREE.Group(); scene.add(wifiGroup);
    const wifiRings=[]; let wifiPhase=0; let phoneObj=null; let wifiLineMesh=null;

    function createWifiRings(rPos) {
        wifiRings.forEach(r=>wifiGroup.remove(r)); wifiRings.length=0;
        for(let i=1;i<=3;i++){
            const r=new THREE.Mesh(new THREE.TorusGeometry(i*0.18,0.012,8,32),new THREE.MeshBasicMaterial({color:0x00d4ff,transparent:true,opacity:0}));
            r.position.copy(rPos); r.position.y+=0.3; r.rotation.x=Math.PI/2; r.userData.phase=(i-1)*0.6;
            wifiGroup.add(r); wifiRings.push(r);
        }
    }
    function createPhone(rPos) {
        const g=new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(0.08,0.16,0.012),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.3,metalness:0.8})));
        const scr=new THREE.Mesh(new THREE.BoxGeometry(0.065,0.13,0.013),new THREE.MeshBasicMaterial({color:0x1a88ff}));
        scr.position.z=0.001; g.add(scr);
        g.position.set(rPos.x+0.5,rPos.y+0.15,rPos.z+0.3); g.rotation.y=-0.5;
        scene.add(g); return g;
    }
    function updateWifiLine() {
        if(!wifiLineMesh||!phoneObj) return;
        const rPos=state.positions.router; if(!rPos) return;
        const pts=[rPos.clone().add(new THREE.Vector3(0,0.3,0)),phoneObj.position.clone()];
        wifiLineMesh.geometry.dispose();
        wifiLineMesh.geometry=new THREE.BufferGeometry().setFromPoints(pts);
        wifiLineMesh.computeLineDistances();
    }
    function updateWifi(delta) {
        if(!state.routerOn){wifiRings.forEach(r=>r.material.opacity=0);return;}
        wifiPhase+=delta;
        wifiRings.forEach(ring=>{
            const p=(wifiPhase*0.9+ring.userData.phase)%2;
            if(p<1){ring.scale.setScalar(0.4+p*0.9);ring.material.opacity=0.75*(1-p);}
            else{ring.scale.setScalar(0.4);ring.material.opacity=0;}
        });
        if(phoneObj) phoneObj.position.y+=Math.sin(wifiPhase*1.5)*0.0003;
    }

    // ── CEILING LIGHTS ──
    function createCeilingLights() {
        function make(x,y,z,idx) {
            const g=new THREE.Group();
            const bm=new THREE.MeshStandardMaterial({color:0xffdd88,emissive:new THREE.Color(0x442200)});
            const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,16),bm);
            bulb.position.y=-0.01; g.add(bulb);
            const cone=new THREE.Mesh(new THREE.ConeGeometry(0.5,0.4,16),new THREE.MeshBasicMaterial({color:0xffffaa,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
            cone.position.y=-0.25; g.add(cone);
            g.position.set(x,y,z);
            const pl=new THREE.PointLight(0xffeedd,1.5,6);
            pl.position.set(x,y-0.2,z); pl.castShadow=true; scene.add(pl);
            state.ceilingLights[`light${idx}`]={group:g,bulb,cone,light:pl,bulbMat:bm};
            scene.add(g);
        }
        make(-0.8,1.9,-0.8,1);
        make(0.8,2.01,0.8,2);
    }
    function toggleLight(idx) {
        const lk=`light${idx}`, l=state.ceilingLights[lk]; if(!l) return;
        const on=state.lightStates[lk]=!state.lightStates[lk];
        l.bulbMat.color.setHex(on?0xffdd88:0x888888);
        l.bulbMat.emissive.setHex(on?0x442200:0x000000);
        l.cone.material.opacity=on?0.4:0;
        l.light.intensity=on?1.5:0;
        document.getElementById(`r1lightBtn${idx}`).style.background=on?'#ffaa00':'rgba(0,0,0,.8)';
        document.getElementById(`r1lightBtn${idx}`).style.color=on?'black':'#ffaa00';
        setStatus(`Гэрэл ${idx} ${on?'асааллаа':'унтраалаа'}`,'success');
    }
    window.r1toggleLight = toggleLight;

    // ── WALL SOCKET ──
    function createWallSocket(pos) {
        const g=new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.04),new THREE.MeshStandardMaterial({color:0xeeeecc})));
        [-0.025,0.025].forEach(ox=>{
            const h=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.05,8),new THREE.MeshStandardMaterial({color:0x111111}));
            h.rotation.z=Math.PI/2; h.position.set(ox,0,0.01); g.add(h);
        });
        const ring=new THREE.Mesh(new THREE.RingGeometry(0.07,0.09,16),new THREE.MeshBasicMaterial({color:0xff4444,side:THREE.DoubleSide,transparent:true,opacity:0}));
        ring.position.z=0.025; g.add(ring); state.powerLight=ring;
        g.position.copy(pos); scene.add(g);
    }
    createWallSocket(new THREE.Vector3(-1.38,0.4,-0.2));

    // ── POWER ──
    function togglePower() {
        state.routerOn=!state.routerOn;
        const ind=state.indicators['router'];
        if(state.routerOn){
            powerBtn.textContent='Router Унтраах'; powerBtn.style.borderColor='#00ff88'; powerBtn.style.color='#00ff88';
            if(ind) ind.material.color.setHex(0x00ff44);
            if(state.powerLight){state.powerLight.material.opacity=0.8;state.powerLight.material.color.setHex(0x00ff44);}
            startDashedFill();
            setStatus('✅ Router асаагдлаа! Кабелийн төрөл сонгоод холбоно уу.','success');
            document.getElementById('powerStatus').textContent='Router: Асаалттай ✅';
        } else {
            powerBtn.textContent='⚡ Router Асаах'; powerBtn.style.borderColor='#ff4444'; powerBtn.style.color='#ff4444';
            if(ind) ind.material.color.setHex(0x444444);
            if(state.powerLight) state.powerLight.material.opacity=0;
            stopDashedFill();
            state.packets.forEach(p=>scene.remove(p.mesh)); state.packets.length=0;
            setStatus('Router унтарлаа.','');
            document.getElementById('powerStatus').textContent='Router: Унтарсан';
            document.getElementById('dataStatus').textContent='Өгөгдөл: Зогссон';
        }
    }
    window.r1togglePower = togglePower;

    function addIndicator(pos,name) {
        const l=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),new THREE.MeshBasicMaterial({color:0x444444}));
        l.position.set(pos.x,pos.y+0.25,pos.z); scene.add(l); state.indicators[name]=l;
    }

    // ── PACKETS ──
    function spawnPacket(from,to,color) {
        const m=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),new THREE.MeshBasicMaterial({color}));
        m.position.copy(from);
        m.add(new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.3})));
        scene.add(m);
        state.packets.push({mesh:m,from:from.clone(),to:to.clone(),t:0,speed:0.008+Math.random()*0.004});
    }
    function updatePackets() {
        for(let i=state.packets.length-1;i>=0;i--){
            const p=state.packets[i]; p.t+=p.speed;
            if(p.t>=1){scene.remove(p.mesh);state.packets.splice(i,1);}
            else p.mesh.position.lerpVectors(p.from,p.to,p.t);
        }
    }
    let packetTimer=0;
    function spawnNetworkPackets() {
        if(!state.routerOn) return;
        const p=state.positions;
        const all3=state.cables.rs&&state.cables.sp1&&state.cables.sp2;
        if(all3&&p.router&&p.switch1&&p.pc1&&p.pc2){
            spawnPacket(p.router.clone(),p.switch1.clone(),0xff3300);
            setTimeout(()=>spawnPacket(p.switch1.clone(),p.pc1.clone(),0x00ff88),400);
            setTimeout(()=>{spawnPacket(p.router.clone(),p.switch1.clone(),0xff6600);setTimeout(()=>spawnPacket(p.switch1.clone(),p.pc2.clone(),0x0088ff),400);},800);
        } else if(state.cables.rs&&p.router&&p.switch1){
            spawnPacket(p.router.clone(),p.switch1.clone(),0xff3300);
        }
        if(state.cables.pp&&p.pc1&&p.pc2){
            spawnPacket(p.pc1.clone(),p.pc2.clone(),0xf97316);
            setTimeout(()=>spawnPacket(p.pc2.clone(),p.pc1.clone(),0xf97316),600);
        }
    }

    function checkAllConnected() {
        const allDone=state.cables.rs&&state.cables.sp1&&state.cables.sp2&&state.cables.pp&&state.routerOn;
        if(allDone){
            setStatus('🏆 Бүх 4 холболт зөв! Мэдээлэл урсаж байна...','success');
            document.getElementById('dataStatus').textContent='Өгөгдөл: Идэвхтэй 🟢';
            ['rs','sp1','sp2','pp'].forEach(k=>{if(cableObjects[k]){cableObjects[k].material.emissive.setHex(0x00aa44);cableObjects[k].material.emissiveIntensity=0.4;}});
            Object.values(state.indicators).forEach(i=>{if(i)i.material.color.setHex(0x00ffcc);});
            document.getElementById('r1resultMsg').innerHTML='<span style="color:#00ff88">🏆 Бүх холболт амжилттай!</span>';
        }
    }
    function updateScoreBoard() {
        document.getElementById('r1correctCount').textContent=state.correctConns;
        document.getElementById('r1wrongCount').textContent=state.wrongAttempts;
    }
    function updateStatusUI() {
        const c=Object.values(state.cables).filter(Boolean).length;
        document.getElementById('cableStatus').textContent=`🔌 Холболт: ${c}/4`;
    }

    // ── WINDOWS ──
    const txLoader=new THREE.TextureLoader();
    txLoader.load('./image1.jpg',tex=>{
        tex.colorSpace=THREE.SRGBColorSpace;
        [[-0.7,1.6,-1.4,0],[0.3,1.6,-1.4,0],[0.7,1.6,1.4,Math.PI],[-0.3,1.6,1.4,Math.PI]].forEach(([x,y,z,ry])=>{
            const g=new THREE.Group();
            g.add(new THREE.Mesh(new THREE.BoxGeometry(0.82,0.62,0.06),new THREE.MeshStandardMaterial({color:0x333333})));
            const glass=new THREE.Mesh(new THREE.PlaneGeometry(0.75,0.55),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
            glass.position.z=0.04; g.add(glass);
            g.position.set(x,y,z); g.rotation.y=ry; room.add(g);
        });
    },undefined,()=>{});

    createCeilingLights();

    // ── GLB LOAD ──
    const loader=new GLTFLoader();
    loader.load('./lab4.glb', gltf=>{
        const model=gltf.scene;
        const box=new THREE.Box3().setFromObject(model);
        const center=new THREE.Vector3();
        box.getCenter(center);
        model.position.y-=box.min.y;
        model.position.x-=center.x;
        model.position.z-=center.z;
        room.add(model);

        const router   = model.getObjectByName('router');
        const switch1  = model.getObjectByName('switch');
        const pc1      = model.getObjectByName('pc1');
        const pc2      = model.getObjectByName('pc2');
        const monitor1 = model.getObjectByName('monitor1');
        const monitor2 = model.getObjectByName('monitor2');
        const deever   = model.getObjectByName('deever');
        const hana1    = model.getObjectByName('hana1');
        const hana2    = model.getObjectByName('hana2');
        const hana3    = model.getObjectByName('hana3');
        const shal     = model.getObjectByName('shal');
        const shiree1  = model.getObjectByName('shiree1');
        const sandal1  = model.getObjectByName('sandal1');
        const sandal2  = model.getObjectByName('sandal2');

        if(!router||!switch1||!pc1||!pc2){setStatus('GLB: router/switch/pc1/pc2 нэр олдсонгүй','error');return;}

        // ── SHIREE1 → ХААЛГА болгоно ──
        if(shiree1){
            shiree1.traverse(o=>{
                o.userData.kind = "door";
            });
            clickableObjects.push(shiree1);
            shiree1.traverse(o=>clickableObjects.push(o));

            // Хаалганы шошго — shiree1 дээр
            const s1pos=new THREE.Vector3();
            shiree1.getWorldPosition(s1pos);

            const doorCanvas=document.createElement("canvas");
            doorCanvas.width=512; doorCanvas.height=128;
            const dctx=doorCanvas.getContext("2d");

            dctx.fillStyle="rgba(0,20,20,0.85)";
            dctx.roundRect(4,4,504,120,16); dctx.fill();

            dctx.strokeStyle="#00ffcc";
            dctx.lineWidth=3;
            dctx.roundRect(4,4,504,120,16); dctx.stroke();

            dctx.fillStyle="#00ffcc";
            dctx.font="bold 42px Arial";
            dctx.textAlign="center";
            dctx.textBaseline="middle";
            dctx.fillText("Хичээлийн танхимд",256,48);

            dctx.fillStyle="#ffffff";
            dctx.font="28px Arial";
            dctx.fillText("нэвтрэх →",256,96);

            const doorLabel=new THREE.Mesh(
                new THREE.PlaneGeometry(1.4,0.35),
                new THREE.MeshBasicMaterial({
                    map:new THREE.CanvasTexture(doorCanvas),
                    transparent:true,
                    depthTest:false
                })
            );
            doorLabel.position.set(s1pos.x, s1pos.y+1.5, s1pos.z);
            scene.add(doorLabel);
        }

        router.traverse(o=>{
            if(o.isMesh){
                o.material=o.material.clone();
                o.material.color.setHex(0x1a3a5c);
                o.material.emissive.setHex(0x051525);
                o.material.emissiveIntensity=0.3;
                o.material.roughness=0.4; o.material.metalness=0.7;
            }
        });

        const textureLoader=new THREE.TextureLoader();
        const screenTex=textureLoader.load('screen.jpg');
        function loadTex(url,rx,ry){
            return textureLoader.load(url,tex=>{
                tex.colorSpace=THREE.SRGBColorSpace;
                tex.wrapS=THREE.RepeatWrapping; tex.wrapT=THREE.RepeatWrapping;
                tex.repeat.set(rx,ry); tex.needsUpdate=true;
            });
        }
        const texWall=loadTex('wall.jpg',3,3);
        const texShal=loadTex('wood.jpg',4,4);

        [monitor1,monitor2].forEach(m=>{
            if(!m) return;
            m.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.map=screenTex;o.material.emissiveMap=screenTex;o.material.emissive.set(0xffffff);o.material.emissiveIntensity=1;}});
        });

        function applyTex(obj,tex,r,m){
            if(!obj) return;
            obj.traverse(c=>{if(!c.isMesh)return;c.material=c.material.clone();c.material.map=tex;c.material.roughness=r||0.85;c.material.metalness=m||0.05;c.material.needsUpdate=true;});
        }
        applyTex(deever,texWall,0.9,0.0);
        applyTex(hana1,texWall,0.9,0.0);
        applyTex(hana2,texWall,0.9,0.0);
        applyTex(hana3,texWall,0.9,0.0);
        applyTex(shal,texShal,0.8,0.1);

        function applyColor(obj,color){
            if(!obj) return;
            obj.traverse(child=>{if(child.isMesh)child.material=new THREE.MeshStandardMaterial({color,roughness:0.6,metalness:0.2});});
        }
        applyColor(sandal1,new THREE.Color(0x8B5A2B));
        applyColor(sandal2,new THREE.Color(0x8B5A2B));

        const r=new THREE.Vector3(),s=new THREE.Vector3(),p1=new THREE.Vector3(),p2=new THREE.Vector3();
        router.getWorldPosition(r); switch1.getWorldPosition(s); pc1.getWorldPosition(p1); pc2.getWorldPosition(p2);
        state.positions={router:r,switch1:s,pc1:p1,pc2:p2};

        router.traverse(o=>{o.userData.nodeName='router';  clickableObjects.push(o);});
        switch1.traverse(o=>{o.userData.nodeName='switch'; clickableObjects.push(o);});
        pc1.traverse(o=>{o.userData.nodeName='pc1';        clickableObjects.push(o);});
        pc2.traverse(o=>{o.userData.nodeName='pc2';        clickableObjects.push(o);});

        addIndicator(r,'router'); addIndicator(s,'switch'); addIndicator(p1,'pc1'); addIndicator(p2,'pc2');

        const phoneTargetPos=new THREE.Vector3(r.x+0.5,r.y+0.15,r.z+0.3);
        buildDashedCable(r,phoneTargetPos);
        createWifiRings(r);
        phoneObj=createPhone(r);

        const wifiPts=[r.clone().add(new THREE.Vector3(0,0.3,0)),phoneObj.position.clone()];
        wifiLineMesh=new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(wifiPts),
            new THREE.LineDashedMaterial({color:0x00d4ff,dashSize:0.08,gapSize:0.05,transparent:true,opacity:0.8})
        );
        wifiLineMesh.computeLineDistances(); scene.add(wifiLineMesh);

        camera.position.set(0,1.6,3);
        camera.rotation.order='YXZ';
        camera.rotation.set(0,0,0);

        setStatus('✅ GLB ачаалагдлаа! [P] Router асаана уу','success');
    },undefined,err=>{console.error(err);setStatus('lab4.glb олдсонгүй','error');});

    // ── UPDATE LOOP ──
    let glowPhase=0;

    room.userData.update=(delta,playerRig)=>{
        if(!room.visible) return;

        // WASD хөдөлгөөн
        if(!renderer.xr.isPresenting){
            const speed=3*delta;
            const dir=new THREE.Vector3();
            camera.getWorldDirection(dir); dir.y=0; dir.normalize();
            const right=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0));
            if(keys['w']||keys['arrowup'])    camera.position.addScaledVector(dir,    speed);
            if(keys['s']||keys['arrowdown'])  camera.position.addScaledVector(dir,   -speed);
            if(keys['a']||keys['arrowleft'])  camera.position.addScaledVector(right, -speed);
            if(keys['d']||keys['arrowright']) camera.position.addScaledVector(right,  speed);
        }

        if(renderer.xr.isPresenting){
            handleVRGamepad(playerRig);
            updateVRHover();
        } else {
            hoverSphere.visible=false;
            if(state.vrTempCable&&!state.vrCableHeld&&!state.vrFirstNode){
                scene.remove(state.vrTempCable); state.vrTempCable=null;
            }
        }

        if(state.routerOn){
            packetTimer+=delta;
            if(packetTimer>1.2){packetTimer=0;spawnNetworkPackets();}
        }
        updatePackets();
        updateWifi(delta);
        updateWifiLine();
        updateDashedCable(delta);

        const allGlow=state.cables.rs&&state.cables.sp1&&state.cables.sp2&&state.cables.pp&&state.routerOn;
        if(allGlow){
            glowPhase+=delta*2;
            const intensity=0.3+0.3*Math.sin(glowPhase);
            ['rs','sp1','sp2','pp'].forEach(k=>{if(cableObjects[k])cableObjects[k].material.emissiveIntensity=intensity;});
        }
        if(state.routerOn&&state.powerLight)
            state.powerLight.material.opacity=0.5+0.4*Math.sin(glowPhase*1.5);
    };

    // ── VISIBLE SETTER ──
    let _visible=true;
    Object.defineProperty(room,'visible',{
        get(){ return _visible; },
        set(v){
            _visible=v;
            room.traverse(obj=>{ if(obj!==room) obj.visible=v; });
            Object.values(state.ceilingLights).forEach(l=>{ if(l?.light) l.light.visible=v; });
            showUI(v);
        }
    });

    return room;
}
