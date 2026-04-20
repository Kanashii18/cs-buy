import Image from "next/image";

export default function Search_bar({ setInputValue, handleSubmit, inputValue }) {

  return (
    <form className="search-bar m-1.5 mt-3 flex justify-center gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder=""
        alt="Search input"
        aria-label="Search products, services or assets"
        className="bg-[#ffffff3d] w-[25%] rounded-[4px] pr-2 pl-2 text-white/70  max-sm:w-[70%]"  
      />
      <button type="submit" className="cursor-pointer w-[24px] h-[24px]">
        <Image src="/assets/icons/search.svg" alt="Search button"
        width={24}
        height={24}/>
      </button>
    </form>
  );
} 
