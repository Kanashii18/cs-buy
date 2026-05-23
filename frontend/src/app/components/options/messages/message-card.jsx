export default function Message_card({ user, self, text }) {
	return (
		<div
			id="chat-values"
			// condition to clients message, if self === true message will be left, is self === false will be right 
			className={`flex rounded-[13px] px-4 py-[0.32rem] w-full max-w-[53.25rem] gap-4 max-[32.6rem]:p-0 max-[32.6rem]:items-center max-[32.6rem]:gap-[0.6rem]
				${self ? "flex-row-reverse" 
					:
					"flex-row"}`}
		>
			<div className="user-chat-info flex items-center justify-center bg-[rgb(77,78,78)] shadow-none box-border w-[2.6rem] h-[2.6rem] rounded-full pt-[0.18rem] max-[32.6rem]:items-start">
				<div className="img-user-chat bg-transparent">
					<img
					className="w-[2.5rem] h-[2.5rem] rounded-full object-cover max-[32.6rem]:w-8 max-[32.6rem]:h-8"
					src={user.img}
					alt="User image"
					/>
				</div>
			</div>
			<div className="chat-content-value bg-[rgba(61,34,77,0.945)] text-white px-4 py-[0.87rem] rounded-[10px] max-w-[46.20rem] box-border max-h-40 break-words text-[0.95rem] max-[32.6rem]:text-[.79rem] max-[32.6rem]:max-w-[12.3rem] max-[32.6rem]:px-[0.8rem] max-[32.6rem]:py-[0.4rem] max-[32.6rem]:h-min" >
				{text}
			</div>
		</div>
	);
}
