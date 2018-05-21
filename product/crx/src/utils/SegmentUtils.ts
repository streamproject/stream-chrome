import { EventTypes, IAliasEventPayload, IEventTypes, IGroupEventPayload,
  IIdentifyEventPayload, IPageEventPayload, ITrackEventPayload } from 'redux-segment'

export type Analytics = {
  eventType: IEventTypes[keyof IEventTypes],
  eventPayload?: IEventTypes
    | IPageEventPayload
    | IAliasEventPayload
    | IGroupEventPayload
    | IIdentifyEventPayload
    | ITrackEventPayload,
}

export type Meta = {
  analytics: Analytics | Analytics[],
}

export const segmentOptions = {
  mapper: {
    '@@router/LOCATION_CHANGE': (getState, action) => ({
      eventType: EventTypes.track,
      eventPayload: {
        event: action.type,
        properties: action.payload,
      },
    }),
  },
}
