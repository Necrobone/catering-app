import { Role } from './role.model';
import { Service } from '../admin/services/service.model';

export class User {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public email: string,
        public apiToken: string,
        public role: Role,
        public services: Service[],
        private tokenExpirationDate: Date,
    ) {}

    get token() {
        if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
            return null;
        }

        return this.apiToken;
    }

    get tokenDuration() {
        if (!this.token) {
            return 0;
        }

        return this.tokenExpirationDate.getTime() - new Date().getTime();
    }
}
