"use client";
import { useCallback } from "react";
import Create_Product from "../../components/options/products/create_Product/setProduct";
import UseMain from "../../components/main_options";

export default function Create_product() {
     // ===============|| send the component of the rute to the main content ||================ //  

     const Main = useCallback((props) => <Create_Product {...props} />, []);
     return <UseMain Main_content={Main} />;
}
