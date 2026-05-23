// LoadingScreen
export function LoadingScreen() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black">
      <div className="flex justify-center items-center h-auto w-full">
        <div className="h-60 w-60 pb-[1.7rem] rounded-[10rem] flex justify-center items-center">
          <img
               src="/assets/load_product.svg"
               alt="Cargando..."
               className="w-auto h-40 object-[revert-layer]"
          />
        </div>
      </div>
    </div>
  );
}

// LoadingScene
export function LoadingScene() {
  return (
    <div className="flex flex-col min-h-auto items-center justify-center">
      <div className="flex justify-center items-center w-full">
        <div className="h-60 w-60 pb-[1.7rem] rounded-[10rem] flex justify-center items-center">
          <img
            src="/assets/loadcat.svg"
            alt="Cargando..."
            className="w-auto h-80 object-[revert-layer]"
          />
        </div>
      </div>
    </div>
  );
}

export function LoadingProduct() {
    return (
    <div className="flex flex-col h-[100%] items-center justify-center">
      <div className="flex justify-center items-center h-min w-full">
        <div className="h-80 w-60 pb-[1.7rem] rounded-[10rem] flex justify-center items-center">
          <img
               src="/assets/load_product.svg"
               alt="Cargando..."
               className="w-auto h-80 object-[revert-layer]"
          />
        </div>
      </div>
    </div>
  );
}
