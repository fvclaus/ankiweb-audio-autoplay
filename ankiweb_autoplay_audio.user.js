// ==UserScript==
// @name         Autoplay Audio AnkiWeb
// @namespace    http://tampermonkey.net/
// @version      2024-07-05
// @description  try to take over the world!
// @author       You
// @match        https://ankiuser.net/study
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ankiuser.net
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';


    const waitForElementById = (id) => {
        return new Promise(resolve => {
            const checkElement = setInterval(() => {
                const element = document.getElementById(id);
                if (element !== null) {
                    clearInterval(checkElement);
                    resolve(element);
                }
            }, 100);
        });
    }
    const quizElement = await waitForElementById("quiz");
    console.log("quizElement", quizElement);

    const awaitPlaybackEnded = (audioElement) => {
        return new Promise(resolve => {
            const checkElement = setInterval(() => {
                if (audioElement.ended) {
                    clearInterval(checkElement);
                    resolve();
                }
            }, 50);
        });
    };
    let audioSrcs = [];
    let previousAbortController = new AbortController();
    const observer = async () => {
        console.log("Canceling previous playback");
        previousAbortController.abort();
        console.log("Checking for new audio elements to play. Previous audio files", audioSrcs);
        const currentAbortController = new AbortController();
        previousAbortController = currentAbortController;
        let aborted = false;
        const onAbort = () => {
            aborted = true;
        };
        currentAbortController.signal.addEventListener('abort', onAbort, { once: true });
        const previousAudioSrcs = [...audioSrcs];
        audioSrcs = [];
        for (const audioElement of document.getElementsByTagName("audio")) {
            for (const sourceElement of audioElement.getElementsByTagName("source")) {
                if (aborted) {
                    return;
                }
                const source = sourceElement.src;
                if (!previousAudioSrcs.includes(source)) {
                    console.log("Playing audio", source);
                    audioSrcs.push(source);
                    audioElement.play();
                    await awaitPlaybackEnded(audioElement);
                } else {
                    console.log("Audio", source, "already played");
                }
            }
        }
        currentAbortController.signal.removeEventListener('abort', onAbort);
    };
    // Cannot play the audio on the first card, because Chrome requires interaction with the DOM before playing audio.
    new MutationObserver(observer).observe(quizElement, {subtree: true, childList: true});
})();