/**
 * Created by jonayet on 11/4/16.
 */
import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import {WebAudioPlayerComponent} from './components/web-audio-player/web-audio-player.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        AppComponent,
        WebAudioPlayerComponent
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }