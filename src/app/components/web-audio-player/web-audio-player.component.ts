var WaveSurfer = require('./../../../lib/wavesurfer/wavesurfer');
import {Component, OnInit, OnDestroy, ElementRef} from '@angular/core';

@Component({
    selector: 'web-audio-player',
    template: '<div></div>',
    styleUrls: ['./web-audio-player.style.css']
})

export class WebAudioPlayerComponent implements OnInit, OnDestroy{
    waveSurfer: any;

    constructor(private elementRef: ElementRef) {

    }

    ngOnInit(): void {
        const container = this.elementRef.nativeElement;
        this.waveSurfer = WaveSurfer.create({
            container: container,
            waveColor: '#efefef',
            progressColor: '#26a69a',
            cursorColor: 'white',
            barWidth: 1,
            height: 50,
            skipLength: 10,
            interact: true,
            cursorWidth: 0,
            hideScrollbar: true,
            normalize: true
        });

        this.waveSurfer.load('./../../../../music/Boum Boum.mp3');

        this.waveSurfer.on('ready', () => {
            this.waveSurfer.play();
        });
    }

    ngOnDestroy(): void {
        this.waveSurfer.destroy();
    }
}