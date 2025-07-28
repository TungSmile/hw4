import { _decorator, Animation, AudioClip, BoxCollider, Camera, Collider, Color, Component, EventTouch, find, geometry, Input, ITriggerEvent, Label, log, logID, Material, MeshRenderer, Node, PhysicsSystem, Quat, size, Size, Sprite, SpriteFrame, tween, UI, UITransform, Vec2, Vec3, view } from 'cc';
import { ColorGame, DataManager } from './DataManager';
import { Piece } from './Piece';
import { TaskScrew } from './TaskScrew';
import super_html_playable from './super_html_playable';
import { Responsive2D } from './Responsive2D';
import { AdManager } from './AdManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Camera })
    CamMain: Camera = null
    @property({ type: Node })
    objMain: Node = null;
    @property({ type: [AudioClip] })
    sound: AudioClip[] = [];
    @property({ type: Node })
    screne2d: Node = null;
    @property({ type: Node })
    blackHole: Node = null;
    @property({ type: [SpriteFrame] })
    imgTask: SpriteFrame[] = [];
    @property({ type: Node })
    ads: Node = null;

    // @property({ type: [Material] })
    // material: Material[] = [];


    countEndGame: number = 0;
    limitTime: number = 15;

    eventRotaion: boolean = false;
    startEventRotation = null;
    endEventRotation = null;
    smoothRotation = 0.0001;

    // for zoom
    private initialDistance: number = 0;
    private initialScale: number = 18;
    private isZoom: boolean = false;
    private zoomByGlass: boolean = false;

    // for in game
    private numTask: number = 4;
    private numTempStock: number = 6;


    // for hint
    @property({ type: Node })
    hand: Node = null;
    anglesHint: Vec3[] = [new Vec3(52, -25, 0), new Vec3(80, -15, 0), new Vec3(250, 60, 0), new Vec3(410, 0, 0)]
    countHint: number = 0;


    @property({ type: [Node] })
    hints: Node[] = [];


    @property({ type: Node })
    btnHint: Node = null;

    @property({ type: Material })
    invi: Material = null;




    start() {
        let t = this;
        t.screne2d.on(Node.EventType.TOUCH_START, t.firstTouch, t);
        t.setTask();
        view.on("canvas-resize", () => {
            t.resizeView();
        });
        t.resizeView();
        // t.scheduleOnce(() => {
        //     let angle = 15 * Math.PI / 180;
        //     let axis = new Vec3(1, 0, 0);
        //     t.objMain.setRotationFromEuler(new Vec3(30, 0, 0))
        //     // let quat = cc.quat.rotateAroundAxis(cc.Quat(), axis, angle);
        //     // t.objMain
        // }, 2)
        // console.log(t.test.setProperty('mainColor', new Color(255, 0, 0)));
        // t.scheduleOnce(t.hintZoom(), 1)
        // t.hintGame(t.anglesHint[t.countHint]);


        // test game
        t.hintStep(t.countHint);

        // event check end game
        t.schedule(() => {
            t.checkEndGame()
        }, 1);



        // event clean piece when done
        t.blackHole.getComponent(BoxCollider).on("onTriggerEnter", t.cleanPiece, t);
    }




    resizeView() {
        let t = this;
        const screenSize = view.getVisibleSize();
        let width = screenSize.width;
        let height = screenSize.height;
        let ratio = width / height;
        let leftD = t.screne2d.getChildByName("leftSide")
        let rightD = t.screne2d.getChildByName("rightSide")

        if (width < height) {
            // doc
            leftD.getComponent(Responsive2D).landscapeHorSpace = -25
            rightD.getComponent(Responsive2D).landscapeHorSpace = 25


        } else {
            //ngang
            if (ratio < 1.6) {
                leftD.getComponent(Responsive2D).landscapeHorSpace = -25 * ratio * 1.5
                rightD.getComponent(Responsive2D).landscapeHorSpace = 25 * ratio * 1.5
            }
            // leftD.getComponent(Responsive2D).landscapeHorSpace = -25
            // rightD.getComponent(Responsive2D).landscapeHorSpace = 25
        }
    }




    firstTouch() {
        let t = this;
        t.screne2d.off(Node.EventType.TOUCH_START, t.firstTouch, t);

        // DataManager.instance.fristTouch = true;
        // use for off hint
        // t.registerEventTouch();

        // t.btnHint.on(Node.EventType.TOUCH_START, t.actionHint, t);
        let temp = t.screne2d.getChildByName("taskMision");
        temp.on(Node.EventType.TOUCH_START, t.onTouchStart, t);
        DataManager.instance.playAudio(t.screne2d, t.sound[4], true, 0.5);
    }

    setTask() {
        let t = this;
        Object.keys(ColorGame).forEach(e => {
            DataManager.instance.stockScrew.push(ColorGame[e]);
        })
        for (let i = 0; i < t.numTask; i++) {
            // let valueColor = DataManager.instance.stockScrew[0];
            // DataManager.instance.stockScrew.shift()
            let task = t.screne2d.getChildByPath("taskMision/" + i);
            let numberType = DataManager.instance.getTypeTaskByScript()
            let type = t.imgTask[numberType]
            let color = DataManager.instance.getNameColorByType(numberType)
            task.getComponent(TaskScrew).resetTaskBySF(type, color);
        }
        // console.log( DataManager.instance.stockScrew);

    }

    registerEventTouch() {
        let t = this;
        let temp = t.screne2d.getChildByName("taskMision")
        // temp.on(Node.EventType.TOUCH_START, t.onTouchStart, t);
        temp.on(Node.EventType.TOUCH_MOVE, t.onTouchMove, t);
        temp.on(Node.EventType.TOUCH_END, t.onTouchEnd, t);
        temp.on(Node.EventType.TOUCH_CANCEL, t.onTouchEnd, t);
        temp.on(Input.EventType.MOUSE_WHEEL, t.rollMouse, t);

        // problem when add event touch on 3d obj
        // t.objMain.getChildByName("test").on(Input.EventType.TOUCH_START, t.test, t)
        // t.objMain.getChildByName("Cube").on(Input.EventType.TOUCH_START, t.test1, t)


        temp.getChildByPath("zoomCam/glass").on(Node.EventType.TOUCH_START, t.startTouchGlass, t);
        temp.getChildByName("zoomCam").on(Node.EventType.TOUCH_MOVE, t.onTouchGlass, t);
        temp.getChildByName("zoomCam").on(Node.EventType.TOUCH_END, t.offTouchGlass, t);
        temp.getChildByName("zoomCam").on(Node.EventType.TOUCH_CANCEL, t.offTouchGlass, t);
    }
    isHint: boolean = true;
    checkEndGame() {
        let t = this;
        if (DataManager.instance.endGame) {
            return
        }
        // with time
        if (t.isHint) {
            if (t.countEndGame >= t.limitTime) {
                t.screne2d.getChildByName("Ads").active = true
                DataManager.instance.endGame = true;
                log('end by overtime');
            }
            t.countEndGame++
        }
        // with turn
        // case win
        if (DataManager.instance.countDone > 30) {
            t.screne2d.getChildByName("Ads").active = true
            t.node.getComponent(AdManager).openAdUrl();
            DataManager.instance.endGame = true;
            t.EventNetWork();
        }
        // case lose
        if (DataManager.instance.countFail >= 1) {
            t.node.getComponent(AdManager).openAdUrl();
            t.screne2d.getChildByName("Ads").active = true
            DataManager.instance.endGame = true;
            t.EventNetWork();
        }

    }


    onTouchStart(event) {
        let t = this;
        const touches = event.getAllTouches();
        t.startEventRotation = event.getLocation();
        const camera = t.CamMain.getComponent(Camera);


        // log(DataManager.instance.getLogCount())
        // turn off hint zoom when play frist time after hint
        if (DataManager.instance.countDone == 3) {
            // t.endHintZoom();
        }
        if (DataManager.instance.endGame || DataManager.instance.timeEvent) {
            return
        }


        // event zoom camera
        if (touches.length >= 2) {
            const touch1 = touches[0].getLocation();
            const touch2 = touches[1].getLocation();
            t.initialDistance = Vec2.distance(touch1, touch2);
            t.isZoom = true;
            t.initialScale = t.CamMain.node.position.z
            return;
        }

        // event raycast check obj
        let ray = new geometry.Ray();
        camera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);
        const mask = 0xffffffff;
        const maxDistance = 10000000;
        const queryTrigger = true;
        const bResult = PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger);
        if (bResult) {
            const results = PhysicsSystem.instance.raycastResults;
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const collider = raycastClosestResult.collider;
            if (collider.node) {
                if (t.checkCollider(collider.node)) {
                    return;
                }
            }
        }  ///#ff330000   #FF7000   #E436FC8E
    }


    checkCollider(n: Node): boolean {
        let t = this;
        let rs = false;
        switch (n.name) {
            case "Hint":
                t.eventScrew(n.getChildByName("oc_low").getComponent(MeshRenderer).getMaterial(0).name);
                DataManager.instance.timeEvent = true;
                n.parent.getComponent(Piece).eventRemoveScrew(n);
                t.countDone()
                t.countHint++;
                t.hintStep(t.countHint)
                return true
            case "Screw":
                if (t.countHint > 2) {
                    let prS = n.parent;
                    let color = n.getChildByName("oc_low").getComponent(MeshRenderer).getMaterial(0).name;
                    DataManager.instance.timeEvent = true;
                    prS.getComponent(Piece).checkObstacle(n);
                    t.scheduleOnce(() => {
                        // if (!temp.isValid) {
                        //     rs = t.eventScrew(color);
                        //     log('true')
                        // }
                        if (!prS.getComponent(Piece).checkCase) {
                            rs = t.eventScrew(color);
                            t.countDone()
                        }
                        prS.getComponent(Piece).afterCheck(n, rs);
                    }, DataManager.instance.timeAnim * 1.2)
                    return rs;
                }
                break;
            case "item":
                t.item = n.getComponent(MeshRenderer);
                t.holdMaterial = t.item.getMaterial(0);
                t.item.setMaterialInstance(t.invi, 0)
                return true
            default:
                break;
        }
        return rs;
    }

    holdMaterial = null;
    item = null;


    countDone() {
        let t = this;
        t.screne2d.getChildByPath("taskMision/count").active = true;
        DataManager.instance.countDone++;
        t.screne2d.getChildByPath("taskMision/count/t").getComponent(Label).string = DataManager.instance.countDone + "/" + DataManager.instance.countAllS;
    }


    eventScrew(nameColor: string): boolean {
        let t = this;
        let rs = false
        for (let i = 0; i < t.numTask; i++) {
            let task = t.screne2d.getChildByPath("taskMision/" + i);
            if (task.getComponent(TaskScrew).colorScrew == nameColor) {
                rs = true;
                let WPos = t.screne2d.getChildByName("Camera").getComponent(Camera).screenToWorld(new Vec3(t.startEventRotation.x, t.startEventRotation.y, 0));
                let localPos = task.getComponent(UITransform).convertToNodeSpaceAR(WPos, new Vec3());
                if (task.getComponent(TaskScrew).eventScrew(localPos)) {
                    t.scheduleOnce(() => {
                        let numberType = DataManager.instance.getTypeTaskByScript();
                        let type = t.imgTask[numberType]
                        let color = DataManager.instance.getNameColorByType(numberType)

                        task.getComponent(TaskScrew).resetTaskBySF(type, color);
                        // task.getComponent(TaskScrew).resetTask(valueType);
                        t.checkTempStock(color, task);
                        DataManager.instance.playAudio(t.screne2d.getChildByName("taskMision"), t.sound[3]);
                    }, DataManager.instance.timeAnim * 2);
                    return rs;
                }
                const index = DataManager.instance.tempStock.indexOf(nameColor);
                if (index !== -1) {
                    DataManager.instance.tempStock.splice(index, 1);
                    t.removeTempStock();
                    if (task.getComponent(TaskScrew).customCountScrew(nameColor)) {
                        t.scheduleOnce(() => {
                            let numberType = DataManager.instance.getTypeTaskByScript();
                            let type = t.imgTask[numberType]
                            let color = DataManager.instance.getNameColorByType(numberType)
                            task.getComponent(TaskScrew).resetTaskBySF(type, color);
                            // task.getComponent(TaskScrew).resetTask(valueType);
                            t.checkTempStock(color, task);
                        }, DataManager.instance.timeAnim * 2);
                    }
                }
                return rs;
            }
        }

        // for temp stock
        if (DataManager.instance.tempStock.length < t.numTempStock
            // && t.countHint == 3
        ) {
            t.addMoreTempStock(nameColor, DataManager.instance.tempStock.length);
            DataManager.instance.playAudio(t.screne2d.getChildByName("taskMision"), t.sound[1]);
            rs = true;
        }
        // else if (DataManager.instance.tempStock.length == t.numTempStock) {
        //     DataManager.instance.countFail++;
        // }

        return rs;
    }


    addMoreTempStock(nameColor: string, stt: number) {
        let t = this;
        let time = 1;
        let slot = t.screne2d.getChildByPath("taskMision/tempStock/" + stt);
        let WPos = t.screne2d.getChildByName("Camera").getComponent(Camera).screenToWorld(new Vec3(t.startEventRotation.x, t.startEventRotation.y, 0));
        let localPos = slot.getComponent(UITransform).convertToNodeSpaceAR(WPos, new Vec3());
        let screw = slot.getChildByName("bolt");
        screw.getComponent(Sprite).color = new Color(nameColor);
        // t.scheduleOnce(() => {
        tween(screw)
            .to(0, { position: localPos }).call(() => {
                screw.active = true;
            })
            .to(time / 2, { position: Vec3.ZERO })
            .call(() => {
                DataManager.instance.timeEvent = false;
                if (DataManager.instance.tempStock.length == t.numTempStock) {
                    DataManager.instance.countFail++;
                }

            })
            .start();
        // }, time / 2)
        DataManager.instance.tempStock.push(nameColor);


    }

    checkTempStock(color: string, task: Node = null) {
        let t = this;
        let countMap = {};
        let count = 0;
        DataManager.instance.tempStock.forEach(item => {
            if (item == color) {
                count++
            }
        });
        for (let i = 0; i < DataManager.instance.tempStock.length; i++) {
            let e = DataManager.instance.tempStock[i];
            if (e == color) {
                t.stockToTask(i, task)
                count++
            }
        }
        if (count > 0) {
            DataManager.instance.tempStock =
                DataManager.instance.tempStock.filter(item => item !== color);

            t.scheduleOnce(() => {
                t.removeTempStock()
                DataManager.instance.playAudio(t.screne2d.getChildByName("taskMision"), t.sound[3]);
            }, 0.5)
        }
    }

    stockToTask(stt: number, Task: Node) {
        let t = this;
        let stock = t.screne2d.getChildByPath("taskMision/tempStock").children[stt].getChildByName("bolt");
        let pos = Task.getComponent(UITransform).convertToNodeSpaceAR(stock.getWorldPosition(new Vec3), new Vec3());
        if (Task.getComponent(TaskScrew).eventScrew(pos)) {
            t.scheduleOnce(() => {
                let numberType = DataManager.instance.getTypeTaskByScript();
                let type = t.imgTask[numberType]
                let color = DataManager.instance.getNameColorByType(numberType)
                Task.getComponent(TaskScrew).resetTaskBySF(type, color);
                // Task.getComponent(TaskScrew).resetTask(valueType);
                t.checkTempStock(color, Task);
                DataManager.instance.playAudio(t.screne2d.getChildByName("taskMision"), t.sound[3]);
            }, 1);
        }
    }



    removeTempStock() {
        let t = this;
        let stock = t.screne2d.getChildByPath("taskMision/tempStock").children;
        for (let i = 0; i < stock.length; i++) {
            const e = stock[i];
            if (DataManager.instance.tempStock[i] != null) {
                e.getChildByName("bolt").active = true;
                e.getChildByName("bolt").getComponent(Sprite).color = new Color(DataManager.instance.tempStock[i])
            } else {
                e.getChildByName("bolt").active = false;
            }
        }
    }

    getNewColor() {
        let t = this;
        let valueColor = DataManager.instance.stockScrew[0];
        DataManager.instance.stockScrew.shift()
        return valueColor
    }

    cleanPiece(event: ITriggerEvent) {
        let t = this;
        event.otherCollider.node.destroy();
    }


    onTouchMove(event) {
        let t = this;
        const currentPos = event.getLocation();
        const touches = event.getAllTouches();
        if (DataManager.instance.endGame || DataManager.instance.timeEvent || t.zoomByGlass) {
            return
        }
        // eventZoom
        if (t.isZoom) {
            if (t.countHint == 2) {
                t.countHint++;
                t.hintStep(t.countHint)
            }
            const touch1 = touches[0].getLocation();
            const touch2 = touches[1].getLocation();
            const currentDistance = Vec2.distance(touch1, touch2);
            const scaleChange = currentDistance / (t.initialDistance);
            let pos = t.CamMain.node.position.clone();
            console.log(scaleChange);
            let tempz =
                // kéo to 
                t.initialScale / scaleChange
            // kéo nhỏ
            // scaleChange * t.initialScale 
            if (tempz <= 19 && tempz >= 14) {
                t.CamMain.node.setPosition(pos.x, pos.y, tempz)
                t.showGlass(tempz)
            }
            return;
        }

        // event rotation2 

        if (t.startEventRotation && !t.isZoom) {
            if (t.countHint == 1) {
                t.countHint++;
                t.hintStep(t.countHint)
            }
            const rotateX = ((currentPos.x - t.startEventRotation.x) * t.smoothRotation) * 1.8;
            const rotateY = -((currentPos.y - t.startEventRotation.y) * t.smoothRotation) * 1.8;
            // t.objMain.rotation = Quat.rotateAround(new Quat, t.objMain.rotation.clone(), Vec3.UNIT_X, rotateY)
            t.objMain.rotation = Quat.rotateAround(new Quat, t.objMain.rotation.clone(), Vec3.UNIT_Y, rotateX)
            t.endEventRotation = currentPos;
        }
    }


    showGlass(rate: number) {
        let t = this;
        let glass = t.screne2d.getChildByPath("taskMision/zoomCam/glass");
        glass.setPosition(new Vec3(10, ((rate - 14) * (-60)) + 150, 0))
        // 19 nho 14 to

    }

    // 0 +150 
    startTouchGlass(e) {
        let t = this
        t.zoomByGlass = true;
        if (t.countHint == 2) {
            t.countHint++;
            t.hintStep(t.countHint)
        }
    }

    onTouchGlass(e) {
        let t = this;
        if (DataManager.instance.endGame) {
            return
        }
        if (t.zoomByGlass) {
            const mousePosition = new Vec3(e.getUILocation().x, e.getUILocation().y, 0);
            let localPosition = new Vec3();
            find('Canvas/taskMision/zoomCam').getComponent(UITransform).convertToNodeSpaceAR(mousePosition, localPosition);
            // console.log(localPosition);
            if (localPosition.x > 100 || localPosition.x < -100) {
                t.zoomByGlass = false
                return
            }
            if (localPosition.y <= 150 && localPosition.y >= -150) {
                let temp = ((localPosition.y - 150) / -60) + 14;
                let pos = t.CamMain.node.position.clone();
                t.CamMain.node.setPosition(pos.x, pos.y, temp)
                t.showGlass(temp);
            }

            // 
        }

    }

    offTouchGlass(e) {
        this.zoomByGlass = false;
    }



    rollMouse(event) {
        let t = this;
        if (DataManager.instance.endGame) {
            return
        }
        if (t.countHint == 2) {
            t.countHint++;
            t.hintStep(t.countHint)
        }
        // t.endHintZoom()
        let temp = (event.getScrollY()) / 1000;
        let pos = t.CamMain.node.position.clone();
        let tempz = t.initialScale + temp;
        if (tempz <= 19 && tempz >= 14) {
            t.CamMain.node.setPosition(pos.x, pos.y, tempz);
            t.initialScale = tempz;
            t.showGlass(tempz)
        }

    }


    onTouchEnd(event) {
        let t = this;
        // t.startEventRotation = null;
        // t.endEventRotation = null;
        t.isZoom = false;
        if (t.holdMaterial != null && t.item != null) {
            t.item.setMaterialInstance(t.holdMaterial, 0);
            t.holdMaterial = null;
            t.item = null;
        }
    }

    eff = null;
    hintStep(step: number) {
        let t = this;
        // let pos;
        let text;
        switch (step) {
            case 0:
                t.hand.active = true;
                text = "CLICK ON THE SCREW";
                t.screne2d.getChildByName("text").getComponent(Label).string = text.toUpperCase();
                t.effClick()
                t.countEndGame = 0
                break;
            case 1:
                t.cleanEff();
                t.hand.setPosition(new Vec3(400, 0, 0));
                t.registerEventTouch();
                text = "swipe to rotate the object";
                t.screne2d.getChildByName("text").getComponent(Label).string = text.toUpperCase();
                t.effSwipe();
                t.countEndGame = 0
                break;
            case 2:
                t.cleanEff();
                t.effZoom2()
                // t.effZoom()
                text = "Pinch the screen to zoom in or out";
                t.screne2d.getChildByName("text").getComponent(Label).string = text.toUpperCase();
                t.countEndGame = 0
                break;
            case 3:
                t.cleanEff();
                t.hand.destroy();
                t.screne2d.getChildByName("text").destroy()
                t.isHint = false;
                break;
            default:
                break;
        }
    }



    getPosForHint() {
        let t = this;
        let item = t.hints[0]
        let pos = t.CamMain.convertToUINode(item.getWorldPosition(new Vec3), t.screne2d, new Vec3);
        return pos;
    }

    convert3DTo2D(worldPos: Vec3): Vec3 {
        let t = this;
        return this.CamMain.getComponent(Camera).convertToUINode(worldPos, t.screne2d);
    }


    effClick() {
        let t = this;
        let hand = t.hand.getChildByName("hand");
        let timeAnim = 0.5;
        hand.setRotationFromEuler(new Vec3(0, 0, 90));
        t.eff = tween(hand)
            .to(timeAnim, { position: new Vec3(50, 0, 0) })
            .to(timeAnim, { position: new Vec3(0, 0, 0) })
            .call(() => {
                hand.active = true;
                t.effClick()
            })
            .start()
    }


    effSwipe() {
        let t = this;
        let arrow = t.hand.getChildByName("arrow");
        let timeAnim = 0.7;
        let bodyA = arrow.getChildByName("body");
        let hand = t.hand.getChildByName("hand");
        arrow.setRotationFromEuler(new Vec3(0, 0, 180));
        hand.setRotationFromEuler(new Vec3(0, 0, 90));
        hand.setScale(new Vec3(-1, 1, 1))
        arrow.active = true;
        tween(hand)
            .to(timeAnim, { position: new Vec3(0, -10, 0) })
            .to(0, { position: new Vec3(0, 90, 0) })
            .call(() => {
            })
            .start()
        tween(arrow)
            .to(timeAnim, { position: new Vec3(0, 0, 0) })
            .to(0, { position: new Vec3(0, 100, 0) })
            .call(() => { })
            .start()
        t.eff = tween(bodyA.getComponent(UITransform))
            .to(timeAnim, { contentSize: new Size(10, 100) })
            .to(0, { contentSize: new Size(10, 10) })
            .call(() => {
                t.effSwipe()
            })
            .start()
    }






    effZoom() {
        let t = this;
        let timeAnim = 0.7;
        let arrow = t.hand.getChildByName("arrow");
        let bodyA = arrow.getChildByName("body");
        let hand = t.hand.getChildByName("hand");
        let footer = t.hand.getChildByName("ass");
        footer.active = true;
        arrow.setRotationFromEuler(new Vec3(0, 0, 0));
        hand.setRotationFromEuler(new Vec3(0, 0, 90));
        hand.setScale(new Vec3(1, 1, 1));
        arrow.active = true;
        tween(hand)
            .to(timeAnim, { position: new Vec3(0, 120, 0) })
            .to(0, { position: new Vec3(0, 20, 0) })
            .call(() => {
            })
            .start()
        tween(arrow)
            .to(timeAnim, { position: new Vec3(0, 100, 0) })
            .to(0, { position: new Vec3(0, 0, 0) })
            .call(() => { })
            .start()
        t.eff = tween(bodyA.getComponent(UITransform))
            .to(timeAnim, { contentSize: new Size(10, 100) })
            .to(0, { contentSize: new Size(10, 10) })
            .call(() => {
                t.effZoom()
            })
            .start()
    }

    effZoom2() {
        let t = this;
        let timeAnim = 0.7;
        t.hand.getChildByName("arrow").active = false;
        t.hand.setPosition(new Vec3(-400, 200, 0));
        t.hand.getChildByName("hand").setPosition(new Vec3(0, 0, 0))
        // let hand = t.hand.getChildByName("hand");
        // hand.setRotationFromEuler(new Vec3(0, 0, 90));
        // hand.setScale(new Vec3(1, 1, 1));
        t.eff = tween(t.hand)
            .to(timeAnim, { position: new Vec3(-350, 200, 0) })
            .to(0, { position: new Vec3(-400, 200, 0) })
            .call(() => {
                t.effZoom2()
            })
            .start()
    }



    cleanEff() {
        let t = this;
        if (t.eff != null) {
            t.eff.stop();
            t.eff = null;
        }
    }



    update(deltaTime: number) {


    }

    EventNetWork() {
        super_html_playable.game_end();

    }




}




