/**
 * Created by jonayet on 11/5/16.
 */
import {IWebAudioPlayerConfig} from "./IWebAudioPlayerConfig";
import {IWebAudioPlayerState} from "./IWebAudioPlayerState";
import {IWebAudioPlayerModel} from "./IWebAudioPlayerModel";
import {IRepeat} from "./IRepeat";
import {IRegionTheme} from "./IRegionTheme";

export const DefaultConfig : IWebAudioPlayerConfig = {
    canMove: true,
    canTrim: true,
    canCopy: true,
    canDelete: true,
    duration: 150
};

export const DefaultState : IWebAudioPlayerState = {
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    repeat: {
        enabled: true,
        start: 0,
        end: 0
    }
};

export const DefaultRepeat : IRepeat = {
    enabled: false,
    start: 0,
    end: 100
};

export const DefaultTrackRegionTheme : IRegionTheme = {
    color: "rgba(0, 0, 0, 0.1)",
    handleColor: "green"
};

export const DefaultSelectionRegionTheme : IRegionTheme = {
    color: "rgba(0, 0, 0, 0.1)",
    handleColor: "green"
};

export const DefaultRepeatRegionTheme : IRegionTheme = {
    color: "rgba(0, 0, 0, 0.1)",
    handleColor: "green"
};

export const DefaultModel: IWebAudioPlayerModel = <IWebAudioPlayerModel>{
    config: DefaultConfig,
    state: DefaultState,
    trackRegionTheme: Object.assign({}, DefaultTrackRegionTheme),
    selectionRegionTheme: DefaultSelectionRegionTheme,
    repeatRegionTheme: DefaultRepeatRegionTheme,
    tracks: [],
    waveSurferOptions: null,
    audioContext: null
};

export function constructModel(model :IWebAudioPlayerModel) : IWebAudioPlayerModel {
    return {
        id: model.id,
        config: Object.assign(DefaultConfig, model.config),
        state: Object.assign(DefaultState, model.state),
        trackRegionTheme: Object.assign(DefaultTrackRegionTheme, model.trackRegionTheme),
        selectionRegionTheme: Object.assign(DefaultSelectionRegionTheme, model.selectionRegionTheme),
        repeatRegionTheme: Object.assign(DefaultRepeatRegionTheme, model.repeatRegionTheme),
        tracks: [],
        waveSurferOptions: null,
        audioContext: null
    }
}