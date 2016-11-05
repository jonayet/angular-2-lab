/**
 * Created by jonayet on 11/5/16.
 */
import {IWebAudioPlayerModel} from "./IWebAudioPlayerModel";
import {constructModel} from "./WebAudioPlayerDefaults";
import {IWebAudioPlayerState} from "./IWebAudioPlayerState";
import {IWebAudioPlayerConfig} from "./IWebAudioPlayerConfig";
import {IWebAudioPlayer} from "./IWebAudioPlayer";
import {IRepeat} from "./IRepeat";
import {ITrack} from "./ITrack";

export class WebAudioPlayer implements IWebAudioPlayer{
    id: string;
    waveSurfer: any;
    config : IWebAudioPlayerConfig;
    state : IWebAudioPlayerState;
    tracks: Array<ITrack>;
    repeat: IRepeat;
    audioContext: AudioContext;
    audioBuffer: AudioBuffer;
    lastPlayTime: number;
    isDestroying: boolean;
    selectedTrackId: number;
    topmostZIndex: number;
    idCounter: number;

    constructor(model: IWebAudioPlayerModel){
        var playerModel = constructModel(model);
        this.id = model.id;
        this.config = playerModel.config;
        this.state = playerModel.state;
    }

    initialize() {
    }

    initializePlayerTracks() {
    }

    updateAudioBuffer() {
    }

    drawTrackRegions() {
    }

    toggleMute() {
    }

    destroy() {
    }

    setRepeat() {
    }

    clearRepeat() {
    }

    drawRepeatRegion() {
    }

    drawRegions() {
    }

    clearRegions() {
    }

    copySelectedTrack(){
    }
}