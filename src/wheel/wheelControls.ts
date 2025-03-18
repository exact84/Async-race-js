export enum WheelState {
  INITIAL,
  PICKING,
  PICKED,
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function updateResultText(
  resultElement: HTMLElement,
  text: string,
  isPicked = false,
): void {
  resultElement.textContent = text;

  if (isPicked) {
    resultElement.classList.add('picked');
  } else {
    resultElement.classList.remove('picked');
  }
}

export function playSoundSafely(
  audioElement: HTMLAudioElement,
  isMuted: boolean,
  soundsSupported: boolean,
): void {
  if (!isMuted && soundsSupported) {
    audioElement.currentTime = 0;
    void audioElement.play().catch((error: unknown) => {
      if (error instanceof Error) {
        console.warn('Could not play sound:', error.message);
      }
    });
  }
}

export function createAudioElement(src?: string): HTMLAudioElement {
  const audio = document.createElement('audio');
  if (src) {
    audio.src = src;
  }
  audio.preload = 'auto';
  return audio;
}

export function initSoundElements(): {
  spinSound: HTMLAudioElement;
  finishSound: HTMLAudioElement;
  soundsSupported: boolean;
} {
  const soundsSupported = true;
  const spinSound = createAudioElement();
  const finishSound = createAudioElement('./win.mp3');

  finishSound.addEventListener('error', () => {
    console.warn('Could not load sound file');
  });

  finishSound.load();

  return { spinSound, finishSound, soundsSupported };
}
