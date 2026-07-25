import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { IconHeartHandshake } from "@tabler/icons-react";

type OfferDrawButtonProps = {
	onOfferDraw: () => void;
};

const overlayClassName =
	"fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

const contentClassName =
	"fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-700 bg-stone-900 p-6 text-stone-100 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

const buttonBaseClassName =
	"rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900";

export function OfferDrawButton({ onOfferDraw }: OfferDrawButtonProps) {
	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger asChild>
				<button
					type="button"
					title="Offer a draw"
					aria-label="Offer a draw to your opponent"
					className="flex h-full w-full items-center justify-center rounded-xl border border-stone-700 bg-button-stone text-stone-300 shadow-md transition-colors hover:border-green-500/50 hover:bg-stone-700 hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50">
					<IconHeartHandshake
						className="h-5 w-5 sm:h-6 sm:w-6"
						aria-hidden="true"
					/>
				</button>
			</AlertDialog.Trigger>

			<AlertDialog.Portal>
				<AlertDialog.Overlay className={overlayClassName} />

				<AlertDialog.Content className={contentClassName}>
					<AlertDialog.Title className="text-lg font-semibold text-stone-100">
						Offer a draw?
					</AlertDialog.Title>

					<AlertDialog.Description className="mt-2 text-sm leading-6 text-stone-400">
						Send your opponent an offer to end the game in a draw. They can accept or decline it.
					</AlertDialog.Description>

					<div className="mt-6 flex justify-end gap-3">
						<AlertDialog.Cancel asChild>
							<button
								type="button"
								className={`${buttonBaseClassName} border border-stone-700 bg-button-stone text-stone-200 hover:bg-stone-800 focus-visible:ring-stone-400`}>
								Keep playing
							</button>
						</AlertDialog.Cancel>

						<AlertDialog.Action asChild>
							<button
								type="button"
								onClick={onOfferDraw}
								className={`${buttonBaseClassName} bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500`}>
								Offer draw
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
