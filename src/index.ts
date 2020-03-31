import { HomeAssistantRXJS } from 'home-assistant-rxjs';
import { take } from 'rxjs/operators';

const harxjs = new HomeAssistantRXJS();
harxjs.services$.pipe(take(1)).subscribe();
