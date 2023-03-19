import { GendersInterface } from "./IGender"

export interface UsersInterface {
    ID: number,
    Email: string,
	FirstName: string,
	LastName: string,
	Password: string,
	Profile_Name: string,
	Profile_Picture: string,
	Birthday: Date,
	Phone_number: string,
	Gender_ID: number,
	Gender: GendersInterface,
}