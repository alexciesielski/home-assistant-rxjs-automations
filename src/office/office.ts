import { LightTurnOnAttributes } from '@ciesielskico/home-assistant-rxjs';
import { merge, Observable, timer } from 'rxjs';
import {
  debounce,
  filter,
  map,
  switchMap,
  switchMapTo,
  take,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { Home } from '../home/home';
import { checkState, ColorMode, getEntityStates, lightOptions } from '../util';
import { Room } from '../util/room';
import { OfficeEntity } from './entities';

export class OfficeRoom extends Room {
  constructor(public home: Home) {
    super();
  }

  readonly officeEntityStates$ = getEntityStates<OfficeEntity>(
    this.home.entities,
    Object.values(OfficeEntity),
  );

  readonly colorMode$ = this.officeEntityStates$[OfficeEntity.ColorMode];
  readonly automaticLights$ = this.officeEntityStates$[
    OfficeEntity.AutomaticLights
  ];

  private readonly motion$ = this.officeEntityStates$[OfficeEntity.Motion];
  private readonly lux$ = this.officeEntityStates$[OfficeEntity.Lux].pipe(
    map(lux => Number(lux)),
  );
  private readonly led$ = this.officeEntityStates$[OfficeEntity.CeilingLED];

  readonly automations$ = merge(
    this.colorMode(),
    this.lightTurnOn({
      automaticLights$: this.automaticLights$,
      colorMode$: this.colorMode$,
      led$: this.led$,
      lux$: this.lux$,
      motion$: this.motion$,
    }),
    this.lightTurnOff(),
  );

  colorMode() {
    const intervalMs = 30 * 1000;
    const colorMode$ = this.colorMode$;
    const ledSwitch$ = this.led$;
    const timer$ = timer(0, intervalMs).pipe(
      checkState(this.automaticLights$, 'on'),
      checkState(colorMode$, ColorMode.Circadian),
    );

    return merge(timer$, colorMode$, ledSwitch$).pipe(
      checkState(ledSwitch$, 'on'),
      throttleTime(1000),
      withLatestFrom(colorMode$),
      switchMap(([, colorMode]) => lightOptions(this.home, colorMode)),
      withLatestFrom(this.colorMode$),
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
        this.home.lights.turnOn(OfficeEntity.CeilingLED, lightOptions),
      ),
    );
  }

  lightTurnOn(config: {
    automaticLights$: Observable<string>;
    colorMode$: Observable<string>;
    motion$: Observable<string>;
    led$: Observable<string>;
    lux$: Observable<number>;
  }) {
    const { automaticLights$, motion$, led$, lux$, colorMode$ } = config;
    const motionDetected$ = motion$.pipe(
      filter(motion => motion === 'on'),
      checkState(automaticLights$, 'on'),
      checkState(led$, 'off'),
      checkState(lux$, state => state < 100),
    );

    return motionDetected$.pipe(
      withLatestFrom(colorMode$),
      switchMap(([, colorMode]) => lightOptions(this.home, colorMode)),
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
        this.home.lights.turnOn(OfficeEntity.CeilingLED, lightOptions),
      ),
    );
  }

  lightTurnOff() {
    const lightsTimeout$ = this.officeEntityStates$[
      OfficeEntity.LightsTimeout
    ].pipe(map(timeout => Number(timeout)));
    const ledSwitch$ = this.led$;
    const motion$ = this.motion$.pipe(filter(motion => motion === 'on'));

    return merge(ledSwitch$, motion$).pipe(
      checkState(this.automaticLights$, 'on'),
      switchMapTo(lightsTimeout$.pipe(take(1))),
      debounce(value => timer(value * 60 * 1000)),
      checkState(this.automaticLights$, 'on'),
      checkState(this.led$, 'on'),
      switchMapTo(this.home.lights.turnOff(OfficeEntity.CeilingLED)),
    );
  }
}
