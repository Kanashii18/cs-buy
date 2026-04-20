import { useState, useEffect } from "react";
import Img_profile from "./top-bar-component/img-profile";
import List_options from "./top-bar-component/open-options-nav";
import Login_profile from "./top-bar-component/login-profile";

export default function Top_bar({ loggedIn, user, handlelogout, unread_count, unread_notification, loading }) {

	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [active, setActive] = useState(false);

	const [results, setResults] = useState([]);
	const [account, setAccount] = useState([]);
	const [services, setServices] = useState([]);

	const toggleActive = () => {
		setInputValue("");
		setActive(!active);
	};

	const handleSearch = async () => {
		if (!inputValue) return setResults([]);

		const response = await fetch(
			`/api/seller/get-product/top?product=${inputValue}`
		);
		const data = await response.json();

		setResults(data);

		const acc = [];
		const srv = [];

		data.forEach((item) => {
			if (item.category === "Account") acc.push(item);
			else if (item.category === "Service") srv.push(item);
		});

		setAccount(acc);
		setServices(srv);
	};

	useEffect(() => {
		if (inputValue) setActive(false);
	}, [inputValue]);

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
		setIsTyping(true);
	};

	useEffect(() => {
		if (!isTyping) return;

		const timer = setTimeout(() => {
			handleSearch();
			setIsTyping(false);
		}, 400);

		return () => clearTimeout(timer);
	}, [inputValue, isTyping]);

	return (
		<section className="fixed top-0 z-50 w-full flex flex-col items-center gap-2 text-white/90">
			{/* NAV BAR */}
			<nav className="w-full bg-[rgb(87_51_169_/_0.8)] backdrop-blur">
				<div className="grid gap-5 grid-cols-[1fr_2fr_1fr] max-w-7xl mx-auto px-6 py-2 items-center">

					{/* LEFT */}
					<div className="flex items-center gap-6">
						<a
							href="/"
							className="tracking-[1.2px] font-options text-white text-[1.3rem] whitespace-nowrap px-4 py-2 rounded bg-[#ffffff24]"
						>
							CS-Buy
						</a>

						{/* LINKS SOLO DESKTOP */}
						<div className="hidden md:flex items-center gap-6">
							<a
							href="/?section=accounts"
							className="tracking-[1.2px] font-options text-white text-[1.3rem] whitespace-nowrap px-4 py-2 rounded bg-[#ffffff24]"
							>
							Accounts
							</a>

							<a
							href="/?section=services"
							className="tracking-[1.2px] font-options text-white text-[1.3rem] whitespace-nowrap px-4 py-2 rounded bg-[#ffffff24]"
							>
							Services
							</a>
						</div>
					</div>


					{/* SEARCH */}
					<form
						onSubmit={(e) => e.preventDefault()}
						className="flex items-center bg-[rgb(255_255_255_/_0.17)] rounded px-2"
					>
						<input
							type="text"
							value={inputValue}
							onChange={handleInputChange}
							placeholder="Search..."
							aria-label="Search products, services or others"
							className="bg-[transparent] placeholder:text-[rgb(255_255_255_/_0.75)] text-sm px-2 py-1 outline-none w-full text-center "
						/>
						<button type="button">

							<img
							src="../assets/icons/search.svg"
							alt="search"
							className="w-4 h-4"
							/>
						</button>
					</form>

							{/* RIGHT */}
					<div className="flex justify-end items-center">
						{/* MENU MOBILE */}
						<button
							onClick={toggleActive}
							className="w-11 h-9 flex items-center justify-center rounded bg-black/60 md:hidden"
						>
							<img
							src={loading ? "../assets/icons/menu.svg" : null}
							alt="menu"
							className="w-5 h-5"
							/>
						</button>

						{/* DESKTOP */}
						<div className="hidden md:flex items-center gap-14 h-[100%] min-w-max">
							<a href="/help" className="text-white text-sm">
							Help
							</a>

							{loggedIn ? (
							<Img_profile
								user={user}
								count_notifications={unread_notification}
								count_messages={unread_count}
								loading={loading}
							/>
							) : (
							<Login_profile />
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* SEARCH RESULTS */}
			{inputValue && results.length > 0 && (
				<div className="w-full flex justify-center">
				<div className="w-[37rem] bg-black/60 p-3 rounded space-y-5">

				{[
					{ title: "Accounts", data: account },
					{ title: "Services", data: services },
				].map(({ title, data }) => (
					<div key={title}>
					<h3 className="text-lg font-mono mb-2">{title}</h3>

					{data.length === 0 ? (
						<div className="bg-purple-900/40 p-3 text-center text-sm text-neutral-300">
						no {title.toLowerCase()} found!
						</div>
					) : (
						<ul className="flex flex-col gap-3">
						{data.map((result) => (
						<a
							key={result.product_id}
							href={`/product?id=${result.product_id}`}
							className="block"
						>
							<li className="flex gap-3 bg-purple-900/40 p-2 rounded">
							<div className="w-16 aspect-square bg-black/40 p-1">
								<img
								src={loading ? result.image : null}
								alt={result.title}
								className="w-full h-full object-cover"
								/>
							</div>

							<div className="flex flex-col justify-between w-full text-right">
								<h5 className="truncate">{result.title}</h5>
								<p className="text-sm text-neutral-300">
								${result.price}
								</p>
							</div>
							</li>
						</a>
						))}
						</ul>
					)}
					</div>
				))}
				</div>
				</div>
			)}

			{/* OPTIONS MENU */}
			<List_options
				handleLogout={handlelogout}
				user={user}
				state={active ? "active" : ""}
				toggleActive={toggleActive}
			/>
		</section>
	);
}
