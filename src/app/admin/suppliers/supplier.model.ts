import { Headquarter } from '../headquarters/headquarter.model';

export class Supplier {
    constructor(
        public id: number,
        public name: string,
        public headquarters: Headquarter[]
    ) {}

    get headquartersIds() {
        const result = [];
        this.headquarters.forEach(function(headquarter, key) {
            this.push(headquarter.id);
        }, result);

        return result;
    }
}
