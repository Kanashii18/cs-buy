export default function Ahc_method(){
  
     const handle_withdraw = () => {
          (async()=>{
               const res = fetch("/api/account/withdraw",{
                    method:"POST",
                    credentials:"include"
               })
               if(!res.ok) return console.error("Error in withdraw api");
               // later... //
          })()
     }
     return(
          <div className="wallet_methods-layer bg-[#daa2ff2e] p-[1rem_2.1rem] rounded-md transition-colors duration-300 ease-in-out m-[.5rem_1rem] cursor-pointer hover:bg-[#daa2ff45]" onClick={handle_withdraw}>
               <div className="withdraw-content">
                    <span id="withdraw-buttom" className="text-[1.2rem] min-w-[6rem] justify-center flex">
                         ACH
                    </span>
               </div>
          </div>
     )
}