/**
 * Created by jonayet on 11/5/16.
 */

import {ITrack} from './ITrack';

export class Track implements ITrack{
    id: string;
    path: string;
    title: string;
    author: string;
    duration: number;
    startTime: number;
    startTrim: number;
    endTrim: number;
    src: ITrack;

    constructor(id: string, src: ITrack){
        this.id = id;
        this.path = src.path;
        this.title = src.title;
        this.author = src.author;
        this.duration = src.duration;
        this.startTime = src.startTime;
        this.startTrim = src.startTrim;
        this.endTrim = src.endTrim;
        this.src = src;
    }

    get endTime() {
        return this.startTime + this.duration - this.startTrim - this.endTrim;
    }
}