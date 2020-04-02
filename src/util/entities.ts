import {
  HomeAssistantEntities,
  select,
  selectState,
} from 'home-assistant-rxjs';
import { Observable } from 'rxjs/internal/Observable';

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
      [id]: hassEntities.pipe(selectState(id)),
    }),
    {} as any,
  );
}
