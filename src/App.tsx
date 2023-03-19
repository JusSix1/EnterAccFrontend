import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import UserFullAppBar from "./component/UserFullAppBar";
import Home_User from "./component/Home_User";
import SignIn_User from "./component/SignIn_User_UI";
import User_Profile_UI from "./component/user/User_Profile_UI";
import All_Account_UI from "./component/account/All_Account_UI";
import Order_Account_UI from "./component/order/orderAccount";
import My_Order_UI from "./component/order/myOrder";

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
    if(localStorage.getItem("position") == "Admin"){
      // return( // Admin Routes
      // );
    }else{ // User Routes
      return(
        <Routes>
          <Route path="/" element={<Home_User/>} /> {/** home */}
          <Route path="/profile/:email" element={<User_Profile_UI/>} /> {/** user profile */}
          <Route path="/AllMyAccount" element={<All_Account_UI/>} /> {/** All Account */}
          <Route path="/UnsoldAccount" element={<Order_Account_UI/>} /> {/** All Account */}
          <Route path="/MyOrder" element={<My_Order_UI/>} /> {/** All Account */}
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
