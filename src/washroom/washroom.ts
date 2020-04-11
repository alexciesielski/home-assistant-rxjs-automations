import { selectState } from '@ciesielskico/home-assistant-rxjs';
import { merge, Observable } from 'rxjs';
import { debounceTime, filter, switchMapTo } from 'rxjs/operators';
import { Home } from '../home/home';
import { checkState } from '../util';
import { WashroomEntity } from './entities';

// Entities

export const washroomLight$ = (home: Home) =>
  home.entities.pipe(selectState(WashroomEntity.Light));

// Automations
export const washroomLightTurnOffAutomation$ = (
  home: Home,
  config: { light$: Observable<string> },
) => {
  const { light$ } = config;
  return light$.pipe(
    filter(light => light === 'on'),
    debounceTime(10 * 60 * 1000),
    checkState(home.getAutomaticLights(), 'on'),
    switchMapTo(home.lights.turnOff(WashroomEntity.Light)),
  );
};

export const washroomAutomation$ = (home: Home) =>
  merge(
    washroomLightTurnOffAutomation$(home, { light$: washroomLight$(home) }),
  );
