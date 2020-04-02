import { LightTurnOnAttributes } from 'home-assistant-rxjs/dist/types/lights';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Home } from '../home/home';

export enum ColorMode {
  White = 'White',
  Circadian = 'Circadian',
  Party = 'Party',
}

export type LightOptionsAttributes = Partial<{ colorMode: string }>;

export const lightOptions: (
  home: Home,
  attributes?: LightOptionsAttributes,
) => Observable<Partial<LightTurnOnAttributes>> = (home, attributes) =>
  combineLatest([
    lightColor(home, attributes),
    lightWhiteValue(home),
    lightBrightness(home),
  ]).pipe(
    tap(_ => console.log('lights', _)),
    map(values =>
      values.reduce((options, option) => ({ ...options, ...option })),
    ),
    take(1),
  );

export function lightColor(
  home: Home,
  attributes?: LightOptionsAttributes,
): Observable<Partial<LightTurnOnAttributes>> {
  const colorMode$ = attributes?.colorMode
    ? of(attributes.colorMode)
    : home.colorMode$;

  return colorMode$.pipe(
    switchMap(mode => {
      switch (mode) {
        case ColorMode.Circadian:
          return home.circadian$.pipe(take(1));

        case ColorMode.Party:
          return of(partyColor());

        default:
        case ColorMode.White:
          return of([255, 255, 255]);
      }
    }),
    map(rgb_color => ({ rgb_color })),
  );
}

export function lightWhiteValue(
  home: Home,
): Observable<Partial<LightTurnOnAttributes>> {
  const somebodySleeping$ = home.peopleSleepingCount$.pipe(
    map(count => count > 0),
  );
  const colorMode$ = home.colorMode$;

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
  home: Home,
): Observable<Partial<LightTurnOnAttributes>> {
  const everybodySleeping$ = home.peopleSleepingCount$.pipe(
    map(count => count === 2),
  );
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
