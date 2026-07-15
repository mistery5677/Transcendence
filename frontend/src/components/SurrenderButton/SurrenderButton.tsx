import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { IconFlag } from "@tabler/icons-react";

type SurrenderButtonProps = {
	onSurrender: () => void;
};

const overlayClassName = "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm";

const contentClassName =
	"fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-700 bg-stone-900 p-6 text-stone-100 shadow-2xl";

const buttonBaseClassName =
	"rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900";

export const SurrenderButton = ({ onSurrender }: SurrenderButtonProps) => (
	<AlertDialog.Root>
		<AlertDialog.Trigger asChild>
			<button
				type="button"
				aria-label="Surrender game"
				title="Surrender"
				className="flex h-full w-full items-center justify-center rounded-xl border border-stone-700 bg-button-stone text-stone-300 shadow-md transition-colors hover:border-red-500/50 hover:bg-stone-700 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50">
				<IconFlag className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
			</button>
		</AlertDialog.Trigger>

		<AlertDialog.Portal>
			<AlertDialog.Overlay className={overlayClassName} />

			<AlertDialog.Content className={contentClassName}>
				<AlertDialog.Title className="text-lg font-semibold text-stone-100">
					Surrender game?
				</AlertDialog.Title>

				<AlertDialog.Description className="mt-2 text-sm leading-6 text-stone-400">
					This will end the current game and record it as a loss. This action
					cannot be undone.
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
							onClick={onSurrender}
							className={`${buttonBaseClassName} bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500`}>
							Surrender
						</button>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
);