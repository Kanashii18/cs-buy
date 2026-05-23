export default function Next_options({ currentPage, totalPages, onPrev, onNext }) {
     return (
          <section className="w-full h-[3.3rem] flex justify-start">
               <div className="w-full h-[2.3rem] pl-7 pr-7 bg-[#0c0c0c] flex justify-center items-center pb-[.5rem] box-content max-sm:pl-2 max-sm:pr-2 max-sm:mt-3">
                    <div className="relative z-10 w-full h-[87%] flex justify-center items-center gap-[0.35%] bg-[#4d1d74] rounded">
                         <div
                         onClick={onPrev}
                         aria-disabled={currentPage === 1}
                         title={currentPage === 1 ? "No previous page" : "Previous page"}
                         className="w-[32.8%] h-[80%] flex justify-center items-center bg-[#0f0f0f] cursor-pointer hover:bg-[#181818] transition-colors duration-1000"
                         >
                              <img src="../assets/icons/options/back-arrow.svg" alt="back option" />
                         </div>

                         <div className="w-[32.8%] h-[80%] flex justify-center items-center bg-[#0f0f0f]">
                              <h4 className="text-white">
                              {currentPage} of {totalPages}
                              </h4>
                         </div>

                         <div
                         onClick={onNext}
                         aria-disabled={currentPage === totalPages}
                         title={currentPage === totalPages ? "No next page" : "Next page"}
                         className="w-[32.8%] h-[80%] flex justify-center items-center bg-[#0f0f0f] cursor-pointer hover:bg-[#181818] transition-colors duration-1000"
                         >
                              <img
                              src="../assets/icons/options/next-arrow.svg"
                              alt="forward option"
                              />
                         </div>
                    </div>
               </div>
          </section>
     );
}
