import { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import { BehaviorSubject, of } from 'rxjs';
import { HomeEntity } from '../home/entitites';
import { Home } from '../home/home';
import { ColorMode } from './lights';

export function getMockedHome(entities: HassEntities) {
  const homeEntities = {
    [HomeEntity.CircadianSensor]: {
      state: 'on',
      attributes: { rgb_color: [200, 200, 200] } as any,
    } as HassEntity,
    [HomeEntity.ColorMode]: { state: ColorMode.Circadian } as HassEntity,
    [HomeEntity.AutomaticLights]: { state: 'on' } as HassEntity,
    [HomeEntity.PeopleSleepingCount]: { state: '0' } as HassEntity,
  };

  const entities$ = new BehaviorSubject<HassEntities>({
    ...homeEntities,
    ...entities,
  });

  return {
    ...new Home({
      entities: entities$,
      services: {
        call: () => of(),
      },
    } as any),
    lights: {
      turnOn: () => of('turn_on'),
      turnOff: () => of('turn_off'),
    },
    setEntity: (entity_id: string, state: string) =>
      entities$.next({
        ...entities$.value,
        [entity_id]: { state } as HassEntity,
      }),
  };
}
