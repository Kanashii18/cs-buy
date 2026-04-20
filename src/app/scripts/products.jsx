import React,{useState,useEffect} from "react";

export default function Products(){

     const [products,setproducts] = useState([]);
     
     useEffect(()=>{
          fetch("./products/products.json")
               .then(res => res.json())
               .then(data => {
                    console.log(data);
               })
     },[]);
}