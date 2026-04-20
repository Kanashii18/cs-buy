"use client";

import Orders from "../../components/order/list";
import UseMain from "../../components/main_options";

export default function Orders_content(){

     // ===============|| send the component of the rute to the main content ||================ //

     return <UseMain Main_content={Orders}/>;
}