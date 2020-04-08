import { expect } from 'chai';
import 'mocha';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { OfficeRoom } from '.';
import { Home } from '../home/home';

// ' ' whitespace: horizontal whitespace is ignored, and can be used to help vertically align multiple marble diagrams.
// '-' frame: 1 "frame" of virtual time passing (see above description of frames).
// [0-9]+[ms|s|m] time progression: the time progression syntax lets you progress virtual time by a specific amount. It's a number, followed by a time unit of ms (milliseconds), s (seconds), or m (minutes) without any space between them, e.g. a 10ms b. See Time progression syntax for more details.
// '|' complete: The successful completion of an observable. This is the observable producer signaling complete().
// '#' error: An error terminating the observable. This is the observable producer signaling error().
// [a-z0-9] e.g. 'a' any alphanumeric character: Represents a value being emitted by the producer signaling next(). Also consider that you could map this into an object or an array like this:

describe.skip('OfficeRoom', () => {
  let home: Home = {
    lights: {
      turnOn: () => of('turn_on'),
      turnOff: () => of('turn_off'),
    },
    getLightOptions: () => of({}),
  } as any;
  let office: OfficeRoom;
  let scheduler: TestScheduler;

  beforeEach(() => {
    office = new OfficeRoom(home);
  });

  describe('Turn Lights On', () => {
    beforeEach(() => {
      scheduler = new TestScheduler((actual, expected) => {
        expect(actual).to.deep.equal(expected);
      });
    });

    it('should turn on light when motion detected', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const motion$ = cold('  -a--b|', { a: 'off', b: 'on' });
        const expectedMarble = '----b|';

        const result$ = office.lightTurnOn({
          motion$,
          automaticLights$: of('on'),
          led$: of('off'),
          lux$: of(1),
          colorMode$: of('Focus'),
        });

        expectObservable(result$).toBe(expectedMarble, { b: 'turn_on' });
      });
    });
  });
});
