import 'mocha';

// ' ' whitespace: horizontal whitespace is ignored, and can be used to help vertically align multiple marble diagrams.
// '-' frame: 1 "frame" of virtual time passing (see above description of frames).
// [0-9]+[ms|s|m] time progression: the time progression syntax lets you progress virtual time by a specific amount. It's a number, followed by a time unit of ms (milliseconds), s (seconds), or m (minutes) without any space between them, e.g. a 10ms b. See Time progression syntax for more details.
// '|' complete: The successful completion of an observable. This is the observable producer signaling complete().
// '#' error: An error terminating the observable. This is the observable producer signaling error().
// [a-z0-9] e.g. 'a' any alphanumeric character: Represents a value being emitted by the producer signaling next(). Also consider that you could map this into an object or an array like this:

describe('Bedroom', () => {
  // let home: Home = {
  //   lights: {
  //     turnOn: () => of('turn_on'),
  //     turnOff: () => of('turn_off'),
  //   },
  //   getLightOptions: () => of({}),
  // } as any;
  // let scheduler: TestScheduler;

  beforeEach(() => {
    // scheduler = new TestScheduler((actual, expected) => {
    //   expect(actual).to.deep.equal(expected);
    // });
  });

  describe('Turn Lights On', () => {
    /* it('should turn light on when motion detected', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const source$ = cold('      -n--y--', { n: false, y: true });
        const expectedMarble = '    ----x';
        const result$ = colorModeAutomation$(home, {
          motion$: source$,
          automaticLights$: of('on'),
          led$: of('off'),
          lux$: of(1),
          colorMode$: of('Focus'),
        });
        expectObservable(result$).toBe(expectedMarble, { x: 'turn_on' });
      });
    }); */
  });
});
