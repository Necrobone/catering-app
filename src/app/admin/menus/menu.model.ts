import { Event } from '../events/event.model';
import { Dish } from '../dishes/dish.model';

export class Menu {
    constructor(
        public id: number,
        public name: string,
        public dishes: Dish[],
        public events: Event[],
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}

    get dishesIds() {
        const result = [];
        this.dishes.forEach(function(dish, key) {
            this.push(dish.id);
        }, result);

        return result;
    }

    get eventsIds() {
        const result = [];
        this.events.forEach(function(event, key) {
            this.push(event.id);
        }, result);

        return result;
    }
}
