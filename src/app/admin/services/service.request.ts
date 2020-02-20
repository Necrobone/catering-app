export interface ServiceRequest {
    id: number;
    address: string;
    zip: string;
    city: string;
    startDate: Date;
    approved: number|null;
    province: number;
    event: number;
    dishes: number[];
    users: number[];
}
