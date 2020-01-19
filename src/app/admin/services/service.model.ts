import { Province } from '../../province.model';
import { Event } from '../events/event.model';

export class Service {
    constructor(
        public id: number,
        public address: string,
        public zip: string,
        public city: string,
        public startDate: Date,
        public approved: boolean|null,
        public _province: Province|number,
        public event: Event|number,
        public createdAt: Date,
        public updatedAt: Date|null
    ) {}

    get province() {
        return this._province instanceof Province ? this._province.id : this._province;
    }
}
