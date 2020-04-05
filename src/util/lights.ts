import {
  LightTurnOnAttributes,
  select,
} from '@ciesielskico/home-assistant-rxjs';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { HomeEntity } from '../home/entitites';
import { Home } from '../home/home';

export enum ColorMode {
  White = 'White',
  Circadian = 'Circadian',
  Party = 'Party',
}

export const lightOptions: (
  home: Home,
  colorMode?: string,
) => Observable<Partial<LightTurnOnAttributes>> = (home, colorMode) =>
  combineLatest([
    lightColor(home, colorMode),
    lightWhiteValue(home.getColorMode(), home.getPeopleSleepingCount()),
    lightBrightness(home.getPeopleSleepingCount()),
  ]).pipe(
    map(values =>
      values.reduce((options, option) => ({ ...options, ...option })),
    ),
    take(1),
  );

export function lightColor(
  home: Home,
  colorMode?: string,
): Observable<Partial<LightTurnOnAttributes>> {
  const colorMode$ = colorMode ? of(colorMode) : home.getColorMode();

  const circadian$ = home.entities.pipe(
    select(HomeEntity.CircadianSensor, 'attributes', 'rgb_color'),
    map(rgb_color => rgb_color as [number, number, number]),
  );

  return colorMode$.pipe(
    switchMap(mode => {
      switch (mode) {
        case ColorMode.Circadian:
          return circadian$.pipe(
            map(values => values.map(value => Math.floor(value))),
            take(1),
          );

        case ColorMode.Party:
          return of(partyColor());

        default:
        case ColorMode.White:
          return of([255, 255, 255]);
      }
    }),
    map(rgb_color => ({ rgb_color: rgb_color as [number, number, number] })),
  );
}

export function lightWhiteValue(
  colorMode$: Observable<ColorMode | string>,
  sleepingCount$: Observable<number>,
): Observable<Partial<LightTurnOnAttributes>> {
  const somebodySleeping$ = sleepingCount$.pipe(map(count => count > 0));

  return somebodySleeping$.pipe(
    switchMap(sleeping =>
      sleeping
        ? of(2)
        : colorMode$.pipe(
            map(colorMode => (colorMode === ColorMode.Party ? 2 : 255)),
            take(1),
          ),
    ),
    map(white_value => ({ white_value })),
  );
}

export function lightBrightness(
  sleepingCount$: Observable<number>,
): Observable<Partial<LightTurnOnAttributes>> {
  const everybodySleeping$ = sleepingCount$.pipe(map(count => count === 2));
  return everybodySleeping$.pipe(
    map(sleeping => (sleeping ? 10 : 255)),
    map(brightness => ({ brightness })),
  );
}

function partyColor(): [number, number, number] {
  const colors: [number, number, number][] = [
    [31, 29, 109],
    [226, 122, 29],
    [70, 144, 170],
  ];

  const rnd = Math.floor(Math.random() * 3);

  return colors[rnd];
}
