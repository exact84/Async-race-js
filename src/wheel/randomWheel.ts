import newElement from '../newElement';
import type Router from '../router';
import { getOptions } from '../optionsManager';
import '../styles/randomWheel.css';
import {
  type WheelOption,
  drawWheel,
  getSectorIndexFromAngle,
  getRandomColor,
  shuffleArray,
} from './wheelDrawer';
import {
  WheelState,
  easeOutCubic,
  updateResultText,
  playSoundSafely,
  createAudioElement,
} from './wheelControls';
import winMp3 from '../assets/win.mp3';
import startMp3 from '../assets/startWin.mp3';

const MIN_DURATION = 5;
const MAX_DURATION = 30;

export default function renderRandomWheel(router: Router): void {
  const body = document.body;
  if (!body) return;

  body.replaceChildren();

  newElement('h1', 'Decision Making Tool', body);
  newElement('h2', 'Random Wheel', body);

  const validOptions = getOptions().filter(
    (option) => option.text.trim() !== '' && option.weight > 0,
  );

  let wheelState = WheelState.INITIAL;
  let isMuted = localStorage.getItem('wheelSoundMuted') === 'true';

  let rotationDuration = Number(
    localStorage.getItem('wheelRotationDuration') ?? MIN_DURATION.toString(),
  );
  if (rotationDuration < MIN_DURATION) rotationDuration = MIN_DURATION;
  if (rotationDuration > MAX_DURATION) rotationDuration = MAX_DURATION;
  let soundsSupported = true;
  const spinSound = createAudioElement(startMp3);
  const finishSound = createAudioElement(winMp3);

  finishSound.addEventListener('error', () => {
    console.warn('Could not load sound file');
    soundsSupported = false;
  });

  finishSound.load();

  if (validOptions.length < 2) {
    router.navigate('/');
  } else {
    const wheelOptions: WheelOption[] = validOptions.map((option) => ({
      ...option,
      color: getRandomColor(),
    }));

    shuffleArray(wheelOptions);

    const controlsContainer = newElement('div', '', body, [
      'controls-container',
    ]);

    const resultContainer = newElement('div', '', body, ['result']);
    resultContainer.textContent = 'Spin the wheel to pick a random option!';

    const wheelContainer = newElement('div', '', body, ['wheel-container']);

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    wheelContainer.append(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    const spinButtonEl = newElement(
      'button',
      'Spin the Wheel',
      controlsContainer,
      ['spin-btn'],
    );
    if (!(spinButtonEl instanceof HTMLButtonElement)) return;
    const spinButton = spinButtonEl;

    const soundButtonEl = newElement(
      'button',
      isMuted ? 'Sound Off' : 'Sound On',
      controlsContainer,
      ['sound-btn'],
    );
    if (!(soundButtonEl instanceof HTMLButtonElement)) return;
    const soundButton = soundButtonEl;

    const durationLabel = newElement(
      'label',
      'Duration (seconds): ',
      controlsContainer,
      ['duration-label'],
    );
    const durationInputEl = newElement(
      'input',
      '',
      durationLabel,
      ['duration-input'],
      {
        type: 'number',
        min: MIN_DURATION.toString(),
        max: MAX_DURATION.toString(),
        value: String(rotationDuration),
      },
    );
    if (!(durationInputEl instanceof HTMLInputElement)) return;
    const durationInput = durationInputEl;

    const backButtonEl = newElement('button', 'Back', controlsContainer, [
      'back-btn',
    ]);
    if (!(backButtonEl instanceof HTMLButtonElement)) return;
    const backButton = backButtonEl;

    soundButton.addEventListener('click', () => {
      if (wheelState === WheelState.PICKING) return;

      isMuted = !isMuted;
      soundButton.textContent = isMuted ? 'Sound Off' : 'Sound On';
      localStorage.setItem('wheelSoundMuted', String(isMuted));
    });

    durationInput.addEventListener('change', () => {
      const newDuration = Number(durationInput.value);
      if (newDuration >= MIN_DURATION && newDuration <= MAX_DURATION) {
        rotationDuration = newDuration;
        localStorage.setItem('wheelRotationDuration', String(rotationDuration));
      } else {
        if (newDuration < MIN_DURATION) {
          durationInput.setCustomValidity(
            `Duration must be at least ${MIN_DURATION.toString()} seconds`,
          );
        } else {
          durationInput.setCustomValidity(
            `Duration must be at most ${MAX_DURATION.toString()} seconds`,
          );
        }
        durationInput.reportValidity();
      }
    });

    spinButton.addEventListener('click', () => {
      const newDuration = Number(durationInput.value);
      if (newDuration < MIN_DURATION) {
        durationInput.setCustomValidity(
          `Duration must be at least ${MIN_DURATION.toString()} seconds`,
        );
        durationInput.reportValidity();
        return;
      }
      if (newDuration > MAX_DURATION) {
        durationInput.setCustomValidity(
          `Duration must be at most ${MAX_DURATION.toString()} seconds`,
        );
        durationInput.reportValidity();
        return;
      }

      wheelState = WheelState.PICKING;

      backButton.disabled = true;
      soundButton.disabled = true;
      spinButton.disabled = true;
      durationInputEl.disabled = true;

      playSoundSafely(spinSound, isMuted, soundsSupported);

      const totalWeight = wheelOptions.reduce(
        (sum, option) => sum + option.weight,
        0,
      );
      const randomAngle = Math.random() * 360;
      const spinAngle = 360 * 5 + randomAngle;

      let startTime: number | undefined;
      let currentAngle = 0;
      let highlightedSector = -1;

      function animate(timestamp: number): void {
        if (!startTime) startTime = timestamp;

        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / (rotationDuration * 1000), 1);
        currentAngle = spinAngle * easeOutCubic(progress);

        if (ctx) {
          drawWheel(
            ctx,
            canvas.width,
            canvas.height,
            wheelOptions,
            currentAngle,
          );
          const normalizedAngle = currentAngle % 360;
          const sectorIndex = getSectorIndexFromAngle(
            normalizedAngle,
            wheelOptions,
            totalWeight,
          );

          if (sectorIndex !== highlightedSector) {
            highlightedSector = sectorIndex;
            if (wheelState === WheelState.PICKING) {
              updateResultText(resultContainer, wheelOptions[sectorIndex].text);
            }
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          wheelState = WheelState.PICKED;
          if (highlightedSector !== -1) {
            const pickedOption = wheelOptions[highlightedSector];
            updateResultText(
              resultContainer,
              `Result: ${pickedOption.text}`,
              true,
            );
          }
          playSoundSafely(finishSound, isMuted, soundsSupported);
          backButton.disabled = false;
          soundButton.disabled = false;
          spinButton.disabled = false;
          durationInput.disabled = false;
        }
      }

      requestAnimationFrame(animate);
    });

    backButton.addEventListener('click', () => {
      if (wheelState === WheelState.PICKING) return;
      router.navigate('/');
    });

    if (ctx) {
      drawWheel(ctx, canvas.width, canvas.height, wheelOptions, 0);
    }
  }
}
