export default function PasswordInput({ id, text, value, onChange }) {
  return (
    <div className="whitespace-nowrap relative w-full max-w-[400px] text-white">
      <input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        required
        placeholder=" "
        className="
          peer
          w-full
          bg-transparent
          text-center
          text-[1.17rem]
          outline-none
          border-b-2
          border-neutral-500
          pt-2
          transition-colors
          focus:border-purple-600
        "
      />

      <label
        htmlFor={id}
        className="
          absolute
          left-1/2
          -translate-x-1/2
          bottom-[0.2em]
          text-[1.17rem]
          text-neutral-400
          pointer-events-none
          transition-all
          peer-focus:bottom-[1.8em]
          peer-focus:opacity-100
          peer-placeholder-shown:opacity-100
          peer-not-placeholder-shown:opacity-0
        "
      >
        {text}
      </label>
    </div>
  );
}
