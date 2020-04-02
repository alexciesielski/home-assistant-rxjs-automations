import { filter } from 'rxjs/operators';
import { Home } from './home/home';

const home = new Home();

home.connection$
  .pipe(filter(c => !!c))
  .subscribe(() => console.log('Initialized'));

// new OfficeAutomations(home).flickerLights$.subscribe();
