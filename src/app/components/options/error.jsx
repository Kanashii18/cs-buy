import { useEffect } from 'react';

export default function ErrorAlert({ error, errorState }) {

     useEffect(() => {
          const timer = setTimeout(() => {
               errorState(false);
          }, 4000);

          return () => clearTimeout(timer);
     }, []);

     if (!errorState) return null;

     return (
          <div className="fixed top-[11%] w-full z-[9999] rounded-[5px] flex justify-center text-white/95
                         animate-[slideDown_0.3s_ease-out_forwards,slideUp_0.3s_ease-in_3s_forwards]">
               <div className="py-[1.1rem] px-[2rem] text-center rounded-[5px] flex justify-center
                              bg-red-700/55 h-full text-[1.09rem] items-center
                              font-[system-ui] w-1/2">
                    {error}
               </div>
          </div>
     );
}
