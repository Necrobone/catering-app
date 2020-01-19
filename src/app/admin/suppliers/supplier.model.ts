import { Headquarter } from '../headquarters/headquarter.model';

export class Supplier {
    constructor(
        public id: number,
        public name: string,
        public headquarters: Headquarter[],
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}

    get headquartersIds() {
        const result = [];
        this.headquarters.forEach(function(headquarter, key) {
            this.push(headquarter.id);
        }, result);

        return result;
    }
}
