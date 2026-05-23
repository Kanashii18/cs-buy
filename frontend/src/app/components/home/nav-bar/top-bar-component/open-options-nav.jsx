import {useRouter} from "next/navigation";

export default function List_options({ state, toggleActive, user, handleLogout }) {
  const isActive = state === "active";
  const router = useRouter();

  return (
    
    <div
      className={`
        w-full flex justify-center
        transition-all duration-300 text-[#ebd6ff] font-mono
        ${isActive ? "opacity-100 pointer-events-auto py-5" : "opacity-0 pointer-events-none h-0"}
      `}
    >
      <div
        className="
          w-[75%] max-w-3xl
          bg-black/80
          p-8
          rounded
        "
      >
        {/* CLOSE */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleActive}
            className="bg-purple-600/40 px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>

        <article className="flex flex-col gap-12">

          {/* USERNAME / LOGIN */}
          <div>
            <a href={user.username ? "/dashboard/profile" : "/login"}>
              <h2
                className={`
                  inline-block px-4 py-2 rounded
                  ${user.username ? "bg-purple-600/30" : "bg-purple-600/20"}
                `}
              >
                {user.username ? user.username : "Login"}
              </h2>
            </a>
          </div>

          {/* MAIN OPTIONS */}
          <div className="flex flex-col md:flex-row gap-12">

            {/* LEFT */}
            <div className="flex flex-col gap-4">
              <a href={user.username ? "/dashboard/profile" : "/login"}>
                <h4 className="px-4 py-2 rounded bg-purple-600/20">
                  Profile
                </h4>
              </a>

              <a href={user.username ? "/dashboard/message" : "/login"}>
                <h4 className="px-4 py-2 rounded bg-purple-600/20">
                  Messages
                </h4>
              </a>

              <a href={user.username ? "/dashboard/products" : "/login"}>
                <h4 className="px-4 py-2 rounded bg-purple-600/20">
                  Product
                </h4>
              </a>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
              <a href={user.username ? "/dashboard/order" : "/login"}>
                <h4 className="px-4 py-2 rounded bg-purple-600/20">
                  Orders
                </h4>
              </a>

              <a href={user.username ? "/dashboard/feedback" : "/login"}>
                <h4 className="px-4 py-2 rounded bg-purple-600/20">
                  Feedback
                </h4>
              </a>

              <a href={user.username ? "/dashboard/wallet" : "/login"}>
                <h4 className="px-4 py-2 rounded bg-purple-600/20">
                  Wallet
                </h4>
              </a>
            </div>
          </div>

          {/* SETTINGS + LOGOUT */}
          <div className="flex flex-col gap-4">
            <a href={user.username ? "/dashboard/settings" : "/login"}>
              <h4 className="px-4 py-2 rounded bg-purple-600/20 w-fit">
                Settings
              </h4>
            </a>

            {user.username && (
              <button
                onClick={() => handleLogout(router)}
                className="px-4 py-2 rounded bg-red-700/70 hover:bg-red-700 transition w-fit"
              >
                Exit Account
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
