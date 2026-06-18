export default function FootBar() {
     return (
          <footer className="w-full border-t border-neutral-800 bg-neutral-950">
               <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-6 py-4 text-center text-sm sm:grid-cols-3">
                    <p className="text-neutral-400 sm:text-left"> © 2026 Csbuy </p>
                    <nav className="flex justify-center gap-4 text-neutral-400">
                         <a href="/help" className="hover:text-white"> Terms </a>
                         <a href="/help" className="hover:text-white"> Privacy </a>
                         <a href="/help" className="hover:text-white"> Contact </a>
                    </nav>
                    <p className="text-neutral-500 sm:text-right"> Developed by{" "}
                         <span className="text-neutral-300"> Daniel Alexander </span>
                    </p>
               </div>            
          </footer>
     );
}
