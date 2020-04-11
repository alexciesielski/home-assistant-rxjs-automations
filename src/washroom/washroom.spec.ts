import { expect } from 'chai';
import { HassEntity } from 'home-assistant-js-websocket';
import 'mocha';
import { BehaviorSubject, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { Home } from '../home/home';
import { WashroomEntity } from './entities';
import { washroomLightTurnOffAutomation$ } from './washroom';

describe('WashRoom', () => {
  const light$ = new BehaviorSubject<HassEntity>({ state: 'on' } as HassEntity);
  let home: Home = {
    getAutomaticLights: () => of('on'),
    lights: {
      turnOff: () => of('turn_off'),
    },
    entities: new BehaviorSubject({
      [WashroomEntity.Light]: light$,
    }),
  } as any;
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('Turn Lights On', () => {
    it('should turn off light after 10 minutes', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const source$ = cold('      -n--y--', { n: 'off', y: 'on' });
        const expectedMarble = '10m ----x';
        const result$ = washroomLightTurnOffAutomation$(home, {
          light$: source$,
        });
        expectObservable(result$).toBe(expectedMarble, { x: 'turn_off' });
      });
    });
  });
});
