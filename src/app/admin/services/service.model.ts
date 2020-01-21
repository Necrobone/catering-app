import { Province } from '../../province.model';
import { Event } from '../events/event.model';

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
        public createdAt: Date,
        public updatedAt: Date|null
    ) {}

    get provinceId() {
        return typeof this.province === 'number' ? this.province : this.province.id;
    }

    get eventId() {
        return typeof this.event === 'number' ? this.event : this.event.id;
    }
}
