export default function Services_Value({ formData, setFormData }) {

     const handleContentChange = (e) => {
          setFormData((prev) => ({
               ...prev,
               service: e.target.value
          }));
     };

     return (
          <>
               <div className="no-scrollbar no-scrollbar flex bg-[#131016] p-2">
                    <div className="bg-[#17121f] w-full h-full">
                         <div className="flex flex-col justify-center items-center gap-4">
                              <div className="flex items-center w-full justify-start pt-[.6rem] pl-[1rem]">
                                   <h4>Message</h4>
                              </div>

                              <div className="w-full px-2 pb-2 overflow-scroll max-h-[34rem] flex flex-col gap-4">
                                   <div className="bg-[#1f1929] p-4 flex flex-col gap-2">
                                        <div className="bg-[#292138] h-auto max-h-[6rem] overflow-scroll p-[0.7rem]">
                                             <textarea
                                                  value={formData.service || ""}
                                                  onChange={(e) => handleContentChange(e)}
                                                  placeholder="Write an introductory message, eventually contact the buyer via chat."
                                                  className="bg-[#321c55] [all:unset] whitespace-pre-wrap break-words w-full h-[6rem]"
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );
}