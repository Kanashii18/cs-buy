import LoadingText from "../../../scripts/loadingText";

export default function Feedback_card({feedbacks, loading}){

     return (
          <>   
               {
                    loading ?
                    <div className="flex justify-center items-center w-full h-full">
                         <LoadingText/>
                    </div>
                    :
                    <>
                         {feedbacks.length <= 0 ? (
                              <div className="py-3 px-24 w-full flex whitespace-nowrap justify-center items-center bg-[#17121f]">
                                   Without Comments Yet!
                              </div>
                         ) : (
                              <>
                                   {feedbacks.map((feedback, index) => {
                                        return (
                                             <div key={index}>
                                                  <h4 className="text-white/50 px-3 py-1.5">{feedback.created_at}</h4>
                                                  <div className="flex gap-4 px-1 items-center justify-between bg-[#1c1525]">
                                                       <h4 className="px-3 py-1.5 whitespace-normal max-w-[24rem] max-[1040px]:max-w-[31.802rem] overflow-hidden text-ellipsis">
                                                            {feedback.comment}
                                                       </h4>
                                                       <div className="whitespace-nowrap">
                                                            {[...Array(feedback.stars)].map((_, i) => (
                                                                 <img
                                                                      key={i}
                                                                      className="w-6 aspect-square inline-block"
                                                                      src="../assets/icons/star.svg"
                                                                      alt="star"
                                                                 />
                                                            ))}
                                                       </div>
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </>
                         )}
                    </>
               }
          </>
     );
}