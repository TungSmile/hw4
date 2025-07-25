import { _decorator, BoxCollider, Component, ITriggerEvent, log, Quat, RigidBody, tween, Vec3 } from 'cc';
import { DataManager } from './DataManager';
const { ccclass, property } = _decorator;

@ccclass('Screw')
export class Screw extends Component {

    checkObstacle: boolean = false;
    posOrigin: Vec3 = null;
    rosOrigin: Quat = null;



    
    start() {
        let t = this;
        t.getComponent(BoxCollider).on('onTriggerEnter', this.onTriggerEnter, this);
        // t.node.getChildByName("removePosition").setPosition(new Vec3(0, 0, 1))
    }

    private onTriggerEnter(event: ITriggerEvent) {
        let t = this;
        if (event.otherCollider.node.name == "item")
            t.checkObstacle = true;
    }

    tighten() {
        let t = this;
        let endP = t.node.getChildByName("removePosition");
        t.posOrigin = t.node.getWorldPosition(new Vec3).clone();
        t.rosOrigin = t.node.getWorldRotation(new Quat).clone();
        t.node.getComponent(RigidBody).type = RigidBody.Type.KINEMATIC;
        tween(t.node)
            .to(DataManager.instance.timeAnim, { worldPosition: endP.worldPosition, worldRotation: endP.worldRotation })
            .call(() => {
            })
            .start();
    }


    loosen() {
        let t = this;
        tween(t.node)
            .to(DataManager.instance.timeAnim, { worldPosition: t.posOrigin, worldRotation: t.rosOrigin })
            .call(() => {
                DataManager.instance.timeEvent = false;
                t.node.getComponent(RigidBody).type = RigidBody.Type.STATIC;
                t.checkObstacle = false;
            })
            .start()
    }





    getStatus() {
        return this.checkObstacle;
    }
    setStatus(value: boolean) {
        this.checkObstacle = value;
    }

    update(deltaTime: number) {

    }
}

