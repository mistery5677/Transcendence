interface Message {
	from: string;
	avatarUrl?: string;
	message: string;
	timeStamp: string;
}

interface ChatMessagesProps {
	messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
	return (
		<div className="space-y-4 min-h-[200px]">
			{messages.length === 0 ? (
				<div className="rounded-3xl text-xl border border-stone-700 bg-stone-900/80 p-6 text-center text-stone-400">
					No messages yet. Start the conversation.
				</div>
			) : (
				messages.map((m, i) => (
					<div
						key={i}
						className={`rounded-3xl border border-stone-700 p-4 shadow-sm ${i % 2 === 0 ? "bg-stone-800" : "bg-stone-900/90"}`}>
						<div className="flex items-center justify-between gap-3 text-sm text-stone-400">
							<div className="flex items-center gap-3">
								<div className="h-9 w-9 rounded-full bg-stone-700 flex items-center justify-center text-sm text-stone-200">
									<img
										className="rounded-full object-fit max-h-10 max-w-10"
										src={m.avatarUrl}
										alt="avatarUrl"
									/>
								</div>
								<span className="font-semibold text-stone-100">{m.from}</span>
							</div>
							<span className="text-stone-500 text-xs">{m.timeStamp}</span>
						</div>
						<p className="mt-3 text-base leading-7 text-stone-200">{m.message}</p>
					</div>
				))
			)}
		</div>
	);
}
