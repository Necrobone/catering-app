export class Dish {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public image: string,
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}
}
