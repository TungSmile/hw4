import { _decorator, AudioClip, AudioSource, Component, log, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass('DataManager')
export class DataManager extends Component {
    private static _instance: any = null;
    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }
        return this._instance
    }

    static get instance() {
        return this.getInstance<DataManager>()
    }

    countDone: number = 0;
    countFail: number = 0;
    fristTouch: boolean = false;
    endGame: boolean = false;
    stockScrew: string[] = [];  // uselesss
    timeEvent: boolean = false;
    tempStock: string[] = [];

    scriptGame: number[] = [0, 1, 2, 3, 4, 6, 7, 8, 9, 0, 1];

    tableColor: string[] = [ColorGame.c1, ColorGame.c2, ColorGame.c3, ColorGame.c4, ColorGame.c5, ColorGame.c6, ColorGame.c7, ColorGame.c8, ColorGame.c9, ColorGame.c10];

    countAllS: number = 0;

    timeAnim: number = 0.3;

    getNameColorByType(type: number) {
        let t = this;
        if (type < 0 && type > t.tableColor.length) {
            return null;
        }
        return t.tableColor[type];
    }

    getTypeTaskByScript() {
        let t = this;
        if (t.scriptGame.length > 0) {
            return t.scriptGame.shift();
        }
        return null;
    }


    getTaskByScript() {
        let t = this;
        if (t.scriptGame.length > 0) {
            return t.getNameColorByType(t.scriptGame.shift())
        }
        return null
    }

    count(n) {
        this.countAllS += n;
    }

    getLogCount() {
        return this.countAllS
    }

    playAudio(node: Node, audio: AudioClip, loop: boolean = false, vol: number = 1) {
        let audioSource = node.getComponent(AudioSource);
        if (!audioSource) {
            audioSource = node.addComponent(AudioSource);
        }
        audioSource.clip = audio;
        audioSource.volume = vol;
        if (loop) {
            audioSource.node.on(AudioSource.EventType.ENDED, () => {
                audioSource.play();
            }, this)
        }
        if (audioSource) {
            audioSource.play();
        }
    }
}
// 24

export enum ColorGame {  //63
    c1 = "#FF81D9", // 6
    // hong
    c2 = "#048FEA", // 7
    // blue
    c3 = "#F4D11B", // 6
    // vang
    c4 = "#3FEEF7", // 7
    // xanh blue nhat
    c5 = "#D88148", // 6
    // nau
    c6 = "#730086", // 6
    // tim
    c7 = "#99DE11", // 6
    // xanh la ma
    c8 = "#F73F2F", // 6
    // do
    c9 = "#FAFAFA", // 6
    // trang hong
    c10 = "#3F3F3F" // 7
    // den
};