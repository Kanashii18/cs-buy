import { useState,useEffect } from "react";
import Product_Value from "./product_value";
import DeliveryForm from "./delivery";
import ErrorAlert from "../../error";
import Services_Value from "./service_value";

export default function Setproduct({product_id,LoadingScene}) {

     const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
     const [selectedCategory, setSelectedCategory] = useState("");
     const [error, setError] = useState("");
     const categories = ["Account", "Service", "Others"];
     const [previewUrl, setPreviewUrl] = useState(null);
     const [formData, setFormData] = useState({
          title: "",
          category: "",
          description: "",
          price: "",
          deliveryUnit: "",
          image: null,
          accounts: [],
          service:"",
          asset:null,
          asset_name:""
     });

     /**
      * 
      * @returns {boolean} - Returns true if form is valid, false otherwise.
      */
     const validateForm = () => {
     // Check if required fields are not empty
     if (!formData.title || !formData.category || !formData.description || !formData.price) {
          setError("Please complete all required fields.");
          return false;
     }
     // Check if delivery unit is valid
          if (!formData.deliveryUnit.type || !formData.deliveryUnit.type == "instant" && formData.deliveryUnit.value <= 0) {
          setError("Please enter a valid delivery unit.");
          return false;
     }
     // Check if an image is provided
     if (!formData.image) {
          setError("Please upload an image.");
          return false;
     }

     setError("");
     return true;
     };
     const [loading,setLoading] = useState(true);
     const handleImageUpload = async (e) => {

          const file = e.target.files[0];
          setPreviewUrl(URL.createObjectURL(e.target.files[0]));
          if (!file) return;
          setFormData(prev => ({ ...prev, image: file }));
     };
     const handlesetProduct = async (e) => {
          e.preventDefault();

          if (!validateForm()) {
                    return; // Detener el envío si hay un error de validación
               }

          const formDataToSend = new FormData();
          formDataToSend.append("title", formData.title);
          formDataToSend.append("category", formData.category);
          formDataToSend.append("description", formData.description);
          formDataToSend.append("price", formData.price);
          formDataToSend.append("accounts", JSON.stringify(formData.accounts));
          formDataToSend.append("service", formData.service);
          formDataToSend.append("deliveryUnit", JSON.stringify(formData.deliveryUnit));
          formDataToSend.append("asset_name", formData.asset_name);
          
          if (formData.image) {
               if (formData.image instanceof File) {
                    formDataToSend.append("image", formData.image);
               } 
               // Si formData.image es una URL (string), la agregamos como texto
               else if (typeof formData.image === "string") {
                    formDataToSend.append("image", formData.image);
               }
          }
          if (formData.asset) {
               formDataToSend.append("asset", formData.asset);
          }

          try {
               const response = await fetch(`/api/seller/modify/product?e=${product_id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formDataToSend
               });

               const data = await response.json();

               if (response.ok) {
                    window.location.href = "/dashboard/products";
               } else {
                    alert('Error: ' + data.error);
               }

          } catch (error) {
               console.error('Error en fetch:', error);
               alert('Error al agregar producto');
          }
     };

     
     const handleCategorySelect = (category) => {
          setSelectedCategory(category);
          setFormData(prev => ({ ...prev, category }));
          setShowCategoryDropdown(false);
     };

     const handleInputChange = (field, value) => { 
          setFormData(prev => ({ ...prev, [field]: value }));
     };        
     
     useEffect(() => {
          fetch(`http://localhost:4038/api/seller/get-modify?e=${product_id}`,{
               credentials:"include"
          }).then(async(res)=>{
               if(!res.ok){
                    alert("Error");
               }
               return await res.json()
          }).then((data)=>{
               setSelectedCategory(`${data.category}`);
               setFormData({
                    title: data.title,
                    category: data.category,
                    description: data.description,
                    price: data.price,
                    deliveryUnit: { type:data.deliveryUnit, value:data.delivery_value},
                    image: data.image,
                    accounts: data.accounts,
                    service: data.service_msg,
                    asset: null,
                    asset_name: data.asset_name
               });
          }).finally(()=>{
               setLoading(false);
          })
     }, []); 

      const handle_content_product = () => {
          if(formData.category === "Account") return (
               <Product_Value formData={formData} setFormData={setFormData} />
               )
          if(formData.category === "Service") return (
               <Services_Value formData={formData} setFormData={setFormData} />
               )
          return null
     }

     if(loading){
          return <LoadingScene/>
     }
       
     return (
          <div className="w-full h-full bg-[#050505] p-4 flex justify-center items-center">
               {error ? <ErrorAlert error={error} errorState={setError} /> : <></>}
               <form
                    onSubmit={handlesetProduct}
                    className="grid grid-cols-[1.2fr_1fr] gap-6 w-full max-w-[1200px] h-full max-[768px]:grid-cols-1 max-[768px]:grid-rows-[auto_auto] max-[480px]:gap-12 max-[480px]:grid-rows-auto max-[480px]:grid-cols-1 max-[34rem]:grid-rows-auto"
               >
                    <div className="grid grid-rows-[1fr] gap-4 h-full max-[768px]:grid-rows-[auto_auto_auto] max-[480px]:justify-center max-[480px]:gap-2">
                         <div className="bg-[#131016] p-2 w-min flex justify-center items-center">
                              <div className="w-[352px] h-[352px] relative">
                                   <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        name="image"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                   />
                                   <label
                                        htmlFor="image-upload"
                                        className="flex justify-center items-center w-full h-full rounded cursor-pointer bg-[#17121f]"
                                   >
                                        {typeof formData.image === "string" ? (
                                             <img
                                                  src={formData.image}
                                                  alt="Preview"
                                                  className="bg-[#202020] w-full h-full min-w-[352px] min-h-[352px] object-cover"
                                             />
                                        ) : (
                                             <img
                                                  src={previewUrl}
                                                  alt="Preview"
                                                  className="bg-[#202020] w-full h-full min-w-[352px] min-h-[352px] object-cover"
                                             />
                                        )}
                                   </label>
                              </div>
                         </div>
                    </div>

                    <div className="grid grid-rows-[1fr_1fr] gap-4 row-span-2 h-min max-[480px]:justify-center max-[480px]:gap-2">
                         <div className="bg-[#131016] rounded p-2 flex h-min justify-center items-center relative">
                              <div className="w-full h-full">
                                   <input
                                        type="text"
                                        placeholder="Title Product"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        maxLength={41}
                                        className="w-full h-full bg-[#17121f] rounded px-[0.65rem] py-[0.65rem] text-white text-base text-center outline-none focus:border-[#892be2]"
                                   />
                              </div>
                         </div>

                         <div className="bg-[#131016] rounded p-2 flex h-min justify-center items-center relative">
                              <div className="w-full h-full relative">
                                   <div
                                        className="w-full h-full bg-[#17121f] p-[0.7rem] text-white text-base cursor-pointer flex justify-between items-center"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                   >
                                        <span className="text-[#ffffff85]">
                                             {selectedCategory || "Category"}
                                        </span>
                                        <span className="text-[#ffffff85] text-[0.8rem]">
                                             ▼
                                        </span>
                                   </div>

                                   {showCategoryDropdown && (
                                        <div className="absolute top-[calc(100%_+_0.5rem)] left-0 right-0 bg-[#17121f] border border-[#281e35] rounded z-[1000] overflow-hidden shadow-[0_4px_6px_#0000004d]">
                                             {categories.map((category) => (
                                                  <div
                                                       key={category}
                                                       onClick={() => handleCategorySelect(category)}
                                                       className="p-4 text-white cursor-pointer border-b border-[#281e35] last:border-b-0 hover:bg-[#281e35]"
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

                    <div className="bg-[#131016] p-4">
                         <div className="w-full h-full min-h-[25rem]">
                              <textarea
                                   placeholder="Description"
                                   value={formData.description}
                                   onChange={(e) => handleInputChange("description", e.target.value)}
                                   className="w-full h-full min-h-[150px] bg-[#17121f] p-4 text-white text-base font-inherit resize-none outline-none focus:border-[#892be2] placeholder:text-[#ffffff85] placeholder:text-center"
                              />
                         </div>
                    </div>

                    <div className="grid grid-cols-[2fr_1fr] gap-[8rem] col-span-2 max-[768px]:grid-cols-1 max-[34rem]:col-span-1">
                         <div className="grid grid-cols-[1fr_1fr] gap-2 h-min max-[768px]:grid-cols-1">
                              <div className="relative w-full max-w-[300px]">
                                   <input
                                        type="number"
                                        placeholder="Price"
                                        value={formData.price}
                                        onChange={(e) => {
                                             const raw = e.target.value
                                             const numericValue = raw.replace(/\D/g, "")

                                             const clamped = Math.min(Number(numericValue), 1000)

                                             handleInputChange("price", numericValue === "" ? "" : clamped)
                                        }}
                                        className="w-full h-full min-h-[50px] bg-[#17121f] rounded p-4 text-white text-base text-center outline-none pr-[25px] box-border focus:border-[#892be2] placeholder:text-[#ffffff85] text-[1.22rem]"
                                   />
                                   {formData.price && (
                                        <span className="absolute right-[6.8rem] top-[47.9%] -translate-y-1/2 pointer-events-none text-[#ebebeb] select-none text-[1.23rem]">
                                             $
                                        </span>
                                   )}
                              </div>
                              <h5 className="text-base font-light text-[#ffffff38] col-span-2">
                                   price
                              </h5>
                         </div>

                         <div className="bg-[#131016] rounded p-2 flex justify-center items-center h-min">
                              <button
                                   type="submit"
                                   className="w-full h-full min-h-[50px] bg-[#1a1024] text-[#ffffff86] text-[1.1rem] font-semibold cursor-pointer hover:bg-[#2f1d49]"
                              >
                                   Submit
                              </button>
                         </div>
                    </div>
               </form>
          </div>
     )
}