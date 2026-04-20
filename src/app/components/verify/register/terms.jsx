import { useState } from "react";

export default function TermsAndConditions({TermsAndConditions}) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      {/* checkbox */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 justify-center">
        <input
          type="checkbox"
          id="accept-terms"
          className="w-[18px] h-[18px] cursor-pointer"
          onClick={()=>{ TermsAndConditions(false) }}
        />

        <label
          htmlFor="accept-terms"
          className="text-[13px]"
        >
          Aceptas los términos y condiciones
        </label>

        <span
          onClick={() => setShowTerms(true)}
          className="w-full cursor-pointer underline text-blue-600 hover:text-blue-800 text-center"
        >
          Ver términos y condiciones
        </span>
      </div>


      {/* modal */}
      {showTerms && (
        <div
          onClick={() => setShowTerms(false)}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white p-8 w-[80%] max-w-[600px] max-h-[80vh] overflow-y-auto rounded shadow-lg text-neutral-800 text-base leading-relaxed"
          >
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-2 right-4 text-xl font-bold cursor-pointer"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Términos y Condiciones
            </h2>

            <p className="mb-3">
              Aquí va el texto completo de los términos y condiciones que el
              usuario debe leer y aceptar para continuar usando el servicio.
            </p>

            <p>
              Puedes agregar todo el contenido legal necesario aquí, con formato,
              links, lo que requieras.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
