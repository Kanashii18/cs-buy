import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// import { Helmet } from "react-helmet-async";
import Focus_Container from "./focus-container/cover";
import Second_Container from './detail-container/detail-container';
import Purchase_Container from "./focus-container/info-seller-product";
import LoadingText from '../../scripts/loadingText.js';
import Loadingdiv from "../../scripts/loadingdiv.js";
/* <Helmet>
     <title>{product.title} | Cyber Shop Buy</title>
     <link rel="canonical" href={`https://cs-buy.com/product/${product.id}`} />
</Helmet> */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }, 
};

export default function Container({loading}) {
     const router = useRouter();

     const [product, setProduct] = useState({
          "product_id": null,
          "user_id": null,
          "title": <LoadingText text={""} size={"2rem"} />,
          "price": "0.99",
          "category": null,
          "deliveryUnit": null,
          "delivery_value": "0",
          "quantity": 1,
          "image": null,
          "description": <LoadingText text={""} size={"2rem"} />,
          "seller_name": <LoadingText text={""} size={"2rem"} />,
          "seller_rate": "100.00"
     });

     const [seller, setSeller] = useState({
          "rate": "100.00",
          "user_id": false,
          "username": <LoadingText text={""} size={"2rem"} />,
          "img": null
     });

     useEffect(() => {
          (async()=>{
               const productId = new URLSearchParams(window.location.search).get('id');

               let res = await fetch(`/api/seller/product__page?product_id=${productId}`, {
                    credentials: "include",
                    method: "GET",
                    headers: {
                         "Cache-Control": "no-cache"
                    }
               })
               if(!res.ok) return console.err("Error getting product by id");
               let data = await res.json();
               setProduct(data);

               res = await fetch("/api/auth/seller-check", {
                    credentials: "include",
                    method: "POST",
                    headers: {
                         "Cache-Control": "no-cache",
                         "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user_id: data.user_id })
               })
               data = await res.json();
               setSeller(data);
          })()
               .catch(()=>router.push("/"));
     }, []);
     return (
          <motion.div
               className="flex flex-col gap-16 w-min h-full"
               variants={containerVariants}
               initial="hidden"
               animate="visible"
          >
               <motion.div
                    className="mt-28 h-full w-min flex justify-center gap-[5.6rem] bg-[#050505] p-4"
                    variants={itemVariants}
               >
                    <div className="w-min p-4 bg-[#0c0c0c] h-auto flex flex-col gap-[1.1rem] justify-self-center self-center">
                         <Focus_Container product={product} Loadingdiv={Loadingdiv} />
                    </div>
                    <section className="w-full bg-[#0c0c0c]">
                         <Purchase_Container product={product} seller={seller} Loadingdiv={Loadingdiv} />
                    </section>
               </motion.div>
               <motion.div className="bg-[#080808] w-full h-auto" variants={itemVariants}>
                    <Second_Container product={product} seller={seller} />
               </motion.div>
          </motion.div>
     );
}
