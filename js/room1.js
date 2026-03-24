import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createRoom1(scene, camera) {

    const room = new THREE.Group();
    scene.add(room);

    // ======================
    // FLOOR
    // ======================
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20),
        new THREE.MeshStandardMaterial({ color: 0x101826 })
    );
    floor.rotation.x = -Math.PI/2;
    room.add(floor);

    // ======================
    // LIGHT (model харагдуулахад чухал)
    // ======================
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5,10,5);
    room.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    room.add(ambient);

    // ======================
    // DOOR → ROOM2
    // ======================
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(1,2,0.2),
        new THREE.MeshStandardMaterial({ color: 0x00ffcc })
    );
    door.position.set(4,1,0);
    door.userData = { kind: "door" };

    room.add(door);

    // ======================
    // GLB LOAD
    // ======================
    const loader = new GLTFLoader();

    loader.load(
        "./pc_network.glb",
        (gltf) => {

            const model = gltf.scene;

            // 🔥 SCALE (маш чухал)
            model.scale.set(0.09,0.09,0.09);
            room.add(model);
    model.position.sub(center);
    model.position.y = 0;
 camera.position.set(0, size.y * 1.5, size.z * 2);
    camera.lookAt(0, 0, 0);
            // 🔥 CENTER & CAMERA FIX
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            const size = new THREE.Vector3();

            box.getCenter(center);
            box.getSize(size);

            // model-ийг төвд авчирна
            model.position.sub(center);

            // camera тохируулна
            if (camera) {
                camera.position.set(0, size.y * 1.5, size.z * 2);
                camera.lookAt(0,0,0);
            }

            console.log("GLB LOADED ✅");
        },

        undefined,

        (err) => {
            console.error("GLB ERROR ❌", err);
        }
    );

    return room;
}