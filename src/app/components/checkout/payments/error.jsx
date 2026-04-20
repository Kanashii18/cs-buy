export default function Error_windows({active, msg}){
     return(
          <div className={`text-white flex w-full justify-center items-center bg-[#f148486e] mx-4 my-[.1rem] py-10 transition-all duration-1000 ease-in-out ${
               active ? "opacity-100" : "opacity-0"
          }`}>
               <p className="text-center leading-relaxed text-white/90">Inconveniente al intentar realizar el pago <br />{msg}.</p>
          </div>  
     )
};