/**
 * Created by jonayet on 11/5/16.
 */
import {Injectable} from '@angular/core';
import {WebAudioPlayer} from './WebAudioPlayer';
import {IWebAudioPlayerModel} from "./IWebAudioPlayerModel";

@Injectable()
export class WebAudioPlayerService {
    playerMap: Map = new Map();

    constructor(){

    }

    addPlayer(model: IWebAudioPlayerModel){
        let player = new WebAudioPlayer();
        this.playerMap.set('1', player);
    }
}