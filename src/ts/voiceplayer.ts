import * as Morse from "./morsetable";
import { AudioCtx, VoiceGain } from "./audiocontext";

function voiceDone()
{
	console.log("Voice done");
	document.dispatchEvent(new CustomEvent("voicedone"));
}

export class VoicePlayer
{
	// For caching audio files as they're loaded
	private readonly audioBuffers: { [charName: string]: AudioBuffer } = {};
	private loadingPromise: Promise<AudioBuffer>;
	private audioSource: AudioBufferSourceNode;

	constructor()
	{
		console.log("Construct VoicePlayer");
	}

	private async loadVoice(char: Morse.Char): Promise<AudioBuffer>
	{
		try
		{
			const response = await fetch("/snd/" + char.voiceFileName, { method: "GET" });

			if (response.status === 200 || response.status === 304)
			{
				const arrayBuffer = await response.arrayBuffer();
				return AudioCtx.decodeAudioData(arrayBuffer);
			}
			else
				throw "Failed to fetch audio.";
		}
		catch (err)
		{
			console.error("Error deocding audio source: ", err);
		}
	}

	Preload(char: Morse.Char)
	{
		if (!this.audioBuffers[char.name] && char && char.voiceFileName)
			this.loadingPromise = this.loadVoice(char);
	}

	Stop()
	{
		if (this.audioSource)
		{
			this.audioSource.removeEventListener("ended", voiceDone);
			this.audioSource.stop(0);
		}
	}

	async PlayVoice(char: Morse.Char): Promise<void>
	{
		console.log("Play voice: ", char);

		if (!char || !char.voiceFileName)
			voiceDone()
		else
		{
			if (this.loadingPromise)
			{
				this.audioBuffers[char.name] = await this.loadingPromise;
				this.loadingPromise = undefined;
			}

			const audioBuffer = this.audioBuffers[char.name];

			if (audioBuffer)
			{
				this.audioSource = AudioCtx.createBufferSource();
				this.audioSource.addEventListener("ended", voiceDone);
				this.audioSource.buffer = audioBuffer;
				this.audioSource.connect(VoiceGain);
				this.audioSource.start(0);
			}
			else
			{
				voiceDone();
			}
		}
	}
}
