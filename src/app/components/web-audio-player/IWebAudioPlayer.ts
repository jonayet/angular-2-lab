/**
 * Created by jonayet on 11/5/16.
 */
import {ITrack} from "./ITrack";
import {IWebAudioPlayerModel} from "./IWebAudioPlayerModel";
import {IWebAudioPlayerState} from "./IWebAudioPlayerState";
import {IWebAudioPlayerConfig} from "./IWebAudioPlayerConfig";
import {IRepeat} from "./IRepeat";

export interface IWebAudioPlayer{
    id : string;
    waveSurfer : any;
    config : IWebAudioPlayerConfig;
    state : IWebAudioPlayerState;
    tracks : Array<ITrack>;
    repeat : IRepeat;
    audioContext : AudioContext;
    audioBuffer : AudioBuffer;
    lastPlayTime : number;
    isDestroying : boolean;
    selectedTrackId : number;
    topmostZIndex : number;
    idCounter : number;

    initialize();
    initializePlayerTracks();
    updateAudioBuffer();
    drawTrackRegions();
    toggleMute();
    destroy();
    setRepeat();
    clearRepeat();
    drawRepeatRegion();
    drawRegions();
    clearRegions();
    copySelectedTrack();
}