/**
 * Created by jonayet on 11/5/16.
 */
import {IWebAudioPlayerConfig} from "./IWebAudioPlayerConfig";
import {IWebAudioPlayerState} from "./IWebAudioPlayerState";
import {IRegionTheme} from "./IRegionTheme";
import {ITrack} from "./ITrack";

export interface IWebAudioPlayerModel{
    id: string,
    config: IWebAudioPlayerConfig,
    state: IWebAudioPlayerState,
    tracks: ITrack[],
    trackRegionTheme: IRegionTheme,
    selectionRegionTheme: IRegionTheme,
    repeatRegionTheme: IRegionTheme
    waveSurferOptions: any,
    audioContext: AudioContext
}