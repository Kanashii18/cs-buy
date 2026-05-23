export default function Profile_init({
                              handleSubmit,
                              newUsername,
                              handleUsernameChange,
                              editName,
                              setname,
                              handleImageUpload,
                              viewImage,
                              newEmail,
                              handleEmailChange,
                              editEmail,
                              setmail,
                         }) {
     return(
          <section className="credentials-setting setting-container grid grid-cols-[1fr_0.7fr] justify-center max-[32rem]:grid-cols-1 max-[32rem]:pb-4 flex justify-center items-start w-full h-full bg-[rgb(33,27,37)]">
               {/* Cambiar Username */}
               <div className="username-change-setting setting-input-div input-field w-full h-full flex justify-end items-center justify-self-center self-center p-4 pl-24 box-border max-[32rem]:p-4">
                    <div className="credential-layer p-6 box-border bg-black/35 flex justify-center items-center flex-col gap-4 h-full w-full">
                         <div className="credential-space-between w-full flex justify-between">
                              <label htmlFor="username-setting-input" className="setting-label w-full text-[rgb(147,128,160)]">
                                   Change Username
                              </label>
                              <button onClick={setname} id="change_username-button" className="text-[0.97rem] bg-[rgb(19,16,22)] text-[#fddcefc5]">
                                   Edit
                              </button>
                         </div>
                         <form onSubmit={handleSubmit} className="w-full">
                              
                              {editName ? 
                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full bg-[#7a757b93] p-0 rounded-[0.1rem]">
                                        <input
                                             id="username-setting-input"
                                             type="text"
                                             value={newUsername}
                                             maxLength={16}
                                             onChange={handleUsernameChange}
                                             aria-label="modify username"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>

                                   :

                                   <div className="input-div flex justify-center items-center font-[math] w-full px-4 rounded-[0.1rem] bg-[#4c4a4d93] text-[#bdbdbd]">
                                        <input
                                             id="username-setting-input"
                                             type="text"
                                             value={newUsername}
                                             maxLength={16}
                                             onChange={handleUsernameChange}
                                             readOnly
                                             aria-label="modify username"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>
                              }                         
                         </form>
                    </div>
               </div>

               {/* Imagen */}
               <div className="bg-[#0000005d] flex justify-self-center justify-center self-center w-[16.5rem] h-[16.5rem] p-[1.3rem] rounded-[2%] row-span-2 overflow-hidden max-[32rem]:h-[10.5rem] max-[32rem]:row-start-1">
                    <input
                         type="file"
                         id="image-upload"
                         accept="image/*"
                         name="image"
                         onChange={handleImageUpload}
                         className="image-input hidden"
                    />
                    <label htmlFor="image-upload" className="image_upload-label flex justify-center items-center h-full aspect-square rounded-full cursor-pointer transition-colors duration-300 bg-[#17121f]">
                         <img
                              src={viewImage}
                              alt="Preview"
                              className="image-upload-value w-full h-full object-cover rounded-full max-[32rem]:h-auto max-[32rem]:w-[8rem] max-[32rem]:aspect-square"
                         />
                    </label>
               </div>


               {/* Cambiar Email */}
               <div className="email-change-setting setting-input-div input-field w-full h-full flex justify-end items-center justify-self-center self-center p-4 pl-24 box-border max-[32rem]:p-4 max-[32rem]:row-start-1">
                    <div className="credential-layer p-6 box-border bg-black/35 flex justify-center items-center flex-col gap-4 h-full w-full">
                         <div className="credential-space-between w-full flex justify-between">
                              <label htmlFor="email-setting-input" className="setting-label w-full text-[rgb(147,128,160)]">
                                   Change Email
                              </label>
                              <button onClick={setmail} id="change_email-button" className="text-[0.97rem] bg-[rgb(19,16,22)] text-[#fddcefc5]">
                                   Edit
                              </button>
                         </div>
                         <form onSubmit={handleSubmit} className="w-full">
                              {editEmail ? 
                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full bg-[#7a757b93] px-4 rounded-[0.1rem]">
                                        <input
                                             id="email-setting-input"
                                             type="email"
                                             maxLength={55}
                                             value={newEmail}
                                             onChange={handleEmailChange}
                                             aria-label="modify email"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>

                                   :

                                   <div className="input-div flex justify-center items-center font-[math] w-full px-4 rounded-[0.1rem] bg-[#4c4a4d93] text-[#bdbdbd]">
                                        <input
                                             id="email-setting-input"
                                             type="email"
                                             value={newEmail}
                                             maxLength={55}
                                             onChange={handleEmailChange}
                                             readOnly
                                             aria-label="modify email"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>
                              }
                         </form>
                    </div>
               </div>
          </section>
     )
    
}