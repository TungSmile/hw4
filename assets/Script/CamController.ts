import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CamController')
export class CamController extends Component {

    forward: Vec3;
    right: Vec3;
    up: Vec3;
    positionOffset: Vec3;
    lookAt: Node;
    moveSmooth: number;
    start() {

    }

    SetMove() {
        let t = this;
        t.forward = new Vec3;
        t.right = new Vec3;
        t.up = new Vec3;
        Vec3.transformQuat(t.forward, Vec3.FORWARD, t.node.rotation);
        // can do that with t.up, t.right
        t.forward.multiplyScalar(t.positionOffset.z);
        let desiredPos = new Vec3();
        desiredPos = desiredPos.add(t.lookAt.worldPosition).subtract(t.forward).add(t.right).add(t.up);
        t.node.position = t.node.position.lerp(desiredPos, t.moveSmooth);

    }

    


    update(deltaTime: number) {

    }
}

