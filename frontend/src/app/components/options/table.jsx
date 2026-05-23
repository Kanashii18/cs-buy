import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Table({ handlelogout, messages, notification_value }) {
  const router = useRouter();
  const pathname = usePathname();

  const transition = `max-sm:text-[1rem] option-div relative flex gap-[1.3rem] justify-center p-4 max-sm:p-3 bg-[#432553] text-center font-mono tracking-[.06rem] text-[1.13rem] rounded-[10px]
  transition-[margin,background-color] duration-200 ease-in-out hover:bg-[#58356b] hover:my-[-.27rem]
  before:content-[''] before:absolute before:left-0 before:right-0 before:top-[-0.5rem] before:h-[0.5rem]
  after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[-0.5rem] after:h-[0.5rem]
  hover:z-10`

  const transitionNotif = `max-sm:text-[1rem] option-div relative flex gap-4 justify-center p-4 max-sm:p-3 bg-[#432553] text-center font-mono tracking-[.06rem] text-[1.13rem] rounded-[10px]
  transition-[margin,background-color] duration-200 ease-in-out hover:bg-[#58356b] hover:my-[-.5rem]
  before:content-[''] before:absolute before:left-0 before:right-0 before:top-[-.5rem] before:h-[.5rem] before:pointer-events-none
  after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[-.5rem] after:h-[.5rem] after:pointer-events-none
  hover:z-20`;

  return (
    <section className="h-auto options-table m-0 bg-[#050505] p-4  rounded max-sm:order-2">
      <div className="options-table-layer m-0 w-[100%] bg-[#131016] flex justify-center w-auto h-full box-border p-2 text-[rgb(184,184,184)] bg-[#131016]">
        <article className="flex flex-col justify-between list-none no-underline h-auto w-full gap-[5rem] max-sm:gap-[4rem] p-[1.6rem]">
          <div className="first-line flex flex-col gap-[1.2rem]">
            <Link className="no-underline" href="/dashboard/profile">
              <div
                className={transition}
                id="perfil-option-layer"
              >
                Profile
              </div>
            </Link>

            <Link className="no-underline" href="/dashboard/message">
              <div
                className={transition}
                id="message-option-layer"
              >
                Messages{" "}
                {messages <= 0 || pathname === "/dashboard/message" ? (
                  <></>
                ) : (
                  <span className="value_table_alert bg-[#865799] rounded px-1 text-[#fbf4ff]">
                    {messages}
                  </span>
                )}
              </div>
            </Link>

            <a className="no-underline" href="/dashboard/products">
              <div
                className={transition}
                id="product-option-layer"
              >
                Products
              </div>
            </a>

            <Link className="no-underline" href="/dashboard/order">
              <div
                className={transition}
                id="product-option-layer"
              >
                Orders
              </div>
            </Link>

            <Link className="no-underline" href="/dashboard/feedback">
              <div
                className={transition}
                id="feedback-option-layer"
              >
                Feedback
              </div>
            </Link>

            <Link className="no-underline" href="/dashboard/wallet">
              <div
                className={transition}
                id="wallet-option-layer"
              >
                Wallet
              </div>
            </Link>

            <Link className="no-underline" href="/dashboard/notifications">
              <div
                className={transitionNotif}
                id="wallet-option-layer"
              >
                Notifications{" "}
                {notification_value <= 0 || pathname === "/dashboard/notifications" ? (
                  <></>
                ) : (
                  <span className="value_table_alert bg-[#865799] rounded px-1 text-[#fbf4ff]">
                    { notification_value }
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="last-line flex flex-col gap-[2rem]">
            <Link className="no-underline" href="/dashboard/settings">
              <div
                className={transitionNotif}
                id="config-option-layer"
              >
                Settings
              </div>
            </Link>

            <button
              id="logout-button"
              className="bg-transparent"
              onClick={() => handlelogout(router)}
            >
              <div
                className="option-div flex gap-[1.3rem] justify-center p-4 bg-[#4d1c21] text-center font-mono tracking-[.06rem] text-[1.13rem] rounded-[10px] transition-[margin,background-color] duration-200 ease-in-out hover:bg-[#89232e] hover:my-[-.5rem]"
                id="exit-option-layer"
              >
                Exit Account
              </div>
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
