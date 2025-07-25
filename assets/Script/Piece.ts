import { _decorator, CCBoolean, Component, log, Node, Quat, RigidBody, tween, Vec3 } from 'cc';
import { DataManager } from './DataManager';
import { Screw } from './Screw';
const { ccclass, property } = _decorator;

@ccclass('Piece')
export class Piece extends Component {

    // @property({ type: [Node] })
    screw: Node[] = [];
    countScrew: number = 0;

    // @property({ type: CCBoolean })
    hasEvent: boolean = true;
    // @property({ type: [Material] })
    // colorScrew: Material[] = [];

    checkCase: boolean = false;


    start() {
        let t = this;
        // t.eventHideScrew()
        t.timeStart()
        t.node.getComponent(RigidBody).type = t.hasEvent ? RigidBody.Type.STATIC : RigidBody.Type.DYNAMIC;
        DataManager.instance.count(t.screw.length)
    }



    eventHideScrew() {
        let t = this;
        let time = 5
        if (t.hasEvent) {
            t.scheduleOnce(() => {
                t.waitShowScrew();
            }, time)
        }
    }



    timeStart() {
        let t = this;
        t.node.children.forEach((e) => {
            t.screw.push(e);
            // event hide screw 
            // e.active = false;
        })
        t.countScrew = t.screw.length;
    }

    waitShowScrew() {
        let t = this;
        t.node.children.forEach((e) => {
            e.active = true;
        })
    }


    eventRemoveScrew(n: Node) {
        let t = this;
        t.countScrew--;
        let temp = n.getChildByName("removePosition");
        let time = 0.3;
        tween(n)
            .to(time, { worldPosition: temp.worldPosition, worldRotation: temp.worldRotation })
            .call(() => {
                n.destroy();
                DataManager.instance.timeEvent = false;
                t.freeItem()
            })
            .start();

    }

    eventFailScrew(n: Node) {
        let t = this;
        let temp = n.getChildByName("removePosition");
        let time = 0.5;
        let posOrigin = n.getWorldPosition(new Vec3).clone();
        let rosOrigin = n.getWorldRotation(new Quat).clone();
        tween(n)
            .to(time / 2, { worldPosition: temp.worldPosition, worldRotation: temp.worldRotation })
            .to(time / 2, { worldPosition: posOrigin, worldRotation: rosOrigin })
            .call(() => {
            })
            .start()

    }


    checkObstacle(n: Node) {
        let t = this;
        let screw = n.getComponent(Screw);
        DataManager.instance.timeEvent = true;
        screw.tighten();
        t.scheduleOnce(() => {
            // if (screw.getStatus()) {
            //     DataManager.instance.timeEvent = false;
            //     t.countScrew--;
            //     t.freeItem()
            //     n.destroy();
            //     log('a')
            // } else {
            //     log('b')
            //     screw.loosen();
            // }
            t.checkCase = screw.getStatus()
        }, DataManager.instance.timeAnim * 1.1)
    }

    afterCheck(n: Node, isDel: boolean) {
        let t = this;
        let screw = n.getComponent(Screw);
        if (isDel) {
            DataManager.instance.timeEvent = false;
            t.countScrew--;
            t.freeItem()
            n.destroy();
            log('a')
        } else {
            log('b')
            screw.loosen();
        }
    }



    freeItem() {
        let t = this;
        log(t.countScrew)
        if (t.countScrew <= 0) {
            let nParent = t.node.parent.parent;
            t.node.name = "garbade";
            t.node.setParent(nParent, true);
            t.node.getComponent(RigidBody).type = RigidBody.Type.DYNAMIC;
            t.node.getComponent(RigidBody).applyForce(new Vec3(0, 300, 0));

        }
    }




    activeScrew() {
        let t = this;
        for (let i = 0; i < t.screw.length; i++) {
            const e = t.screw[i];
            e.active = true;
        }
    }


    update(deltaTime: number) {

    }
}

