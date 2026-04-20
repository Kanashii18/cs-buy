import Comment_Section from "./comment/comment-div";
import Description_product from './seller-info/details-product';

export default function Details_container({product,seller}){
     return(
          <>
               <div className="flex justify-between w-full h-[45rem] gap-10 max-[38rem]:grid max-[38rem]:grid-rows-1 max-[38rem]:grid-cols-1 max-[38rem]:justify-between max-[38rem]:gap-y-12 max-[38rem]:w-full max-[38rem]:h-auto">
                    <div className="flex flex-col m-4 mt-4 mr-4 ml-4 bg-[#0c0c0c] w-[60%] h-[70%] max-[38rem]:m-0 max-[38rem]:mt-4 max-[38rem]:justify-self-center max-[38rem]:justify-center max-[38rem]:items-center max-[38rem]:w-[94%] max-[38rem]:h-auto max-[38rem]:px-[0.2rem] max-[38rem]:py-2">
                         <Description_product product={product} />
                    </div>
                    <Comment_Section seller={seller}/>
               </div>
          </>
     )
}