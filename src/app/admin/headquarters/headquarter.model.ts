import { Province } from '../../province.model';

export class Headquarter {
    constructor(
        public id: number,
        public name: string,
        public address: string,
        public zip: string,
        public city: string,
        public province: Province|number
    ) {}

    get provinceId() {
        return typeof this.province === 'number' ? this.province : this.province.id;
    }
}
