import Comment_card from "./comment-card"

export default function Comment_Section({seller}){
     return(
          <div className="mr-4 my-4 ml-0 bg-[rgb(12,12,12)] w-[37%] h-[60%] p-4 flex flex-col max-[38rem]:m-0 max-[38rem]:mb-6 max-[38rem]:justify-self-center max-[38rem]:justify-center max-[38rem]:w-[94%] max-[38rem]:h-auto max-[38rem]:px-4 max-[38rem]:py-4 max-[38rem]:gap-[1.9rem]">
               <div className="h-full overflow-scroll flex flex-col gap-[0.8rem]">
                    <Comment_card seller={seller}/>
               </div>
          </div>
     )
}