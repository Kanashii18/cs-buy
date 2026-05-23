export default function Services_Value({ formData, setFormData }) {

     const handleContentChange = (e) => {
          setFormData((prev) => ({
               ...prev,
               service: e.target.value
          }));
     };

     return (
          <>  
               <div className="product-value__div">
                    <div className="product-value__layer">
                         <div className="product-value__">
                              <div className="product-value__options" style={{ padding: ".6rem 0 0 1rem", justifyContent: "flex-start" }}>
                                   <h4>Message</h4>
                              </div>
                              <div className="product-value__content">
                                   <div className="product-value__content-layer">
                                        <div className="product-value__text" style={{padding:"0.7rem"}}>
                                             <textarea
                                                  value={formData.service}z
                                                  onChange={(e) => handleContentChange(e)}
                                                  placeholder="Write an introductory message, eventually contact the buyer via chat."
                                                  className="product-value__textarea"
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