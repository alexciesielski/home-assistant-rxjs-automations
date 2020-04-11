import {
  LightTurnOnAttributes,
  selectBooleanState,
  selectNumericState,
  selectState,
} from '@ciesielskico/home-assistant-rxjs';
import { merge, Observable, timer } from 'rxjs';
import {
  debounce,
  filter,
  map,
  switchMap,
  switchMapTo,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { Home } from '../home/home';
import { checkState, ColorMode } from '../util';
import { OfficeEntity } from './entities';

export const officeColorMode$ = (home: Home) =>
  home.entities.pipe(selectState(OfficeEntity.ColorMode));
export const officeAutomaticLights$ = (home: Home) =>
  home.entities.pipe(selectState(OfficeEntity.AutomaticLights));
export const officeLuxSensor$ = (home: Home) =>
  home.entities.pipe(selectNumericState(OfficeEntity.Lux));
export const officeMotion$ = (home: Home) =>
  home.entities.pipe(selectBooleanState(OfficeEntity.Motion));
export const officeLED$ = (home: Home) =>
  home.entities.pipe(selectState(OfficeEntity.CeilingLED));
export const officeLightsTimeout$ = (home: Home) =>
  home.entities.pipe(selectNumericState(OfficeEntity.LightsTimeout));

export const officeColorModeAutomation$ = (
  home: Home,
  config: {
    automaticLights$: Observable<string>;
    colorMode$: Observable<string>;
    led$: Observable<string>;
  },
) => {
  const intervalMs = 30 * 1000;
  const { automaticLights$, led$, colorMode$ } = config;
  const timer$ = timer(0, intervalMs).pipe(
    checkState(automaticLights$, 'on'),
    checkState(colorMode$, ColorMode.Circadian),
  );

  return merge(timer$, colorMode$, led$).pipe(
    checkState(led$, 'on'),
    throttleTime(1000),
    withLatestFrom(colorMode$),
    switchMap(([, colorMode]) => home.getLightOptions(colorMode)),
    withLatestFrom(colorMode$),
    map(([lightOptions, officeColorMode]) =>
      officeColorMode === 'Focus'
        ? ({
            ...lightOptions,
            rgb_color: [94, 158, 225],
            white_value: 150,
          } as LightTurnOnAttributes)
        : lightOptions,
    ),
    switchMap(lightOptions =>
      home.lights.turnOn(OfficeEntity.CeilingLED, lightOptions),
    ),
  );
};

export const officeLightTurnOnAutomation$ = (
  home: Home,
  config: {
    automaticLights$: Observable<string>;
    colorMode$: Observable<string>;
    motion$: Observable<boolean>;
    led$: Observable<string>;
    lux$: Observable<number>;
  },
): Observable<unknown> => {
  const { automaticLights$, motion$, led$, lux$, colorMode$ } = config;
  const motionDetected$ = motion$.pipe(
    filter(motion => motion),
    checkState(automaticLights$, 'on'),
    checkState(led$, 'off'),
    checkState(lux$, state => state < 100),
  );

  return motionDetected$.pipe(
    withLatestFrom(colorMode$),
    switchMap(([, colorMode]) => home.getLightOptions(colorMode)),
    withLatestFrom(colorMode$),
    map(([lightOptions, officeColorMode]) =>
      officeColorMode === 'Focus'
        ? ({
            ...lightOptions,
            rgb_color: [94, 158, 225],
            white_value: 150,
          } as LightTurnOnAttributes)
        : lightOptions,
    ),
    switchMap(lightOptions =>
      home.lights.turnOn(OfficeEntity.CeilingLED, lightOptions),
    ),
  );
};

export const officeLightTurnOffAutomation$ = (
  home: Home,
  config: {
    automaticLights$: Observable<string>;
    motion$: Observable<boolean>;
    led$: Observable<string>;
    lightsTimeout$: Observable<number>;
  },
) => {
  const { automaticLights$, led$, lightsTimeout$, motion$ } = config;
  const timeout$ = lightsTimeout$.pipe(map(timeout => Number(timeout)));

  const motionTriggered$ = motion$.pipe(filter(motion => motion));

  return merge(led$, motionTriggered$).pipe(
    checkState(automaticLights$, 'on'),
    withLatestFrom(timeout$),
    debounce(([, timeout]) => timer(timeout * 60 * 1000)),
    checkState(automaticLights$, 'on'),
    checkState(led$, 'on'),
    switchMapTo(home.lights.turnOff(OfficeEntity.CeilingLED)),
  );
};

export const officeAutomations$ = (home: Home) =>
  merge(
    officeColorModeAutomation$(home, {
      automaticLights$: officeAutomaticLights$(home),
      colorMode$: officeColorMode$(home),
      led$: officeLED$(home),
    }),
    officeLightTurnOnAutomation$(home, {
      automaticLights$: officeAutomaticLights$(home),
      colorMode$: officeColorMode$(home),
      led$: officeLED$(home),
      lux$: officeLuxSensor$(home),
      motion$: officeMotion$(home),
    }),
    officeLightTurnOffAutomation$(home, {
      automaticLights$: officeAutomaticLights$(home),
      led$: officeLED$(home),
      motion$: officeMotion$(home),
      lightsTimeout$: officeLightsTimeout$(home),
    }),
  );
