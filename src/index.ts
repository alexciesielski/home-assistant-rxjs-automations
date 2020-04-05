import { HomeAssistantRXJS } from '@ciesielskico/home-assistant-rxjs';
import { filter } from 'rxjs/operators';
import { Home } from './home/home';

const harxjs = new HomeAssistantRXJS();
const home = new Home(harxjs);
home.initialize();
home.connection$
  .pipe(filter(c => !!c))
  .subscribe(() => console.log('Initialized'));

// new OfficeAutomations(home).flickerLights$.subscribe();
