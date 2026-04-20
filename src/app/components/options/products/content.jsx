import { useState, useEffect } from "react";
import ModifyProduct from "./modify/modifyProduct";
import Product_list_card from "./product-list-card";
import { useRouter } from "next/navigation";
import LoadingText from "../../../scripts/loadingText";
import Loadingdiv from "../../../scripts/loadingdiv";

export default function Products({LoadingScene, user}) {

    const [modify, setModify] = useState(null);  // Para almacenar el ID del producto
    const [productSelf, setProducts] = useState([]);
    const [productAll, setAllProduct] = useState([]);
    const [counts, setCounts] = useState({
        Accounts: 0,
        Services: 0,
    });
    const handleSearch = (e) => {
        const text = e.target.value
        let searching = [];
        productSelf.map((e)=>{
            const product_title = e.title; 
            console.log(product_title);
            if(product_title.includes(text)){
                searching.push(e);
            }
        });
        setAllProduct(searching);
    };
    const [loading, setLoading] = useState(true);  // Para manejar la carga de los productos
    const router = useRouter();

    // useEffect para verificar si hay un parámetro 'e' en la URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasEParam = params.has('e');  // Verifica si el parámetro 'e' existe en la URL

        // Si existe el parámetro 'e', se establece 'modify' con su valor
        if (hasEParam) {
            const e = params.get('e');
            setModify(e);  // Establece el ID del producto que se va a modificar
            setLoader(false);  // Terminamos de cargar, ya que no necesitamos cargar productos
            setLoading(false);
        } else {
            // Si no existe el parámetro 'e', cargamos los productos
            const fetchProducts = async () => {
                try {
                    const res = await fetch("/api/seller/self-product", {
                        credentials: "include",
                        method: "GET",
                    });

                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }

                    const products = await res.json();
                    setProducts(products);
                    setAllProduct(products);
                    
                    const newCounts = {
                        Accounts: 0,
                        Services: 0
                    };

                    // Clasificamos los productos según la categoría
                    for (const product of products) {
                        if (product.category === "Account") newCounts.Accounts++;
                        else if (product.category === "Service") newCounts.Services++;
                    }

                    setCounts(newCounts);  // Establece los contadores de categorías
                } catch (error) {
                    console.error("Error al cargar productos:", error);
                } finally {
                    setLoading(false);  // Terminamos la carga de los productos
                }
            };
            fetchProducts();  // Llama a la función para cargar los productos
        }
    }, []);  // Solo ejecuta este efecto una vez cuando el componente se monta

    // Si estamos cargando los productos o verificando la URL, mostramos un loader
    // if (loader || loading) {
    //     return <LoadingScene/>;
    // }

    // Si el parámetro 'e' está en la URL, renderiza ModifyProduct
    if (modify !== null) {
        return <ModifyProduct product_id={modify} LoadingScene={LoadingScene}/>;
    }

    const product_block = <>
        <div className="flex flex-row bg-[#c17fff0d] p-4 w-max gap-8 min-w-[35rem] max-[32rem]:w-full max-[38rem]:w-full max-[38rem]:min-w-0">
            <div className="w-[2.7rem] h-[2.7rem] aspect-square border-[3px] border-[rgba(0,0,0,.404)] box-content">
                <Loadingdiv size={"20px"}/>
            </div>

            <div className="flex w-full flex-col justify-between">
                <div className="flex items-end justify-between">
                    <div className="flex text-white max-[32rem]:overflow-hidden max-[32rem]:text-ellipsis max-[32rem]:max-w-[40rem] max-[38rem]:whitespace-nowrap max-[38rem]:overflow-hidden max-[38rem]:text-ellipsis max-[38rem]:text-[.7rem] max-[38rem]:max-w-[7.1rem]">
                        <div className=" w-20 h-4 bg-white/5"></div>
                    </div>
                    <div className="flex gap-2 flex-row text-[.92rem] text-[#fafafa8c] max-[52rem]:max-w-[27rem] max-[38rem]:whitespace-nowrap max-[38rem]:text-[.7rem]">
                        Quantity
                        <div className=" w-16 bg-white/5"></div>
                    </div>
                </div>

                <div className="flex gap-8 justify-between w-full max-[38rem]:gap-4">
                    <div className="flex text-[.92rem] text-[#fafafa8c] max-[38rem]:whitespace-nowrap max-[38rem]:text-[.757rem]">
                        <div className=" w-4 h-4 bg-white/5"></div>
                    </div>
                    <div className="flex gap-2 flex-row text-[.92rem] text-[#fafafa8c] max-[38rem]:whitespace-nowrap max-[38rem]:text-[.757rem]">
                        $
                        <div className=" w-16 bg-white/5"></div>
                    </div>
                </div>
            </div>
        </div>
    </>

    // Si no hay parámetro 'e', mostramos el listado de productos
    return (
        <div className="products-content-layer w-full h-full bg-[#050505] flex justify-center">
            <div className="product-content flex w-full flex-col gap-12">
                <div className="products-options bg-transparent w-full py-4 flex flex-col gap-4">
                    <div className="products-username-layer flex w-min justify-start">
                        <div className="products-username text-left flex justify-start w-max px-4">
                            <h3 className="text-white text-[1.8rem]">{user.username ? user.username : 
                                <>
                                <div className="w-[5.5rem] h-[2.33rem] aspect-square border-[3px] border-[rgba(0,0,0,.404)] box-content">
                                    <Loadingdiv size={"20px"}/>
                                </div>
                                </>
                            }</h3>
                        </div>
                    </div>

                    <div className="products-options-layer bg-[#131016] px-4 py-[.4rem] w-full flex flex-row items-center justify-between max-[38rem]:justify-around">
                        <div
                            className="products-options-content flex gap-4"
                            onClick={() => { router.push("/dashboard/create-product"); }}
                        >
                            <div
                                className="product-option-value px-8 py-[.7rem] flex flex-col justify-center h-min bg-[#281e35] cursor-pointer"
                                id="product-option-create"
                            >
                                <button
                                    style={{ width: "100%", height: "100%" }}
                                    id="create-product-btn"
                                    className="cursor-pointer"
                                >
                                    <h3 className="text-[rgba(255,255,255,0.753)] hover:color-white">Create</h3>
                                </button>
                            </div>
                        </div>

                        <div className="product-categoryes flex gap-4 max-[38rem]:flex-col">
                            <div
                                className="product-category-div p-4 bg-[#281e35] whitespace-nowrap max-[38rem]:px-[.8rem] max-[38rem]:py-[.4rem]"
                                id="account-category"
                            >
                                <h3 className="flex text-[rgba(255,255,255,0.753)] items-center">
                                    Accounts{" "}
                                    <span id="account-value" className="text-[rgba(255,255,255,0.753)] ml-1">
                                        {loading ? 
                                            <div className="w-2 h-4.5 bg-white/5"/>
                                            :
                                            counts.Accounts
                                        }
                                    </span>
                                </h3>
                            </div>

                            <div
                                className="product-category-div p-4 bg-[#281e35] whitespace-nowrap max-[38rem]:px-[.8rem] max-[38rem]:py-[.4rem]"
                                id="services-category"
                            >
                                <h3 className="flex text-[rgba(255,255,255,0.753)] items-center">
                                    Services{" "}
                                    <span id="services-value" className="text-[rgba(255,255,255,0.753)] ml-1">
                                        {loading ? 
                                            <div className="w-2 h-4.5 bg-white/5"/>
                                            :
                                            counts.Services
                                        }
                                    </span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="search-product flex flex-row gap-[2.1rem] px-4 items-end">
                    <h3 className="text-[1.4rem] text-white font-content">Search</h3>
                    <div className="search-input-div w-[40%] h-full px-4 bg-[rgb(27,19,34)] max-[38rem]:w-full text-suboption">
                        <input
                        id="search-input"
                            type="text"
                            onChange={handleSearch}
                            className="w-full h-full bg-[rgb(27,19,34)] outline-none focus:outline-none"
                        />
                        <label htmlFor="search-input"></label>
                    </div>
                </div>

                <div className="bg-transparent flex flex-row items-start justify-start gap-8">
                    <div className="bg-[#8151b112] w-[73%] max-[52rem]:w-full max-[32rem]:w-full">
                        <div className="py-12 px-4 flex flex-col gap-[1.1rem] max-h-[36rem] overflow-scroll">
                            {
                                loading ? 
                                    <>
                                        {product_block}
                                        {product_block}
                                        {product_block}
                                    </>
                                :
                                <>
                                    {
                                        productAll.length > 0 ?
                                        <Product_list_card products={productAll} setproducts={setAllProduct} />
                                            :
                                        <div className="text-white/80 w-full text-center font-content">No Products</div>
                                    }
                                </>
                        }
                        </div>
                    </div>
                </div>
                </div>
        </div>
    );
}
