import { useState } from "react"

export default function Password({handlePasswordChange,
                                   handleSubmit,
                                   setVerify,
                                   setpass,
                                   editPass,
                                   newPassword,
                                   confirmPassword,
                                   handle_confirmPassword,
                                   verifyPassword,
                                   confirmVerify,
                                   setConfirm}){

     const [change_Visible,setChangeVisible] = useState(false);
     const [verify_Visible,setVerifyVisible] = useState(false)

     const handle_visible_change = () => {
          if(change_Visible){
               setChangeVisible(false); 
          }
          else if(!change_Visible){
               setChangeVisible(true);
          }
     }
     const handle_visible_verify = () => {
          if(verify_Visible){
               setVerifyVisible(false); 
          }
          else if(!verify_Visible){
               setVerifyVisible(true);
          }
     }

     return(
          <section className="description-setting setting-container verify_setting-container flex justify-center items-start w-full h-full bg-[rgb(33,27,37)] grid grid-cols-2 p-[1.3rem_5.9rem] flex-col gap-4 h-auto max-[32rem]:p-4">
               <div className="change_password-container">
                    <div className="credential-layer credential-password p-6 box-border bg-black/35 flex justify-center items-center flex-col gap-4 h-full w-full">
                         <div className="credential-space-between w-full flex justify-between">
                              <label htmlFor="username-setting-input" className="setting-label w-full text-[rgb(147,128,160)]">
                                   Change Password
                              </label>
                              <button onClick={setpass} id="change_username-button" className="text-[0.97rem] bg-[rgb(19,16,22)] text-[#fddcefc5]">
                                   Edit
                              </button>
                         </div>
                         <form onSubmit={handleSubmit} className="w-full">
                              
                              {editPass ? 
                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full bg-[#7a757b93] px-4 rounded-[0.1rem]">
                                        <input
                                             id="password-input"
                                             type={change_Visible ? 'text' : 'password'}
                                             value={newPassword}
                                             maxLength={30}
                                             onChange={handlePasswordChange}
                                             aria-label="modify password"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                        <img
                                             src='../assets/icons/options/visible.svg'
                                             alt="Toggle password visibility"
                                             onClick={handle_visible_change}
                                             className="eye-icon"
                                        />
                                   </div>

                                   :

                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full px-4 rounded-[0.1rem] bg-[#413a4293]">
                                        <input
                                             id="password-input"
                                             type={change_Visible ? 'text' : 'password'}
                                             maxLength={30}
                                             value={newPassword}
                                             onChange={handlePasswordChange}
                                             readOnly
                                             aria-label="modify username"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>
                              }                         
                         </form>
                    </div>
                    <div className="credential-layer credential-password p-6 box-border bg-black/35 flex justify-center items-center flex-col gap-4 h-full w-full">
                         <div className="credential-space-between w-full flex justify-between">
                              <label htmlFor="username-setting-input" className="setting-label w-full text-[rgb(147,128,160)]">
                                   Confirm Password
                              </label>
                         </div>
                         <form onSubmit={handleSubmit} className="w-full">
                              
                              {editPass ? 
                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full bg-[#7a757b93] px-4 rounded-[0.1rem]">
                                        <input
                                             id="password-input"
                                             type={change_Visible ? 'text' : 'password'}
                                             maxLength={30}
                                             value={confirmPassword}
                                             onChange={handle_confirmPassword}
                                             aria-label="confirm password"
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>

                                   :

                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full px-4 rounded-[0.1rem] bg-[#413a4293]">
                                        <input
                                             id="password-input"
                                             type={change_Visible ? 'text' : 'password'}
                                             maxLength={30}
                                             value={confirmPassword}
                                             onChange={handle_confirmPassword}
                                             readOnly
                                             aria-label="confirm username"
                                             className="w-full p-[0.1rem]rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>
                              }                         
                         </form>
                    </div>
               </div>
               <div className="verify_password-container">
                    <div className="credential-layer credential-password p-6 box-border bg-black/35 flex justify-center items-center flex-col gap-4 h-full w-full">
                         <div className="credential-space-between w-full flex justify-between">
                              <div htmlFor="username-setting-input" className="setting-label w-full text-[#9380a0]">
                                   Verify Password
                              </div>
                         </div>
                         <form onSubmit={handleSubmit} className="w-full">
                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full bg-[#7a757b93] px-4 rounded-[0.1rem]">
                                        <input
                                             id="password-input"
                                             type={verify_Visible ? 'text' : 'password'}
                                             maxLength={30}
                                             value={verifyPassword}
                                             aria-label="modify password"
                                             onChange={(e) => setVerify(e.target.value)}
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                        <img
                                             src='../assets/icons/options/visible.svg'
                                             alt="Toggle password visibility"
                                             onClick={handle_visible_verify}
                                             className="eye-icon"
                                        />
                                   </div>                    
                         </form>
                    </div>
                    <div className="credential-layer credential-password p-6 box-border bg-black/35 flex justify-center items-center flex-col gap-4 h-full w-full">
                         <div className="credential-space-between w-full flex justify-between">
                              <label htmlFor="username-setting-input" className="setting-label w-full text-[rgb(147,128,160)]">
                                   Confirm Password
                              </label>
                         </div>
                         <form onSubmit={handleSubmit} className="w-full">
                                   <div className="input-div flex justify-center items-center text-white font-[math] w-full bg-[#7a757b93] px-4  rounded-[0.1rem]">
                                        <input
                                             id="password-input"
                                             type={verify_Visible ? 'text' : 'password'}
                                             maxLength={30}
                                             value={confirmVerify}
                                             aria-label="confirm password"
                                             onChange={(e) => setConfirm(e.target.value)}
                                             className="w-full p-[0.1rem] rounded-[0.12rem] bg-transparent outline-none border-0"
                                        />
                                   </div>                        
                         </form>
                    </div>
               </div>
          </section>
     )
}