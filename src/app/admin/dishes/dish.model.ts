import { Supplier } from '../suppliers/supplier.model';
import { Event } from '../events/event.model';

export class Dish {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public image: string,
        public suppliers: Supplier[],
        public events: Event[],
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}

    get suppliersIds() {
        const result = [];
        this.suppliers.forEach(function(supplier, key) {
            this.push(supplier.id);
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
