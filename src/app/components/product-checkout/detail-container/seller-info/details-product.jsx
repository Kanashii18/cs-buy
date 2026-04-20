export default function Description_product({product}){
     return(
          <div className="bg-[#121212] m-6 h-full flex justify-center items-center">
               <div className="text-[rgb(194,190,190)] text-left text-base font-normal whitespace-pre-line overflow-scroll mt-[5%] w-[90%] h-[90%]">
                    {product.description}
               </div>
          </div>
     )
}