export default function Incorrect({ error, display }) {
  return (
    <div
      className={`
        absolute w-full z-[9999] flex justify-center
        animate-error
      `}
      // style={{ display }}
    >
      <div className="fixed px-8 top-[20%] py-[1.1rem] bg-[#a0212199] text-white rounded-md text-[1.09rem] font-[system-ui] flex items-center justify-center">
        <p>{error}</p>
      </div>
    </div>
  );
}
