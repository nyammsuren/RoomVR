export function initXR(renderer, scene) {

    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);

    scene.add(controller1);
    scene.add(controller2);
}