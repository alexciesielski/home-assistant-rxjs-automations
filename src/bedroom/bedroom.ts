import { selectState } from '@ciesielskico/home-assistant-rxjs';
import { from, merge, Observable, timer } from 'rxjs';
import {
  mergeAll,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { HOME } from '..';
import { checkState, ColorMode } from '../util';
import { BedroomEntity } from './model';

const bedroomAutomaticLights$ = HOME.entities.pipe(
  selectState(BedroomEntity.AutomaticLights),
);
const bedroomColorMode$ = HOME.entities.pipe(
  selectState(BedroomEntity.ColorMode),
);
// const motion$ = HOME.entities.pipe(selectState(BedroomEntity.Motion));
const ceilingLED$ = HOME.entities.pipe(selectState(BedroomEntity.CeilingLight));
const bedLight$ = HOME.entities.pipe(selectState(BedroomEntity.BedLight));

export const colorModeAutomation$ = (config: {
  automaticLights$: Observable<string>;
  ceilingLED$: Observable<string>;
  bedLight$: Observable<string>;
  colorMode$: Observable<string>;
}): Observable<unknown> => {
  const intervalMs = 30 * 1000;
  const { automaticLights$, bedLight$, ceilingLED$, colorMode$ } = config;
  const timer$ = timer(0, intervalMs).pipe(
    checkState(automaticLights$, 'on'),
    checkState(colorMode$, ColorMode.Circadian),
  );

  const lights = [
    { state$: bedLight$, id: BedroomEntity.BedLight },
    { state$: ceilingLED$, id: BedroomEntity.CeilingLight },
  ];

  const lightAutomations = (light: {
    state$: Observable<string>;
    id: string;
  }) =>
    merge(timer$, colorMode$, light.state$).pipe(
      checkState(light.state$, 'on'),
      throttleTime(1000),
      withLatestFrom(colorMode$),
      switchMap(([, colorMode]) => HOME.getLightOptions(colorMode)),
      switchMap(lightOptions => HOME.lights.turnOn(light.id, lightOptions)),
    );

  const obs = from(lights.map(lightAutomations)).pipe(mergeAll());
  return obs;
};

export const AUTOMATIONS = () =>
  merge(
    colorModeAutomation$({
      automaticLights$: bedroomAutomaticLights$,
      bedLight$: bedLight$,
      ceilingLED$: ceilingLED$,
      colorMode$: bedroomColorMode$,
    }),
  );
