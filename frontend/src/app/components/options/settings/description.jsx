export default function Description({newDescription,handleDescriptionChange}){
     return(
          <section className="description-setting setting-container flex justify-center items-start w-full h-full bg-[rgb(33,27,37)] p-[1.3rem] [padding-left:5.9rem] [padding-right:5.9rem] flex-col gap-4 h-auto max-[32rem]:p-[0.8rem] max-[32rem]:px-[0.9rem]">
               <div className="description-title text-[#ffffff80] text-[1.1rem]">Description</div>
               <div className="description-user-div p-[1.5rem] [padding-left:2rem] [padding-right:2rem] w-full h-[8rem] bg-[#00000062] max-[32rem]:p-[0.5rem] max-[32rem]:px-[1rem]">
                    <textarea
                         name="input-description"
                         id="input-description"
                         value={newDescription}
                         maxLength={130}
                         onChange={handleDescriptionChange}
                         className="text-suboption text-[1rem] font-['Franklin_Gothic_Medium','Arial_Narrow',Arial,sans-serif] tracking-[0.04rem] w-full h-full text-start bg-transparent no-underline focus:outline-none focus:shadow-none max-[32rem]:text-[0.7rem]"
                    >
                    </textarea>
               </div>
          </section>
     )

}