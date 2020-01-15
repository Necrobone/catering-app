import { Role } from '../../auth/role.model';

export class Employee {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public email: string,
        public password: string|null,
        private _apiToken: string|null,
        public role: Role|number,
        public createdAt: Date,
        public updatedAt: Date|null,
        public deletedAt: Date|null
    ) {}

    get apiToken() {
        return this._apiToken;
    }
}
