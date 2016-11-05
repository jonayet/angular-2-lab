/**
 * Created by jonayet on 11/5/16.
 */
import { TestBed } from '@angular/core/testing';
import { WebAudioPlayer } from './WebAudioPlayer';
import {IWebAudioPlayerModel} from './IWebAudioPlayerModel'

describe('WebAudioPlayer', () => {
    const model = <IWebAudioPlayerModel>{
        id: '123',
        config: {
            duration: 200,
            canTrim: false
        }
    };

    let player;
    beforeEach(() => {
        player = new WebAudioPlayer(model);
    });

    it ('player > id should be 123', () => {
        expect(player.id).toBe('123');
    });

    it ('player > config > duration should be 200', () => {
        expect(player.config.duration).toBe(200);
    });

    it ('player > config > canMove should be true', () => {
        expect(player.config.canMove).toBe(true);
    });

    it ('player > config > canTrim should be false', () => {
        expect(player.config.canTrim).toBe(false);
    });
});