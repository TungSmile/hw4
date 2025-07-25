import { _decorator, Component, CCString } from 'cc';
import super_html_playable from './super_html_playable';
const { ccclass, property } = _decorator;
@ccclass('AdManager')
export class AdManager extends Component {

    androidLink: string = "https://play.google.com/store/apps/details?id=com.gplay.wood.cube.out";

    iosLink: string = "https://apps.apple.com/us/app/wood-cube-out-3d/id6742124552";

    defaultLink: string = "https://play.google.com/store/apps/details?id=com.gplay.wood.cube.out";


    start() {
        super_html_playable.set_google_play_url(this.androidLink);
        super_html_playable.set_app_store_url(this.iosLink);
    }

    openAdUrl() {
        super_html_playable.game_end();
        super_html_playable.download();
    }
}


