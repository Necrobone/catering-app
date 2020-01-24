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
        public dishes: Dish[],
        public users: User[]
    ) {}

    get provinceId() {
        return typeof this.province === 'number' ? this.province : this.province.id;
    }

    get eventId() {
        return typeof this.event === 'number' ? this.event : this.event.id;
    }
}
