import { UsersInterface } from "../user/IUser";

export interface OrdersInterface {
    ID:         number,
    CreatedAt:  Date,
    User_ID:    number,
    User:       UsersInterface,
    Slip:       string,
}