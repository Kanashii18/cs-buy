import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import Product_Value from "./product_value";
import DeliveryForm from "./delivery";
import ErrorAlert from "../../error";
import Services_Value from "./service_value";
import Assets_Value from "./assets_value";

export default function Setproduct({LoadingScene}) {
     const router = useRouter();

     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const [previewUrl, setPreviewUrl] = useState(null);
     const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
     const [selectedCategory, setSelectedCategory] = useState("");
     const [formData, setFormData] = useState({
          title: "",
          category: "",
          description: "",
          price: "",
          deliveryUnit: {type:"",value:0},
          image: null,
          accounts: [],
          service:null,
          asset:null,
          asset_name:""
     });
     const validateForm = () => {
          if (!formData.title || !formData.category || !formData.description || !formData.price) {
               setError("Por favor complete todos los campos obligatorios.");
               return false;
          }
          if (!formData.deliveryUnit.type || !formData.deliveryUnit.type == "instant" && formData.deliveryUnit.value <= 0) {
               setError("Por favor ingrese una unidad de entrega válida.");
               return false;
          }
          if (!formData.image) {
               setError("Por favor cargue una imagen.");
               return false;
          }
          setError("");
          return true;
     };

     const categories = ["Account", "Service", "Others"];

     const handleCategorySelect = (category) => {
          setSelectedCategory(category);
          setFormData(prev => ({ ...prev, category }));
          setShowCategoryDropdown(false);
     };

          const handleInputChange = (field, value) => { 
               setFormData(prev => ({ ...prev, [field]: value }));
          };

     const handleImageUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          setFormData(prev => ({ ...prev, image: file }));
     };

     const handle_content_product = () => {
          if(formData.category === "Account") return (
               <Product_Value formData={formData} setFormData={setFormData} />
               )
          if(formData.category === "Service") return (
               <Services_Value formData={formData} setFormData={setFormData} />
               )
          if(formData.category === "Others") return (
               <Assets_Value formData={formData} setFormData={setFormData} />
               )
          return null
     }

     const handlesetProduct = async (e) => {
          e.preventDefault();

          if (!validateForm()) {
               return;
          }

          const formDataToSend = new FormData();
          formDataToSend.append("title", formData.title);
          formDataToSend.append("category", formData.category);
          formDataToSend.append("description", formData.description);
          formDataToSend.append("price", formData.price);
          formDataToSend.append("accounts", JSON.stringify(formData.accounts));
          formDataToSend.append("service", formData.service);
          formDataToSend.append("deliveryUnit", JSON.stringify(formData.deliveryUnit));
          if (formData.image) {
               formDataToSend.append("image", formData.image);
          }
          if (formData.asset) {
               formDataToSend.append("asset", formData.asset);
               formDataToSend.append("asset_name", formData.asset_name);
          }

          try {
               setLoading(true);
               const response = await fetch('/api/seller/set-product', {
                    method: 'POST',
                    credentials: 'include',
                    body: formDataToSend
               });

               const data = await response.json();
               if (!response.ok) {
                    setError(data.message);
               } else {
                    router.push('/dashboard/products');
                    router.refresh();
               }
          } catch (error) {
               setError(!error.message ? error.message : "Error al publicar");
          }
          finally{
                    setLoading(false);
               }
     };

     useEffect(() => {
          if (formData.image) {
               const url = URL.createObjectURL(formData.image);
               setPreviewUrl(url);

               return () => URL.revokeObjectURL(url);
          }
     }, [formData.image]);
     
     if(loading) return <LoadingScene/>;
     return (
          <div className="creating-content-layer w-full h-full bg-[#050505] p-4 flex justify-center items-center max-[480px]:p-2">
               {error ? <ErrorAlert error={error} errorState={setError} /> : <></>}

               <form
                    onSubmit={handlesetProduct}
                    className="product-form grid grid-cols-[1.2fr_1fr] gap-6 w-full max-w-[1200px] h-full max-[768px]:grid-cols-1 max-[768px]:grid-rows-[auto_auto] max-[480px]:gap-12 max-[480px]:grid-rows-auto"
               >
                    <div className="left-column grid grid-rows-1 gap-4 h-full max-[768px]:grid-rows-[auto_auto_auto] max-[480px]:justify-center max-[480px]:gap-2">
                         <div className="image-upload-section bg-[#131016] p-2 w-min flex justify-center items-center">
                              <div className="image-upload-container w-[352px] h-[352px] relative">
                                   <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        name="image"
                                        onChange={handleImageUpload}
                                        className="image-input hidden"
                                   />
                                   <label
                                        htmlFor="image-upload"
                                        className="image-upload-label flex justify-center items-center w-full h-full rounded cursor-pointer bg-[#17121f] transition-[border-color] duration-300 ease-in-out"
                                        >
                                        {formData.image ? (
                                             <img
                                             src={previewUrl}
                                             alt="Preview"
                                             className="image-preview bg-[#202020] w-full h-full min-w-[352px] min-h-[352px] object-cover"
                                             />
                                        ) : (
                                             <span className="image-placeholder text-suboption text-[1.2rem] font-medium">
                                             Set Image
                                             </span>
                                        )}
                                   </label>
                              </div>
                         </div>
                    </div>

                    <div className="right-column grid grid-rows-2 gap-4 row-span-2 h-min max-[480px]:justify-center max-[480px]:gap-2 text-suboption">
                         <div className="title-section bg-[#131016] rounded p-2 flex h-min justify-center items-center relative">
                              <div className="title-container w-full h-full">
                              <input
                              type="text"
                              placeholder="Title Product"
                              value={formData.title}
                              onChange={(e) => handleInputChange("title", e.target.value)}
                              className="title-input w-full h-full bg-[#17121f] rounded p-[.65rem] text-white text-base text-center outline-none placeholder:text-suboption"
                              maxLength={41}
                              />
                              </div>
                         </div>

                         <div className="category-section bg-[#131016] rounded p-2 flex h-min justify-center items-center relative">
                              <div className="category-container w-full h-full relative">
                                   <div
                                   className="category-dropdown w-full h-full bg-[#17121f] p-[.7rem] text-white text-base cursor-pointer flex justify-between items-center transition-[border-color] duration-300 ease-in-out hover:border-[#892be2]"
                                   onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                   >
                                        <span className="category-text">
                                             {selectedCategory || "Category"}
                                        </span>
                                        <span className="dropdown-arrow text-[0.8rem] transition-transform duration-300 ease-in-out">
                                             ▼
                                        </span>
                                   </div>

                                   {showCategoryDropdown && (
                                   <div className="category-options absolute left-0 right-0 bg-[#17121f] border border-[#281e35] rounded top-[calc(100%+0.5rem)] z-[1000] overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
                                        {categories.map((category) => (
                                        <div
                                             key={category}
                                             className="category-option p-4 text-white cursor-pointer transition-[background-color] duration-300 ease-in-out border-b border-[#281e35] last:border-b-0 hover:bg-[#281e35]"
                                             onClick={() => handleCategorySelect(category)}
                                        >
                                             {category}
                                        </div>
                                        ))}
                                   </div>
                                   )}
                              </div>
                         </div>

                         <DeliveryForm formData={formData} handleInputChange={handleInputChange} />

                         {handle_content_product()}
                    </div>

                    <div className="description-section bg-[#131016] p-4">
                         <div className="description-container w-full h-full min-h-[25rem]">
                              <textarea
                                   placeholder="Description"
                                   value={formData.description}
                                   onChange={(e) => handleInputChange("description", e.target.value)}
                                   className="description-textarea w-full h-full min-h-[150px] bg-[#17121f] p-4 text-white text-base resize-none outline-none"
                              />
                         </div>
                    </div>

                    <div className="bottom-row grid grid-cols-[2fr_1fr] gap-32 col-span-2 max-[768px]:grid-cols-1 max-[34rem]:col-span-auto">
                         <div className="price-discount-section grid grid-cols-2 gap-2 h-min max-[768px]:grid-cols-1">
                              <div className="input-group relative w-full max-w-[300px]">
                                   <input
                                   type="number"
                                   placeholder="Price"
                                   value={formData.price}
                                   onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
                                        if (Number(value) > 1000) return;
                                        handleInputChange("price", value);
                                   }}
                                   className="price-input w-full h-full min-h-[50px] bg-[#17121f] rounded p-4 text-white text-center outline-none text-[1.22rem] pr-[25px] box-border placeholder:text-suboption"
                                   />
                                   {formData.price && (
                                   <span className="input-symbol absolute right-[6.8rem] top-1/2 -translate-y-1/2 pointer-events-none select-none text-[#ebebeb] text-[1.23rem]">
                                        $
                                   </span>
                                   )}
                              </div>
                              <h5 className="text-base font-light text-[rgba(255,255,255,0.219)] col-span-2">
                              price
                              </h5>
                         </div>

                         <div className="submit-section bg-[#131016] rounded p-2 flex justify-center items-center h-min">
                              <button
                                   type="submit"
                                   className="submit-button w-full h-full min-h-[50px] bg-[#1a1024] text-[rgba(255,255,255,0.527)] text-[1.1rem] font-semibold cursor-pointer transition-[background-color] duration-300 ease-in-out hover:bg-[#2f1d49]"
                              >
                                   Submit
                              </button>
                         </div>
                    </div>
               </form>
          </div>
     );

}