import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ✅ main.js-тэй яг таарсан гарын үсэг: (scene, camera, renderer)
export function createRoom1(scene, camera, renderer) {
    const room = new THREE.Group();
    scene.add(room);

    // ======================
    // FLOOR — teleport зөв
    // ======================
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x101826 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.userData = { teleport: true };
    room.add(floor);

    // ======================
    // LIGHTS
    // ======================
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 10, 5);
    room.add(light);
    room.add(new THREE.AmbientLight(0xffffff, 0.6));

    // ======================
    // DOOR → ROOM2
    // main.js: obj.userData.kind === "door" → goRoom(2)
    // ======================
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.8 })
    );
    door.position.set(2, 1, -2);
    door.name = "door_to_room2";
    door.userData = { kind: "door" };  // ✅ main.js шалгадаг зүйл
    room.add(door);

    // Хаалганы label (харагдахуйц болго)
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    const ctx = labelCanvas.getContext("2d");
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Хичээлийн танхимд →", 256, 64);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: labelTex, transparent: true })
    );
    label.position.set(2, 2.4, -2);
    label.scale.set(1.6, 0.4, 1);
    room.add(label);

    // ======================
    // GLB LOAD
    // ======================
    const loader = new GLTFLoader();
    loader.load(
        "./pc_network.glb",
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.09, 0.09, 0.09);
            room.add(model);

            // Дараалал зөв: нэмсний дараа Box3 тооцоолно
            const box    = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            const size   = new THREE.Vector3();
            box.getCenter(center);
            box.getSize(size);

            model.position.sub(center);
            model.position.y = 0;

            // ✅ VR-д camera шууд хөдлөхгүй — зөвхөн desktop горимд
            if (camera && !renderer?.xr?.isPresenting) {
                camera.position.set(0, size.y * 1.5, size.z * 2);
                camera.lookAt(0, 0, 0);
            }

            console.log("pc_network.glb LOADED ✅");
        },
        undefined,
        (err) => {
            console.error("pc_network.glb ERROR ❌", err);
        }
    );

    // ======================
    // UPDATE LOOP
    // main.js: room1.userData.update?.(delta, playerRig) дуудна
    // ======================
    room.userData.update = (delta, playerRig) => {
        // Ирээдүйд анимац, хөдөлгөөн энд нэмнэ
        // Жишээ: хаалганы гэрэл анивчих
        const t = performance.now() * 0.002;
        door.material.opacity = 0.5 + 0.3 * Math.sin(t);
    };

    return room;
}
