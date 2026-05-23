
export default function Assets_Value({ formData, setFormData }) {

     const handleFileSelect = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          setFormData(prev => ({
               ...prev,
               asset: file,                 // File real
               asset_name: file.name        // Nombre visible
          }));
     };

     return (
          <>
               <div className="product-value__div flex bg-[#131016] p-2 text-suboption">
                    <div className="product-value__layer bg-[#17121f] w-full h-full">
                         <div className="product-value__ flex flex-col justify-center items-center gap-4">
                              <div className="product-value__options flex items-center w-full justify-start pt-[.6rem] pl-[1rem]">
                                   <h4>File</h4>
                              </div>

                              <div className="product-value__content w-full px-2 pb-2 max-h-[34rem] flex flex-col gap-4">
                                   <div className="product-value__content-layer bg-[#1f1929] p-4 flex flex-col gap-2">
                                        <div className="product-value__text bg-[#292138] max-h-[6rem] overflow-scroll no-scrollbar flex gap-6 p-[0.7rem]">

                                             <input
                                                  id="product-file-input"
                                                  type="file"
                                                  name="asset"
                                                  accept=".py,.js,.ts,.json,.txt,.md,.png,.jpg,.jpeg,.webp,.pdf,image/*,application/pdf"
                                                  onChange={handleFileSelect}
                                                  className="hidden"
                                             />

                                             <label
                                                  htmlFor="product-file-input"
                                                  className="inline-flex items-center gap-3 cursor-pointer"
                                             >
                                                  <span className="file_label">Chose File</span>

                                                  <span
                                                       className="product-value__selected-name text-[0.95rem] text-[#d4ced9] font-sans max-w-[260px] truncate"
                                                       aria-live="polite"
                                                  >
                                                       {formData.asset_name ? formData.asset_name : ""}
                                                  </span>
                                             </label>

                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );
}
