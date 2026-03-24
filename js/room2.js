import * as THREE from "three";

export function createRoom2(scene) {

    const room = new THREE.Group();
    scene.add(room);

    room.position.set(20,0,0);

    // FLOOR
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI/2;
    room.add(floor);

    // LAB PCs
    for (let i=0; i<5; i++) {
        const pc = new THREE.Mesh(
            new THREE.BoxGeometry(0.5,0.5,0.5),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        pc.position.set(i-2,0.5,0);
        room.add(pc);
    }

    // BACK DOOR
    const backDoor = new THREE.Mesh(
        new THREE.BoxGeometry(1,2,0.2),
        new THREE.MeshStandardMaterial({ color: 0xffcc00 })
    );
    backDoor.position.set(-4,1,0);
    backDoor.userData = { kind: "backDoor" };

    room.add(backDoor);

    return room;
}
floor.userData = { teleport: true };
