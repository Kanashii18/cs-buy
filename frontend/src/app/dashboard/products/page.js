"use client";

import Products from "../../components/options/products/content";
import UseMain from "../../components/main_options";

export default function Product_content(){

     // ===============|| send the component of the rute to the main content ||================ //
     
     return <UseMain Main_content={Products}/>;
}