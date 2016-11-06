/**
 * Created by jonayet on 11/7/16.
 */
let bufferStore = {};

export class Track{
    id;
    src;
    region;
    zIndex = 0;

    constructor(id, src){
        this.id = id;
        this.src = src;
    }

    get path() { return this.src.url; }
    get duration() { return Number(this.src.duration); }
    set startTime(value){ this.src.startTime = value; }
    get startTime(){return this.src.startTime;}
    set startTrim(value){ this.src.startTrim = value; }
    get startTrim(){return this.src.startTrim;}
    set endTrim(value){ this.src.endTrim = value; }
    get endTrim(){return this.src.endTrim;}
    get buffer(){
        const bufferInfo = bufferStore[this.path];
        return bufferInfo ? bufferInfo.buffer : null;
    }
    get endTime(){return this.startTime + this.duration - this.startTrim - this.endTrim;}

    adjustEndTrim(timelineDuration) {
        if (this.endTime > timelineDuration) {
            const trimToAdd = this.endTime - timelineDuration;
            this.endTrim += trimToAdd;
        }
    }

    loadBuffer(audioContext) {
        if (this.buffer) {
            return Promise.resolve(this.buffer);
        } else {
            let bufferInfo = bufferStore[this.path];
            const track = this;
            if (bufferInfo && bufferInfo.loadingPromise) {
                return bufferInfo.loadingPromise;
            } else {
                bufferInfo = { loadingPromise: null, buffer: null };
                bufferInfo.loadingPromise = getAudioBufferFromFile(this.path, audioContext || bufferInfo.loadingPromise).then(function (buffer) {
                    bufferInfo.buffer = buffer;
                    bufferInfo.loadingPromise = null;
                    track.src.duration = buffer.duration;
                });
                bufferStore[this.path] = bufferInfo;
                return bufferInfo.loadingPromise;
            }
        }
    }
}

function getAudioBufferFromFile(path, audioContext) {
    return httpGet(path, { responseType: "arraybuffer" }).then(function (response) {
        return new Promise(function (resolve) {
            audioContext.decodeAudioData(response.data, function (buffer) {
                delete response.data;
                resolve(buffer);
            });
        });
    });
}

function httpGet(url, config){
    return new Promise(function(resolve, reject){
        const http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (http.readyState === XMLHttpRequest.DONE) {
                if (http.status === 200) {
                    resolve(http.response);
                } else {
                    reject()
                }
            }
        };
        http.open('GET', url);
        for(const key in config){
            if(config.hasOwnProperty(key)) {
                http[key] = config[key];
            }
        }
        http.send();
    });
}