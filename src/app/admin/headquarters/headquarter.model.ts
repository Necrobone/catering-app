export class Headquarter {
    constructor(
        public id: number,
        public name: string,
        public address: string,
        public zip: string,
        public city: string,
        public provinceId: number,
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}
}
