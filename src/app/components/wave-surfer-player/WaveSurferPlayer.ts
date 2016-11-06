/**
 * Created by jonayet on 11/7/16.
 */
import {Track} from './Track';

var playerStore = {};
var globalAudioContext = null;
declare var waveSurferEx;

var defaultConfig = {
    canMove: true,
    canTrim: true,
    canCopy: true,
    canDelete: true,
    duration: 150
};

var defaultState = {
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    doRepeat: false
};

var defaultRepeat = {
    start: 0,
    end: 100
};

var defaultTrackRegion = {
    color: "rgba(0, 0, 0, 0.1)",
    handleColor: "green"
};

var defaultSelectionRegion = {
    color: "rgba(0, 0, 0, 0.1)",
    handleColor: "green"
};

var defaultRepeatRegion = {
    color: "rgba(0, 0, 0, 0.1)",
    handleColor: "green"
};

var defaultModel = {
    id: "",
    config: defaultConfig,
    state: defaultState,
    trackRegion: defaultTrackRegion,
    selectionRegion: defaultSelectionRegion,
    repeatRegion: defaultRepeatRegion,
    tracks: [],
    repeat: defaultRepeat,
    waveSurferOptions: null,
    audioContext: null,
    onInit: noOperation,
    onReady: noOperation,
    onPlay: noOperation,
    onPause: noOperation,
    onFinish: noOperation,
    onProgress: noOperation,
    onStateUpdated: noOperation,
    onRequestRender: noOperation
};

function noOperation(){

}

var REPEAT_REGION_ID = "repeat";
var MINIMUM_REGION_LENGTH = 1;
var REGION_HANDLE_WIDTH = 2;

function WaveSurferPlayer(model) {
    var mergedModel = Object.assign({}, defaultModel, model);
    Object.assign(model, mergedModel);
    this.id = model.id;
    this.audioContext = model.audioContext || getAudioContext();
    this.audioBuffer = createAudioBuffer(model.config.duration, this.audioContext);
    this.waveSurfer = null;
    this.tracks = null;
    this.lastPlayTime = -1;
    this.model = model;
    this.state = model.state;
    this.config = model.config;
    this.isDestroying = false;
    this.repeat = defaultRepeat;
    this.selectedTrackId = 0;
    this.topmostZIndex = 0;
    this.idCounter = 0;
}

WaveSurferPlayer.prototype.initialize = function (element) {
    var waveSurferOptions = Object.assign({}, this.model.waveSurferOptions);
    waveSurferOptions.container = element.children()[0];
    waveSurferOptions.audioContext = this.audioContext;
    this.waveSurfer = waveSurferEx.create(waveSurferOptions);
    this.registerWaveSurferEvents();
    this.waveSurfer.setVolume(this.state.volume);
    this.setMute(this.state.isMuted);
    var player = this;
    this.loadTracks().then(function () {
        player.model.onReady(player);
    });
    this.model.onInit(this);
};

WaveSurferPlayer.prototype.update = function (tracks, state) {
    var currentState = Object.assign({}, this.state);
    Object.assign(this.state, state);
    this.state.isPlaying = currentState.isPlaying;
    if (currentState.isPlaying) {
        this.state.currentTime = currentState.currentTime;
    }
    this.waveSurfer.setVolume(this.state.volume);
    this.setMute(this.state.isMuted);
    if (tracks && tracks.length) {
        this.model.tracks = tracks;
    }
    var player = this;
    this.loadTracks().then(function () {
        player.model.onReady(player);
    });
};

WaveSurferPlayer.prototype.initializeTracks = function () {
    var timelinePosition = 0;
    var startGapOfNewTrack = 5;
    var player = this;
    this.tracks = this.model.tracks.map(function (source, index) {
        var trackId = player.idCounter++;
        var track = new Track(trackId, source);
        Object.assign(source, { wspTrackId: trackId });
        if (angular.isUndefined(track.startTime)) {
            track.startTime = index > 0 ? timelinePosition + startGapOfNewTrack : timelinePosition;
        }
        track.adjustEndTrim(player.config.duration);
        var region = {
            start: track.startTime,
            end: track.endTime
        };
        track.region = region;
        timelinePosition = region.end;
        return track;
    });
    this.selectDefaultTrack();
};

WaveSurferPlayer.prototype.selectDefaultTrack = function () {
    if (this.tracks && this.tracks.length)
        this.selectedTrackId = this.tracks[0].id;
};

WaveSurferPlayer.prototype.updateAudioBuffer = function () {
    if (this.isDestroying) { return; }
    var player = this;
    resetAudioBuffer(this.audioBuffer);

    this.tracks.forEach(function (track) {
        if (track.startTime > player.config.duration) { return; }
        if (track.buffer) {
            var bufferStartIndex = track.startTime * track.buffer.sampleRate;
            var trackStartIndex = track.startTrim * track.buffer.sampleRate;
            if (track.buffer.duration <= track.endTrim) { return; }
            var trackEndIndex = (track.buffer.duration - track.endTrim) * track.buffer.sampleRate;

            // adjust source range length for 'track.buffer'
            if (trackEndIndex >= track.buffer.length) {
                trackEndIndex = track.buffer.length - 1;
            }

            // adjust source range length for 'audioBuffer'
            var trackLength = trackEndIndex - trackStartIndex;
            var bufferEndIndex = bufferStartIndex + trackLength;
            if (bufferEndIndex >= player.audioBuffer.length) {
                trackEndIndex -= (bufferEndIndex - player.audioBuffer.length);
            }

            forEachChannel(player.audioBuffer, function (playerData, channelNo) {
                if (channelNo >= track.buffer.numberOfChannels) { return; }
                var trackData = track.buffer.getChannelData(channelNo);
                playerData.set(trackData.subarray(trackStartIndex, trackEndIndex), bufferStartIndex);
            });
        }
    });

    var wasPlaying = this.state.isPlaying;
    var currentTime = this.state.currentTime;
    this.waveSurfer.empty();
    this.waveSurfer.loadDecodedBuffer(this.audioBuffer);
    if (wasPlaying) {
        this.waveSurfer.play(currentTime);
        this.state.currentTime = currentTime;
    } else {
        this.waveSurfer.seekTo(currentTime / this.config.duration);
    }
};

WaveSurferPlayer.prototype.drawTrackRegions = function () {
    if (this.isDestroying) { return; }
    if (!this.tracks.length) { return; }
    var player = this;

    this.tracks.forEach(function (track) {
        if (track.region.start >= player.config.duration) { return; }
        var color = player.model.trackRegion.color;
        var handleColor = player.model.trackRegion.handleColor;
        if (track.id === player.selectedTrackId) {
            color = player.model.selectionRegion.color;
            handleColor = player.model.selectionRegion.handleColor;
        }
        player.waveSurfer.addRegion({
            id: track.id,
            start: track.region.start,
            end: track.region.end,
            drag: player.config.canMove,
            resize: player.config.canTrim,
            minLength: MINIMUM_REGION_LENGTH,
            showProgress: !track.buffer,
            //maxLength: track.duration,
            color: color,
            handleWidth: REGION_HANDLE_WIDTH,
            handleColor: handleColor
        });
    });
};

WaveSurferPlayer.prototype.setMute = function (mute) {
    mute = !!mute;
    if (this.waveSurfer.isMuted !== mute) {
        this.waveSurfer.toggleMute();
        this.model.onStateUpdated();
    } else {
        this.waveSurfer.toggleMute();
        this.waveSurfer.toggleMute();
    }
    this.model.state.isMuted = this.waveSurfer.isMuted;
};

WaveSurferPlayer.prototype.toggleMute = function () {
    this.setMute(!this.model.state.isMuted);
};

WaveSurferPlayer.prototype.destroy = function () {
    this.isDestroying = true;
    this.waveSurfer.destroy();
    delete this.audioBuffer;
};

WaveSurferPlayer.prototype.setRepeat = function (start, end) {
    this.state.doRepeat = true;
    this.repeat = {
        start: angular.isDefined(start) ? start : this.repeat.start,
        end: angular.isDefined(end) ? end : this.repeat.end
    };
    this.drawRegions();
};

WaveSurferPlayer.prototype.clearRepeat = function () {
    this.state.doRepeat = false;
    this.drawRegions();
};

WaveSurferPlayer.prototype.drawRepeatRegion = function () {
    if (!this.state.doRepeat || !this.repeat) return;
    this.waveSurfer.addRegion({
        id: REPEAT_REGION_ID,
        start: this.repeat.start,
        end: this.repeat.end,
        drag: true,
        resize: true,
        loop: true,
        minLength: MINIMUM_REGION_LENGTH,
        color: this.model.repeatRegion.color,
        handleWidth: REGION_HANDLE_WIDTH,
        handleColor: this.model.repeatRegion.handleColor
    });
};

WaveSurferPlayer.prototype.drawRegions = function () {
    this.clearRegions();
    this.drawTrackRegions();
    if (this.state.doRepeat) {
        this.drawRepeatRegion();
    }
    this.model.onRequestRender();
};

WaveSurferPlayer.prototype.clearRegions = function () {
    this.waveSurfer.clearRegions();
};

WaveSurferPlayer.prototype.copySelectedTrack = function () {
    if (!this.config.canCopy) { return; }
    var selectedTrack = this.getTrackById(this.selectedTrackId);
    if (!selectedTrack) { return; }

    var trackEndTimes = this.tracks.map(function (track) {
        return track.endTime;
    });
    var maxEndTime = Math.max.apply(this, trackEndTimes);
    if (maxEndTime >= this.config.duration - 1) { return; }

    var newTrackId = this.idCounter++;
    var newSrcTrack = Object.assign({}, selectedTrack.src, { wspTrackId: newTrackId });
    var newTrack = new Track(newTrackId, newSrcTrack);

    newTrack.startTime = maxEndTime;
    newTrack.adjustEndTrim(this.config.duration);
    newTrack.region = {
        start: newTrack.startTime,
        end: newTrack.endTime
    };

    selectedTrack.zIndex = ++this.topmostZIndex;
    this.model.tracks.push(newSrcTrack);
    this.tracks.push(newTrack);

    this.model.onStateUpdated();
    this.updateAudioBuffer();
    this.drawRegions();
};

WaveSurferPlayer.prototype.deleteSelectedTrack = function () {
    if (!this.config.canDelete) { return; }

    var trackIndex = this.getTrackIndex(this.selectedTrackId);
    if (trackIndex === -1) { return; }
    this.tracks.splice(trackIndex, 1);

    var sourceIndex = this.getTrackSourceIndex(this.selectedTrackId);
    if (sourceIndex === -1) { return; }
    this.model.tracks.splice(sourceIndex, 1);

    if (this.tracks[trackIndex]) {
        this.selectedTrackId = this.tracks[trackIndex].id;
    } else if (this.tracks[0]) {
        this.selectedTrackId = this.tracks[0].id;
    }

    this.model.onStateUpdated();
    this.updateAudioBuffer();
    this.drawRegions();
};

WaveSurferPlayer.prototype.loadTracks = function () {
    this.initializeTracks();
    this.updateAudioBuffer();
    this.drawRegions();
    var player = this;
    var promises = this.tracks.map(function (track) {
        return track.loadBuffer(player.audioContext).then(function () {
            track.adjustEndTrim(player.config.duration);
            track.region.end = track.endTime;
            player.updateAudioBuffer();
            player.drawRegions();
        });
    });
    return Promise.all(promises);
};

WaveSurferPlayer.prototype.registerWaveSurferEvents = function () {
    var player = this;
    this.waveSurfer.on('seek', function () {
        player.handleSeekEvent();
    });
    this.waveSurfer.on('audioprocess', function (time) {
        player.handleAudioProcessEvent(time);
    });
    this.waveSurfer.on('region-update-end', function (region, event, resize, drag) {
        player.handleRegionUpdateEndEvent(region, resize, drag);
    });
    this.waveSurfer.on('play', function () {
        player.handlePlayEvent();
    });
    this.waveSurfer.on('pause', function () {
        player.handlePauseEvent();
    });
    this.waveSurfer.on('finish', function () {
        player.handleFinishEvent();
    });
};

WaveSurferPlayer.prototype.handleSeekEvent = function () {
    this.state.currentTime = this.waveSurfer.getCurrentTime();
    this.model.onProgress(this.state.currentTime);
    this.lastPlayTime = this.state.currentTime - 1;
};

WaveSurferPlayer.prototype.handleAudioProcessEvent = function (time) {
    time = Math.round(time);
    if (time > this.lastPlayTime) {
        this.state.currentTime = time;
        this.model.onProgress(time);
        this.lastPlayTime = time;
    }
};

WaveSurferPlayer.prototype.handlePlayEvent = function () {
    this.state.isPlaying = true;
    this.lastPlayTime = -1;
    this.model.onPlay();
};

WaveSurferPlayer.prototype.handlePauseEvent = function () {
    this.state.isPlaying = false;
    this.model.onPause();
};

WaveSurferPlayer.prototype.handleFinishEvent = function () {
    this.waveSurfer.seekTo(0);
    this.state.isPlaying = false;
    this.drawRegions();
    this.model.onFinish();
};

WaveSurferPlayer.prototype.handleRegionUpdateEndEvent = function (region, resize, drag) {
    var regionId = region.id;
    if (regionId === REPEAT_REGION_ID) {
        this.repeat.start = region.start;
        this.repeat.end = region.end;
        return;
    }

    var track = this.getTrackById(regionId);
    if (!track) { return; }
    this.selectedTrackId = regionId;
    track.zIndex = ++this.topmostZIndex;

    if (resize === 'start') {
        this.handleStartTrimEvent(track, region);
        this.model.onStateUpdated();
    } else if (resize === 'end') {
        this.handleEndTrimEvent(track, region);
        this.model.onStateUpdated();
    } else if (drag) {
        this.handleMoveEvent(track, region);
        this.model.onStateUpdated();
    }
    this.sortTracksByZIndex();
    this.updateAudioBuffer();
    this.drawRegions();
};

WaveSurferPlayer.prototype.getTrackIndex = function (trackId) {
    var index = -1;
    for (var i = 0; i < this.tracks.length; i++) {
        if (this.tracks[i].id === trackId) {
            index = i;
            break;
        }
    }
    return index;
};

WaveSurferPlayer.prototype.getTrackSourceIndex = function (trackId) {
    var index = -1;
    for (var i = 0; i < this.model.tracks.length; i++) {
        if (this.model.tracks[i].wspTrackId === trackId) {
            index = i;
            break;
        }
    }
    return index;
};

WaveSurferPlayer.prototype.getTrackById = function (trackId) {
    return this.tracks[this.getTrackIndex(trackId)];
};

WaveSurferPlayer.prototype.sortTracksByZIndex = function () {
    this.tracks.sort(function (a, b) {
        return a.zIndex - b.zIndex;
    });
};

WaveSurferPlayer.prototype.handleMoveEvent = function (track, region) {
    var length = region.end - region.start;
    region.start = Math.round(region.start);
    region.end = region.start + length;
    track.startTime = region.start;
    track.region.start = region.start;
    track.region.end = region.end;
};

WaveSurferPlayer.prototype.handleStartTrimEvent = function (track, region) {
    var deltaRegionStart = region.start - track.region.start;
    var newStartTime = track.startTime + deltaRegionStart;
    var newStartTrim = track.startTrim + deltaRegionStart;
    newStartTime -= newStartTrim < 0 ? newStartTrim : 0;
    track.startTrim = newStartTrim > 0 ? newStartTrim : 0;
    track.startTime = newStartTime;
    region.start = newStartTime;
    track.region.start = region.start;
    track.region.end = region.end;
};

WaveSurferPlayer.prototype.handleEndTrimEvent = function (track, region) {
    var deltaRegionEnd = track.region.end - region.end;
    var newEndTrim = track.endTrim + deltaRegionEnd;
    track.endTrim = newEndTrim > 0 ? newEndTrim : 0;
    region.end = track.endTime;
    track.region.start = region.start;
    track.region.end = region.end;
};

function createAudioContext() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
}

function getAudioContext() {
    if (globalAudioContext) return globalAudioContext;
    globalAudioContext = createAudioContext();
    return globalAudioContext;
}

function forEachChannel(audioBuffer, callback) {
    for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
        if (!angular.isFunction(callback)) return;
        callback(audioBuffer.getChannelData(i), i);
    }
}

function resetAudioBuffer(buffer) {
    forEachChannel(buffer, function (data) {
        for (var i = 0; i < data.length; i++) {
            data[i] = 0;
        }
    });
}

function destroyAudioBuffer(buffer) {
    forEachChannel(buffer, function (data) {
        data = null;
    });
    buffer = null;
}

function createAudioBuffer(duration, audioContext) {
    var noOfChannels = 2;
    return audioContext.createBuffer(noOfChannels, duration * audioContext.sampleRate, audioContext.sampleRate);
}