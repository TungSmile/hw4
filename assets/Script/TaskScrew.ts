import { _decorator, AudioClip, AudioSource, Color, Component, log, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { DataManager } from './DataManager';
const { ccclass, property } = _decorator;

@ccclass('TaskScrew')
export class TaskScrew extends Component {

    colorScrew: string = '';
    slotEmpty = 3;
    slotDone = 0;
    needReset: boolean = false;
    @property({ type: [Node] })
    Screws: Node[] = [];
    originPos: Vec3;
    @property({ type: [AudioClip] })
    sound: AudioClip[] = [];

    start() {
        let t = this;
        t.originPos = t.node.position.clone();
    }

    resetTask(color: string) {
        let t = this;
        t.colorScrew = color;
        if (color == null) {
            t.node.children.forEach(e => {
                e.getComponent(Sprite).color = new Color("#FFFFFF");
                e.active = false;
                if (e.name == "screw" || e.name == "close") e.active = true;
            })
            return
        }
        if (t.needReset) {
            let newPos = new Vec3(t.originPos.x, t.originPos.y + 320, t.originPos.z)
            DataManager.instance.timeEvent = true;
            tween(t.node)
                .delay(DataManager.instance.timeAnim / 2)
                .to(DataManager.instance.timeAnim, { position: newPos })
                .call(() => {
                    t.node.children.forEach(e => {
                        e.getComponent(Sprite).color = new Color(color);
                        if (e.name != "screw") {
                            e.active = false;
                        }
                    })
                    DataManager.instance.timeEvent = false;
                })
                .to(DataManager.instance.timeAnim, { position: t.originPos })
                .start();
            t.needReset = false;
        } else {
            t.node.children.forEach(e => {
                e.getComponent(Sprite).color = new Color(color);
                if (e.name != "screw") {
                    e.active = false;
                }
            })
        }
        t.slotDone = 0;
        t.slotEmpty = 3;
    }

    resetTaskBySF(SF: SpriteFrame, color: string = null) {
        let t = this;
        t.colorScrew = color;
        if (color == null) {
            t.node.children.forEach(e => {
                e.active = false;
                if (e.name == "screw") {
                    e.getComponent(Sprite).spriteFrame = SF;
                    e.active = true;
                }
                else {
                    if (e.name == "close")
                        e.active = true;
                    e.getComponent(Sprite).color = new Color("#FFFFFF");
                }
            })
            return
        }
        if (t.needReset) {
            let newPos = new Vec3(t.originPos.x, t.originPos.y + 320, t.originPos.z)
            DataManager.instance.timeEvent = true;
            tween(t.node)
                .delay(DataManager.instance.timeAnim / 2)
                .to(DataManager.instance.timeAnim, { position: newPos })
                .call(() => {
                    t.node.children.forEach(e => {
                        if (e.name != "screw") {
                            e.active = false;
                            e.getComponent(Sprite).color = new Color(color);
                        } else
                            e.getComponent(Sprite).spriteFrame = SF;
                    })
                    DataManager.instance.timeEvent = false;
                })
                .to(DataManager.instance.timeAnim, { position: t.originPos })
                .start();
            t.needReset = false;
        } else {
            t.node.children.forEach(e => {
                if (e.name != "screw") {
                    e.active = false;
                    e.getComponent(Sprite).color = new Color(color);
                } else
                    e.getComponent(Sprite).spriteFrame = SF;
            })
        }
        t.slotDone = 0;
        t.slotEmpty = 3;
    }

    eventScrew(localPos: Vec3): boolean {
        let t = this;
        let nameNode = t.slotDone.toString();
        let screw = t.node.getChildByName(nameNode);
        t.soundMusic();
        let posOrigin =
            screw.getPosition(new Vec3).clone()
        // screw.getWorldPosition(new Vec3).clone();

        // screw.active = true;
        // screw.setWorldPosition(posWorld);
        // screw.setPosition(localPos)
        tween(screw)
            .delay(DataManager.instance.timeAnim)
            .call(() => {
                screw.active = true;
            })
            .to(0, { position: localPos })
            .to(DataManager.instance.timeAnim, { position: posOrigin })
            .call(() => {
                DataManager.instance.timeEvent = false;
            })
            .start();
        t.slotDone++;
        t.slotEmpty--;
        if (t.slotDone == 3) {
            t.needReset = true;
            return true;
        }
        return false;
    }

    customCountScrew(color: string): boolean {
        let t = this;
        let nameNode = t.slotDone.toString();
        let screw = t.node.getChildByName(nameNode);
        screw.active = true;
        if (color == t.colorScrew) {
            t.slotDone++;
            t.slotEmpty--;
        }
        if (t.slotDone == 3) {
            t.needReset = true;
            return true;
        }
        return false;
    }

    soundMusic() {
        let t = this;
        let audio = t.node.getComponent(AudioSource);
        audio.clip = t.sound[t.slotDone];
        audio.play();
    }


    update(deltaTime: number) {

    }
}

