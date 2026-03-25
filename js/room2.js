import * as THREE from "three";

export function createRoom2(scene) {

    const room = new THREE.Group();
    scene.add(room);

    // 👉 room байрлал
    room.position.set(6, 0, 0);

    const roomW = 10, roomH = 5, roomD = 10;

    const mat = (c)=> new THREE.MeshStandardMaterial({color:c, roughness:0.8});

    // ======================
    // FLOOR
    // ======================
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(roomW, roomD),
        mat(0x8b7355)
    );
    floor.rotation.x = -Math.PI/2;
    floor.userData = { teleport: true };
    room.add(floor);

    // ======================
    // WALLS
    // ======================
    const wallMat = mat(0xd4c9b0);

    const wallB = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
    wallB.position.set(0, roomH/2, -roomD/2);
    room.add(wallB);

    const wallF = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
    wallF.rotation.y = Math.PI;
    wallF.position.set(0, roomH/2, roomD/2);
    room.add(wallF);

    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), wallMat);
    wallL.rotation.y = Math.PI/2;
    wallL.position.set(-roomW/2, roomH/2, 0);
    room.add(wallL);

    const wallR = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), wallMat);
    wallR.rotation.y = -Math.PI/2;
    wallR.position.set(roomW/2, roomH/2, 0);
    room.add(wallR);

    // ======================
    // LIGHT
    // ======================
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    room.add(light);

    // ======================
    // 🚪 DOOR (ROOM1 рүү буцах)
    // ======================
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(1,2,0.2),
        mat(0x8B5E3C)
    );
    door.position.set(-roomW/2 + 0.6, 1, 0);
    door.userData = { kind: "backDoor" };
    room.add(door);

    // ======================
    // 🔌 PORT (хаалган дээр)
    // ======================
    const port = new THREE.Mesh(
        new THREE.BoxGeometry(0.3,0.15,0.1),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );

    port.position.set(-roomW/2 + 0.6, 1, 0.2);

    port.userData = {
        kind: "port",
        label: "Ethernet Port"
    };

    room.add(port);

    // ======================
    // 🪑 CHAIR (суух)
    // ======================
    const chair = new THREE.Group();

    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(1,0.2,1),
        mat(0x8b5a2b)
    );
    seat.position.y = 0.5;
    chair.add(seat);

    const back = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,0.2),
        mat(0x8b5a2b)
    );
    back.position.set(0,1,-0.4);
    chair.add(back);

    chair.position.set(0,0,0);

    chair.userData = {
        kind: "chair",
        sitPosition: new THREE.Vector3(6,1,0.5)
    };

    room.add(chair);

    return room;
}
