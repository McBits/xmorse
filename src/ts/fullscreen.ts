import { Query, QueryId } from "./query";

declare interface Document
{
	mozCancelFullScreen: Function;
}

const fullScreenButton = Query(".btn-fullscreen");
const playingView = document.body.parentElement;
const controls = Query(".controls");
const menu = Query(".menu");
const sidebar = Query(".sidebar");

let isFullScreen = false;
let hideControlsInterval: number;
let lastActivity = Date.now();
let hideControlsMS = 2000;
let controlsVisible = false;
let cursorVisible = false;

function exitFullScreen()
{
	document.body.classList.remove("fullscreen");

	if (document.exitFullscreen)
		document.exitFullscreen();
	else if (document["webkitExitFullscreen"])
		document["webkitExitFullscreen"]();
	else if ((<any>document).mozCancelFullScreen)
		(<any>document)["mozCancelFullScreen"]();

	clearInterval(hideControlsInterval);
	document.removeEventListener("mousemove", markTime);
}

function enterFullScreen()
{
	document.addEventListener("mousemove", markTime);
	hideControlsInterval = setInterval(hideOrReveal, 200);

	if (document.fullscreenEnabled)
		playingView.requestFullscreen();
	else if (document["webkitFullscreenEnabled"])
		playingView["webkitRequestFullscreen"]();
	else if ((<any>document)["mozFullScreenEnabled"])
		(<any>playingView)["mozRequestFullScreen"]();

	document.body.classList.add("fullscreen");
}

function toggleFullScreen()
{
	if (isFullScreen)
		exitFullScreen();
	else
		enterFullScreen();
}

function fullScreenChanged()
{
	isFullScreen = !isFullScreen;
	fullScreenButton.textContent = isFullScreen ? "Exit full screen" : "Full screen";
	lastActivity = Date.now();
}

function markTime()
{
	lastActivity = Date.now();
}

function hideOrReveal()
{
	if (isFullScreen && Date.now() - lastActivity > hideControlsMS)
	{
		hideControls();
		hideCursor();
	}
	else
	{
		showControls();
		showCursor();
	}
}

function hideCursor()
{
	if (cursorVisible)
		playingView.style.cursor = "none";

	cursorVisible = false;
}

function showCursor()
{
	if (!cursorVisible)
		playingView.style.cursor = "default";

	cursorVisible = true;
}

function hideControls()
{
	if (controlsVisible)
	{
		fullScreenButton.classList.add("disabled");
		controls.classList.add("disabled");
		menu.classList.add("disabled");
		sidebar.classList.add("disabled");
	}

	controlsVisible = false;
}

function showControls()
{
	if (!controlsVisible)
	{
		fullScreenButton.classList.remove("disabled");
		controls.classList.remove("disabled");
		menu.classList.remove("disabled");
		sidebar.classList.remove("disabled");
	}

	controlsVisible = true;
}

export function StopPlaying()
{
	showCursor();
	showControls();
	if (isFullScreen)
		exitFullScreen();
}

export function Initialize()
{
	if (document.fullscreenEnabled)
		document.addEventListener("fullscreenchange", fullScreenChanged);
	else if (document["webkitFullscreenEnabled"])
		document.addEventListener("webkitfullscreenchange", fullScreenChanged);
	else if ((<any>document)["mozFullScreenEnabled"])
		document.addEventListener("mozfullscreenchange", fullScreenChanged);

	fullScreenButton.addEventListener("click", toggleFullScreen);
}
