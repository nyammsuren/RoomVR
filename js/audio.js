export function playAudio(file) {
    const audio = new Audio("./assets/audio/" + file);
    audio.play();
}