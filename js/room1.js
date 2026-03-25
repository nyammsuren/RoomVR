// ============================================================
// ЗАСВАРЛАСАН ХЭСГҮҮД — main.js дотроо орлуулна уу
// ============================================================

// ── 1. ТУСЛАХ ФУНКЦ: хоёр node-оос connIdx тодорхойлно ──
// onVRTrigger болон onVRGripUp хоёуланд ашиглана
function resolveConnIdx(nodeA, nodeB) {
  // sort() хийсний дараа гарах хослолуудыг шалгана
  const sorted = [nodeA, nodeB].sort().join('-');

  // 'pc1-switch', 'pc2-switch', 'router-switch', 'pc1-pc2'
  // sort() дараалал: p < r < s гэх мэт
  if (sorted === 'router-switch') return 1;
  if (sorted === 'pc1-switch')    return 2;   // ✅ Bug1 засвар: үргэлж 2
  if (sorted === 'pc2-switch')    return 3;   // ✅ Bug3 засвар: sort→'pc2-switch' тул 3
  if (sorted === 'pc1-pc2')       return 4;
  return null;
}

// ── 2. ЗАСВАРЛАСАН onVRTrigger ──
function onVRTrigger() {
  if (!state.routerOn) { setStatus('Router асаана уу! [A]', 'error'); return; }
  if (!state.selectedCableType) { setStatus('Кабель төрөл сонгоно уу! [X/Y]', 'error'); return; }

  const hit = vrRayHit();
  if (!hit) return;
  const nodeName = hit.object.userData.nodeName;
  if (!nodeName) return;

  if (state.vrFirstNode) {
    const first = state.vrFirstNode;
    const second = nodeName;

    if (first === second) { setStatus('Өөр node сонгоно уу!', 'error'); return; }

    const connIdx = resolveConnIdx(first, second); // ✅ нэг функц ашиглана

    if (connIdx) {
      selectConn(connIdx);
      validateAndConnect(connIdx);
      vrFlash(hit.point, state.selectedCableType === 'straight' ? 0x4ade80 : 0xf97316);
    } else {
      setStatus(`❌ "${first}" ↔ "${second}" холболт тодорхойгүй`, 'error');
    }

    // ✅ Bug2 засвар: temp cable заавал арилгана
    state.vrFirstNode = null;
    firstNodeMarker.visible = false;
    rayMat.color.setHex(0x00d4ff);
    if (state.vrTempCable) { scene.remove(state.vrTempCable); state.vrTempCable = null; }

  } else {
    state.vrFirstNode = nodeName;
    const wp = new THREE.Vector3();
    hit.object.getWorldPosition(wp);
    firstNodeMarker.position.copy(wp);
    firstNodeMarker.visible = true;
    rayMat.color.setHex(0xffaa00);
    setStatus(`✅ "${nodeName}" сонгогдлоо — хоёрдох node дарна уу`, '');
    vrPulse(nodeName);
  }
}

// ── 3. ЗАСВАРЛАСАН onVRGripUp ──
function onVRGripUp() {
  if (!state.vrCableHeld) return;
  state.vrCableHeld = false;
  rayMat.color.setHex(0x00d4ff);

  // ✅ Bug2 засвар: grip-д ч гэсэн temp cable арилгана
  if (state.vrTempCable) { scene.remove(state.vrTempCable); state.vrTempCable = null; }

  const hit = vrRayHit();
  if (!hit || !hit.object.userData.nodeName) {
    setStatus('Холбогдсонгүй', 'error');
    state.vrCableStart = null;
    return;
  }

  const startNode = state.vrCableStart;
  const endNode = hit.object.userData.nodeName;

  if (startNode === endNode) {
    setStatus('Өөр node сонгоно уу!', 'error');
    state.vrCableStart = null;
    return;
  }

  const connIdx = resolveConnIdx(startNode, endNode); // ✅ нэг функц ашиглана

  if (connIdx) {
    selectConn(connIdx);
    validateAndConnect(connIdx);
    vrFlash(hit.point, state.selectedCableType === 'straight' ? 0x4ade80 : 0xf97316);
  } else {
    setStatus(`❌ "${startNode}" → "${endNode}" холболт байхгүй`, 'error');
  }

  state.vrCableStart = null;
}
