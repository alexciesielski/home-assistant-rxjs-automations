import { HomeAssistantRXJS } from '@ciesielskico/home-assistant-rxjs';
import { filter } from 'rxjs/operators';
import { Home } from './home/home';

const harxjs = new HomeAssistantRXJS();
export const HOME = new Home(harxjs);
HOME.initialize();
HOME.connection$
  .pipe(filter(c => !!c))
  .subscribe(() => console.log('Initialized'));

// new OfficeAutomations(home).flickerLights$.subscribe();
