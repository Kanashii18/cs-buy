import { useState } from "react";
import Product_config from "./product-config";
import ProductCard from "./product-card";
import Next_options from "./next-product-line/next-option";
import { LoadingProduct } from "../../../loader/main";
import LoadingText from "../../../../scripts/loadingText";

export default function ProductContainer({ productos,loading_product, setCategory, setMin, setMax, handleSubmit }) {
     const PRODUCTS_PER_PAGE = 18;

     // Paginar productos en chunks de 15
     function chunkArray(array, size) {
          const result = [];
          for (let i = 0; i < array.length; i += size) {
               result.push(array.slice(i, i + size));
          }
          return result;
     }

     const chunked = chunkArray(productos, PRODUCTS_PER_PAGE);

     // Estado para página actual
     const [currentPage, setCurrentPage] = useState(1);

     const totalPages = chunked.length;    

     // Funciones para cambiar página
     const goPrev = () => {
     if (currentPage > 1) setCurrentPage(currentPage - 1);
     };

     const goNext = () => {
     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
     };

     return (
		<section className="grid grid-cols-[auto_1fr] gap-4 mt-[0.8rem] pb-[0.8rem] pt-4 w-full h-full bg-black max-[48.7rem]:grid-cols-1 max-[48.7rem]:h-auto">
			<Product_config  setCategory={setCategory} setMin={setMin} setMax={setMax} handleSubmit={handleSubmit}/>
			<div className="lg:min-h-[48vh] h-[80%] sm:mr-[1rem]" id="products-container">
				{loading_product ? (
					<div className="flex w-full h-full justify-center items-center pb-24">
						<LoadingText text={""} size={"100px"} speed={200}/>
					</div>
				) : (
					<>
						{productos.length === 0 ? (
							<section className="pb-8 flex justify-center items-center flex-col w-full h-[29rem] max-[38rem]:mb-12 max-[38rem]:mx-0">
								<div>
									<h3 className="font-content text-white/80 text-center w-full text-[1.4rem] max-[38rem]:text-[1.05rem]">
										Not Products Founds.
									</h3>
								</div>
								<div>
									<img
										src="/data/images/mascots/notfound.png"
										alt="not found image"
										className="w-[18rem] aspect-square max-[38rem]:w-44"
									/>
								</div>
								
							</section>
						) : (
							<>
								<div className="w-auto grid grid-cols-6 gap-4 w-full bg-[#0c0c0c] p-4 [container-type:inline-size] justify-center items-center max-[80rem]:grid-cols-[repeat(3,0.7fr)] max-[65rem]:grid-cols-[repeat(2,0.7fr)] max-[65rem]:px-8 max-[38rem]:grid-cols-1 max-[38rem]:p-2 max-[1821px]:grid-cols-[repeat(5,0.7fr)]">
									{chunked[currentPage - 1] ? (
										<>
											{chunked[currentPage - 1].map(product => (
												<ProductCard key={product.product_id} product={product} />
											))}
										</>
									) : (
										<section className="pb-8 flex justify-center items-center flex-col w-full h-[29rem] max-[38rem]:mb-12 max-[38rem]:mx-0">
											<div>
												<h3 className="font-content text-white/85 text-center w-full text-[1.4rem] max-[38rem]:text-[1.05rem]">
													Not Products Founds.
												</h3>
											</div>
											<div>
												<img
													src="/data/images/mascots/notfound.png"
													alt="not found image"
													className="w-[18rem] aspect-square max-[38rem]:w-44"
												/>
											</div>
											
										</section>
									)}
								</div>

								<Next_options
									currentPage={currentPage}
									totalPages={totalPages}
									onPrev={goPrev}
									onNext={goNext}
								/>
							</>
						)}
					</>
				)}
			</div>
		</section>
	);
}