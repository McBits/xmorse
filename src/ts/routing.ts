import { Notify, VIEW_HOME, VIEW_OPTIONS, VIEW_PLAYING, VIEW_STORIES, VIEW_TEXT } from "./events";

const routes = {
    "": VIEW_HOME,
    "#playing": VIEW_PLAYING,
    "#options": VIEW_OPTIONS,
    "#stories": VIEW_STORIES,
    "#text": VIEW_TEXT
};

function processHash() {
    const hash = location.hash;
    if (routes[hash])
        Notify(routes[hash], null);

    if (hash === "" && location.href.indexOf("#") > -1)
        history.replaceState("", document.title, window.location.pathname);
}

window.addEventListener("hashchange", processHash);
document.addEventListener("DOMContentLoaded", processHash);