interface ChatMessageProps {
	from: string;
	message: string;
	timeStamp: string;
}

export function ChatMessage({ from, message, timeStamp }: ChatMessageProps) {
	return (
		<div className="flex gap-2">
			<b className="text-blue-500 pl-2">{from}:</b> {message}
			<div className="flex w-full justify-end">
				<p className="text-white/30">{timeStamp}</p>
			</div>
		</div>
	);
}
