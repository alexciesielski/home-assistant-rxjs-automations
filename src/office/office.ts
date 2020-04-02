import { LightTurnOnAttributes } from 'home-assistant-rxjs';
import { merge, timer } from 'rxjs';
import {
  debounce,
  filter,
  map,
  startWith,
  switchMap,
  switchMapTo,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { Home } from '../home/home';
import { getEntityStates, lightOptions } from '../util';
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

  readonly automations$ = merge(this.lightTurnOn() /* this.lightTurnOff() */);

  private lightTurnOn() {
    const intervalMs = 30 * 1000;
    const timer$ = timer(0, intervalMs).pipe(
      switchMapTo(this.automaticLights$),
      filter(automaticLights => automaticLights === 'on'),
    );

    const colorMode$ = this.colorMode$;
    const ledSwitch$ = this.led$;
    const motion$ = this.motion$.pipe(
      tap(_ => console.log('Office motion detected', _)),
      filter(motion => motion === 'on'),
      switchMapTo(this.automaticLights$),
      tap(_ => console.log('Office automatic lights', _)),
      filter(automaticLights => automaticLights === 'on'),
      switchMapTo(this.lux$),
      tap(_ => console.log('Office lux', _)),
      filter(lux => lux < 100),
      switchMapTo(this.led$),
      // filter(led => led === 'on'),
    );

    return merge(timer$, colorMode$, ledSwitch$, motion$).pipe(
      throttleTime(intervalMs),
      startWith(),
      switchMapTo(colorMode$),
      switchMap(colorMode => lightOptions(this.home, { colorMode })),
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
      tap(_ => console.log('turn on', _)),
      switchMap(lightOptions =>
        this.home.lights.turnOn(OfficeEntity.CeilingLED, lightOptions),
      ),
    );
  }

  private lightTurnOff() {
    const lightsTimeout$ = this.officeEntityStates$[
      OfficeEntity.LightsTimeout
    ].pipe(map(timeout => Number(timeout)));
    const ledSwitch$ = this.led$;
    const motion$ = this.motion$.pipe(filter(motion => motion === 'on'));

    return merge(ledSwitch$, motion$).pipe(
      switchMapTo(this.automaticLights$),
      filter(automaticLights => automaticLights === 'on'),
      switchMapTo(lightsTimeout$),
      debounce(value => timer(value)),
      tap(x => console.log('emitttttttt', x)),
    );
  }
}
