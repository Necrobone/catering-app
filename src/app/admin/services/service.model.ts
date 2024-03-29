import { Province } from '../../province.model';
import { Event } from '../events/event.model';
import { Dish } from '../dishes/dish.model';
import { User } from '../../auth/user.model';

export class Service {
    constructor(
        public id: number,
        public address: string,
        public zip: string,
        public city: string,
        public startDate: Date,
        public approved: number|null,
        public province: Province|number,
        public event: Event|number,
        public dishes: Dish[]|number[],
        public users: User[]
    ) {}

    get provinceId() {
        return typeof this.province === 'number' ? this.province : this.province.id;
    }

    get provinceName() {
        return typeof this.province === 'number' ? this.province : this.province.name;
    }

    get eventId() {
        return typeof this.event === 'number' ? this.event : this.event.id;
    }

    get eventName() {
        return typeof this.event === 'number' ? this.event : this.event.name;
    }

    get dishesIds() {
        const result = [];
        this.dishes.forEach(function(dish, key) {
            this.push(typeof dish === 'number' ? dish : dish.id);
        }, result);

        return result;
    }

    get usersIds() {
        const result = [];
        this.users.forEach(function(user, key) {
            this.push(typeof user === 'number' ? user : user.id);
        }, result);

        return result;
    }
}
