import { player } from "player";
import { PasteBuffer } from "pasteBuffer";
import * as FullScreen from "./fullscreen";
import * as Morse from "./morsetable";
import { AudioCtx } from "./audiocontext";
import { Query, QueryId, QueryAll } from "./query";

const homeBtn = Query<HTMLElement>(".btn-home");
const startBtns = QueryAll<HTMLElement>(".btn-start");
const startBtn = Query<HTMLButtonElement>(".btn-start");
const pauseBtn = Query<HTMLButtonElement>(".btn-pause");
const stopBtn = Query<HTMLButtonElement>(".btn-stop");
const gearBtn = Query<HTMLButtonElement>(".btn-gear");
const letterElement = Query(".letter");
const outputBuffer = Query(".outputBuffer");
const storyLinks = QueryAll(".story a");
const patternEl = Query<HTMLElement>(".view.playing .pattern");
const pasteTextBoxInput = QueryId<HTMLTextAreaElement>("pasteText");

async function loadBook(href: string): Promise<string>
{
	const response = await fetch(href, { method: "GET" });
	return response.text();
}

class ControlsUI
{
	ClearOutput()
	{
		outputBuffer.innerHTML = "";
	}

	StartPlaying = () =>
	{
		if (AudioCtx.state === "suspended")
			AudioCtx.resume();

		startBtn.disabled = true;
		pauseBtn.disabled = false;
		stopBtn.disabled = false;
		startBtn.style.display = "none";
		pauseBtn.style.display = "initial";
		location.hash = "#playing";
		pasteBuffer.SetTextBuffer(pasteTextBoxInput.value.length > 0 ? pasteTextBoxInput.value : undefined);
		player.Start();
	}

	PausePlaying = () =>
	{
		startBtn.disabled = false;
		pauseBtn.disabled = true;
		stopBtn.disabled = false;
		pauseBtn.style.display = "none";
		startBtn.style.display = "initial";
		player.Pause();
	}

	StopPlaying = () =>
	{
		player.Stop();
		FullScreen.StopPlaying();
		pasteBuffer.ResetPosition();
		outputBuffer.innerHTML = "";
		letterElement.innerHTML = "";
		patternEl.innerHTML = "";
		startBtn.disabled = false;
		pauseBtn.disabled = true;
		stopBtn.disabled = true;
		pauseBtn.style.display = "none";
		startBtn.style.display = "initial";
	}

	EmitCharacter(char: string)
	{
		letterElement.innerHTML = char;
	}

	OutputString(value: string)
	{
		let text = outputBuffer.innerHTML;

		if (text.length > 10000)
			text = text.substring(text.length / 2, text.length - 1);

		outputBuffer.innerHTML = text + value;
		outputBuffer.scrollTop = outputBuffer.scrollHeight;
	}

	OutputChar(char: Morse.Char)
	{
		this.OutputString(char == null ? " " : char.name);
	}

	DrawPattern(pattern: string)
	{
		function make(className: string): HTMLElement
		{
			const el = document.createElement("span");
			el.classList.add("element");
			el.classList.add(className);
			return el;
		}

		patternEl.appendChild(make("charSpace"));

		for (let i = 0; i < pattern.length; ++i)
		{
			let el: HTMLElement;

			if (pattern[i] === ".")
				el = make("dit");
			else if (pattern[i] === "-")
				el = make("dah");
			else if (pattern[i] === " ")
				el = make("wordSpace");

			patternEl.appendChild(el);
		}
	}

	pasteTextBoxChanged = () =>
	{
		const value = pasteTextBoxInput.value;
		localStorage.setItem("textBuffer", value);
		this.StopPlaying();
		this.ClearOutput();
	}

	Initialize()
	{
		pasteTextBoxInput.addEventListener("input", this.pasteTextBoxChanged);

		pauseBtn.addEventListener("click", this.PausePlaying);

		stopBtn.addEventListener("click", this.StopPlaying);

		gearBtn.addEventListener("click", () => location.hash = "settings");

		for (let i = 0; i < startBtns.length; ++i)
		{
			startBtns[i].addEventListener("click", this.StartPlaying);
		}

		for (let i = 0; i < storyLinks.length; ++i)
		{
			const storyLink = storyLinks[i];
			storyLink.addEventListener("click", async (evt: MouseEvent) =>
			{
				evt.preventDefault();
				const anchor = <HTMLAnchorElement>evt.target;
				const href = anchor.href;

				this.StopPlaying();
				const value = await loadBook(href);
				pasteTextBoxInput.value = value;
				this.pasteTextBoxChanged();
				this.StartPlaying();
			});
		}
	}
}

export const ui = new ControlsUI();
export const pasteBuffer = new PasteBuffer();
