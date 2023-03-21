import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import SignIn_User from "./component/SignIn_User_UI";
import User_Profile_UI from "./component/user/User_Profile_UI";
import Order_Account_UI from "./component/order/orderAccount";
import My_Order_UI from "./component/order/myOrder";
import All_Admin_UI from "./component/admin/All_Admin_UI";
import Home_User_UI from "./component/Home_User_UI";
import Home_Admin_UI from "./component/Home_Admin_UI";
import All_My_Account_UI from "./component/account/All_My_Account_UI";
import All_Account_UI from "./component/account/All_Account_UI";
import All_User_UI from "./component/user/All_User_UI";
import All_Order_UI from "./component/order/All_Order_UI";

export default function App() {
  const [token, setToken] = React.useState<String>("");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  if (!token) {
    return <SignIn_User />;
  }

  function routeList() {
    if(localStorage.getItem("Position") == "Admin"){
      return( // Admin Routes
        <Routes>
          <Route path="/" element={<Home_Admin_UI/>} /> {/** home */}
          <Route path="/All-Admin" element={<All_Admin_UI/>} /> {/** All Admin Account */}
          <Route path="/All-User" element={<All_User_UI/>} /> {/** All User Account */}
          <Route path="/All-Account" element={<All_Account_UI/>} /> {/** All Account Account */}
          <Route path="/All-Order" element={<All_Order_UI/>} /> {/** All Order Account */}
        </Routes>
      );
    }else{ // User Routes
      return(
        <Routes>
          <Route path="/" element={<Home_User_UI/>} /> {/** home */}
          <Route path="/profile/:email" element={<User_Profile_UI/>} /> {/** user profile */}
          <Route path="/AllMyAccount" element={<All_My_Account_UI/>} /> {/** All Account */}
          <Route path="/UnsoldAccount" element={<Order_Account_UI/>} /> {/** Unsold Account */}
          <Route path="/MyOrder" element={<My_Order_UI/>} /> {/** My Order */}
        </Routes>
      );
    }
  }

  return (
  <Router>
    <div>
      {routeList()}
    </div>
  </Router>
  );
}
