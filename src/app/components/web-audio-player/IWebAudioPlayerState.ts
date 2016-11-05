/**
 * Created by jonayet on 11/5/16.
 */
import {IRepeat} from "./IRepeat";

export interface IWebAudioPlayerState{
    isPlaying: boolean,
    currentTime: number,
    volume: number,
    isMuted: boolean,
    repeat: IRepeat
}