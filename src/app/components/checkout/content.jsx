import { motion } from 'framer-motion';

import Method from "./method";
import Details from "./details";
// animation frame

const containerVariants = {
     hidden: { opacity: 0 },
     visible: {
          opacity: 1,
          transition: {
               staggerChildren: 0.15, // delay entre animaciones de hijos
          },
     },
};

const itemVariants = {
     hidden: { opacity: 0, x: 50 }, // empieza desplazado a la derecha y oculto
     visible: { opacity: 1, x: 0 },  // aparece en posición
};

export default function Content(product_){
     const product = product_.product;
     return (
          <>   
               <motion.main
                    className="mt-32 h-[82.3vh] grid flex-1 overflow-auto justify-center gap-4 grid-cols-[1.1fr_.9fr] max-[66.2rem]:grid-cols-1 max-[66.2rem]:auto-rows-fr max-[66.2rem]:content-center max-[35.2rem]:grid-cols-1 max-[35.2rem]:auto-rows-fr max-[35.2rem]:content-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
               >
                    <motion.section
                         className="bg-[#070707] p-4 flex justify-center"
                         variants={itemVariants}
                    >
                         <Method product={product} />
                    </motion.section>

                    <motion.section
                         className="flex flex-col items-start justify-start pl-20 bg-[#070707] max-[66.2rem]:pl-0 max-[66.2rem]:items-center max-[35.2rem]:pl-0 max-[35.2rem]:items-center"
                         variants={itemVariants}
                    >
                         <Details product={product} />
                    </motion.section>
               </motion.main>
          </>
     );

}