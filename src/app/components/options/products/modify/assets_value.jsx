
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
               <div className="product-value__div">
                    <div className="product-value__layer">
                         <div className="product-value__">
                              <div className="product-value__options" style={{ padding: ".6rem 0 0 1rem", justifyContent: "flex-start" }}>
                                   <h4>File</h4>
                              </div>
                              <div className="product-value__content">
                                   <div className="product-value__content-layer">
                                        <div className="product-value__text" style={{padding:"0.7rem",display:"flex",gap:"1.5rem"}}>
                                             <input
                                                  id="product-file-input"
                                                  type="file"
                                                  name="asset"
                                                  accept=".py,.js,.ts,.json,.txt,.md,.png,.jpg,.jpeg,.webp,.pdf,image/*,application/pdf"
                                                  onChange={handleFileSelect}
                                                  style={{ display: "none" }}
                                             />

                                             <label
                                                  htmlFor="product-file-input"
                                                  style={{
                                                       cursor: "pointer",
                                                       display: "inline-flex",
                                                       alignItems: "center",
                                                       gap: "0.75rem"
                                                  }}
                                             >
                                                  <span className="file_label">Chose File</span>
                                                  {/* Nombre del archivo a la derecha */}
                                                  <span
                                                       className="product-value__selected-name"
                                                       aria-live="polite"
                                                       style={{
                                                            fontSize: "0.95rem",
                                                            color:"#d4ced9",
                                                            fontFamily:"sans-serif",
                                                            maxWidth: "260px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis"
                                                       }}
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
