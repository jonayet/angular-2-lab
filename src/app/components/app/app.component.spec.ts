/**
 * Created by jonayet on 11/4/16.
 */
import { TestBed } from '@angular/core/testing';
import { WebAudioPlayerComponent } from './../web-audio-player/web-audio-player.component';
import { AppComponent } from './app.component';

describe('App', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ declarations: [AppComponent, WebAudioPlayerComponent]});
    });
    it ('should work', () => {
        let fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance instanceof AppComponent).toBe(true, 'should create AppComponent');
    });
});