export default function Loadingdiv({size="38px"}){
     return(
          <>
               <div className={`relative overflow-hidden bg-white/[0.04] h-full w-full block`}>
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60 [animation-delay:-4.8s]`} />
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60 [animation-delay:-4.0s]`} />
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60 [animation-delay:-3.2s]`} />
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60 [animation-delay:-2.4s]`} />
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60 [animation-delay:-1.6s]`} />
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60 [animation-delay:-0.8s]`} />
                    <div className={`absolute inset-0 blur-[${size}] bg-[linear-gradient(135deg,transparent_47.5%,#ffffff04_49.2%,#ffffff0f_50%,#ffffff08_50.8%,transparent_52.5%)] bg-[length:320%_320%] animate-[diagonalWave_4s_linear_infinite] opacity-60`} />
               </div>
          </>
     )
}