import { AccountStatusesInterface } from "./IAccount_Status";
import { UsersInterface } from "../user/IUser";
import { OrdersInterface } from "../order/IOrder";

export interface AccountsInterface {
    ID:		number,
    ID_Account:        number,
	User_ID:           number,         
	User:              UsersInterface,        
	Twitter_Account:   string,        
	Twitter_Password:  string,        
	Email:             string,         
	Email_Password:    string,        
	Phone_Number:      string,         
	Years:             number,           
	Account_Status_ID: number,         
	Account_Status:    AccountStatusesInterface,
	Order_ID: 		   number,
	Order: 			   OrdersInterface,
}