import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Event } from './event.model';

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private _events = new BehaviorSubject<Event[]>([]);

    get events() {
        return this._events.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Event }>(
                'http://api.test/api/events?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw'
            )
            .pipe(
                map(events => {
                    const ms = [];
                    for (const key in events) {
                        if (events.hasOwnProperty(key)) {
                            ms.push(new Event(
                                +events[key].id,
                                events[key].name,
                                events[key].createdAt,
                                events[key].updatedAt,
                                events[key].deletedAt
                            ));
                        }
                    }

                    return ms;
                }),
                tap(events => {
                    this._events.next(events);
                })
            );
    }

    getEvent(id: number) {
        return this.http
            .get<Event>(`http://api.test/api/events/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`)
            .pipe(map(event => {
                return new Event(
                    id,
                    event.name,
                    event.createdAt,
                    event.updatedAt,
                    event.deletedAt
                );
            }));
    }

    add(name: string) {
        let generatedId: number;
        let newEvent: Event;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newEvent = new Event(
                        Math.random(),
                        name,
                        new Date(),
                        null,
                        null
                    );
                    return this.http.post<{ id: number }>(
                        'http://api.test/api/events?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw',
                        {...newEvent, id: null}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.events;
                }),
                take(1),
                tap(events => {
                    newEvent.id = generatedId;
                    this._events.next(events.concat(newEvent));
                })
            );
    }

    edit(id: number, name: string) {
        let updatedEvents: Event[];
        return this.events.pipe(
            take(1),
            switchMap(events => {
                if (!events || events.length <= 0) {
                    return this.fetch();
                } else {
                    return of(events);
                }
            }),
            switchMap(events => {
                const updatedEventIndex = events.findIndex(ds => ds.id === id);
                updatedEvents = [...events];
                const oldEvent = updatedEvents[updatedEventIndex];

                updatedEvents[updatedEventIndex] = new Event(
                    oldEvent.id,
                    name,
                    oldEvent.createdAt,
                    new Date(),
                    oldEvent.deletedAt
                );
                return this.http.put(
                    `http://api.test/api/events/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`,
                    {...updatedEvents[updatedEventIndex], id: null}
                );
            }),
            tap(resData => {
                this._events.next(updatedEvents);
            })
        );
    }

    delete(id: number) {
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    return this.http.delete(
                        `http://api.test/api/events/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`
                    );
                }),
                switchMap(() => {
                    return this.events;
                }),
                take(1),
                tap(events => {
                    this._events.next(events.filter(event => event.id !== id));
                })
            );
    }
}
