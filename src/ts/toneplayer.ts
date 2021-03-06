import { ui } from "controls";
import { player } from "player";
import * as Morse from "./morsetable";
import { AudioCtx, ToneGain } from "./audiocontext";

export class TonePlayer
{
	private currentChar: Morse.Char;
	private currentBufferSource: AudioBufferSourceNode;

	private patternEnded = (): Promise<void> =>
	{
		ui.OutputChar(this.currentChar);

		return player.PatternComplete(this.currentChar);
	}

	Stop()
	{
		if (this.currentBufferSource)
		{
			this.currentBufferSource.removeEventListener("ended", this.patternEnded);
			this.currentBufferSource = undefined;
		}
	}

	PlayPattern(char: Morse.Char): void
	{
		this.currentChar = char;

		ui.EmitCharacter(char.name);
		ui.DrawPattern(char.pattern);

		this.currentBufferSource = AudioCtx.createBufferSource();
		this.currentBufferSource.connect(ToneGain);
		this.currentBufferSource.buffer = char.toneAudioBuffer;
		this.currentBufferSource.addEventListener("ended", this.patternEnded);
		this.currentBufferSource.start();
	}
}
