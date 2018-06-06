/// <reference path="events.ts"/>
/// <reference path="morsetable.ts"/>

namespace TextLoader
{
	let textBuffer = "";
	let textBufferIndex = -1;

	export function ResetPosition()
	{
		textBufferIndex = textBuffer.length > 0 ? 0 : -1;
	}

	export function SetTextBuffer(text: string)
	{
		textBuffer = text.toUpperCase() + "\n";
		ResetPosition();
	}

	export function LoadBook(href: string): void
	{
		Player.StopPlaying();
		fetch(href, { method: "GET" }).then(response =>
			response.text().then(value =>
			{
				UI.playState = "stopped";
				UI.ClearOutput();

				Settings.SetTextBuffer(value);

				// TODO: Combine StartPlaying (search for other)
				Player.StartPlaying();
				FullScreen.Start();
				UI.StartPlaying();
			}));
	}

	export function Next(): [string, Morse.Char]
	{
		if (textBuffer.length > 0)
		{
			const startingIndex = textBufferIndex;
			let text = "";

			do
			{
				text += textBuffer[textBufferIndex];
				const morseChar = Morse.GetCharacter(textBuffer[textBufferIndex]);

				// Increment and wrap around if necessary
				++textBufferIndex;
				if (textBufferIndex === textBuffer.length)
					textBufferIndex = 0;

				if (morseChar)
					return [text, morseChar];
			}
			while (textBufferIndex !== startingIndex);

			return ["", null];
		}

		const char = Morse.RandomCharacter();

		return [char.name, char];
	}
}
