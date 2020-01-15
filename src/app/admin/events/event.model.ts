export class Event {
    constructor(
        public id: number,
        public name: string,
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}
}
