import {
  filterNullOrUndefined,
  HomeAssistantEntities,
  select,
  selectState,
} from '@ciesielskico/home-assistant-rxjs';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { filter, switchMapTo, take } from 'rxjs/operators';

export function getEntities<T extends string>(
  hassEntities: HomeAssistantEntities,
  entityKeys: string[],
): Record<T, Observable<string>> {
  return entityKeys.reduce(
    (entities, id) => ({
      ...entities,
      [id]: hassEntities.pipe(select(id)),
    }),
    {} as any,
  );
}

export function getEntityStates<T extends string>(
  hassEntities: HomeAssistantEntities,
  entityKeys: string[],
): Record<T, Observable<string>> {
  return entityKeys.reduce(
    (entities, id) => ({
      ...entities,
      [id]: hassEntities
        ? hassEntities.pipe(selectState(id), filterNullOrUndefined())
        : throwError(`Entity ${id} not found`),
    }),
    {} as any,
  );
}

export function checkState<R, T = string>(
  entity: Observable<T>,
  stateOrMapFn: ((state: T) => boolean) | T,
): (source$: Observable<R>) => Observable<T> {
  return function<T>(source$: Observable<T>) {
    return source$.pipe(
      switchMapTo(entity.pipe(take(1))),
      filter(state => {
        if (typeof stateOrMapFn === 'string') {
          return stateOrMapFn === state;
        }
        return (stateOrMapFn as any)(state);
      }),
    );
  };
}
