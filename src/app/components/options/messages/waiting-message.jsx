export default function WaitingContainer({ LoadingScene }) {
  return (
    <>
      <section className="chat-container-layer flex flex-col gap-6 p-[1.4rem] rounded-[2px] w-full h-full bg-[rgb(23,18,31)] max-[52.3125rem]:w-[98%] max-[52.3125rem]:justify-self-center max-[32.6rem]:w-full max-[32.6rem]:p-[1.4rem_0.2rem]">
        <div className="information-layer grid mt-[.9rem] grid-cols-[auto_auto] gap-[4.5rem]" style={{ display: "block" }}>
          <div
            className="username-focus-chat flex justify-center items-center bg-[#26192e] w-full rounded-[6px] max-h-none h-[4.84rem]"
            style={{ height: "4.84rem", maxHeight: "none", width: "100%" }}
          >
            <h2 className="text-[rgb(239,230,248)]">...</h2>
          </div>
        </div>

        <div className="chat-div max-[32.6rem]:grid max-[32.6rem]:justify-items-center max-[32.6rem]:p-[0.6rem]">
          <div
            className="chat-content flex flex-col bg-[#100b16] min-h-[32rem] max-h-[32rem] rounded-[10px] px-4 py-2 overflow-y-auto [scroll-behavior:smooth] items-center p-6 gap-3 my-4 max-[32.6rem]:p-2 max-[32.6rem]:w-full max-[32.6rem]:min-h-[26rem] max-[32.6rem]:max-h-[26rem]"
            style={{ width: "100%", height: "100%", justifyContent: "center" }}
          >
            <LoadingScene />
          </div>

          <div className="chat-options flex justify-center items-center bg-[rgb(58,51,71)] h-[2.4rem] px-4 rounded gap-[0.9rem] max-[32.6rem]:w-full">
            <input
              className="bg-[rgb(58,51,71)] w-full h-full list-none focus:outline-none focus:border-0"
              type="text"
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Escribe un mensaje..."
            />
            <div className="send-button cursor-pointer" style={{ cursor: "pointer" }}>
              <img src="../assets/icons/send.svg" alt="Enviar" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
