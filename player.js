const audio = new Audio();

const defaultTracks = [
  {
    title: "Тестовый трек 1",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    image: "assets/Name=Discover, Filled=Yes.svg"
  },
  {
    title: "Тестовый трек 2",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    image: "assets/Name=Discover, Filled=Yes.svg"
  },
  {
    title: "Тестовый трек 3",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    image: "assets/Name=Discover, Filled=Yes.svg"
  }
];

let tracks = [...defaultTracks];

const shuffleButton = document.querySelector('.player-shuffle');
const loopButton = document.querySelector('.player-loop');
const playButton = document.querySelector('.player-play');
const playButtonIcon = document.querySelector('.button-play');
const pauseButtonIcon = document.querySelector('.button-pause');
const nextButton = document.querySelector('.player-next');
const prevButton = document.querySelector('.player-prev');
const volumeSlider = document.querySelector('.player-volume__inner');

let currentTrackIndex = 0;
let isPlaying = false;
let isLooped = false;
let isShuffled = false;

function init() {
  const savedVolume = localStorage.getItem('volume');
  audio.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
  volumeSlider.value = audio.volume;

  if (tracks.length > 0) {
    loadTrack(0);
  }
}

function loadTrack(index) {
  if (tracks.length === 0) return;

  currentTrackIndex = index;
  const currentTrack = tracks[index];
  audio.src = currentTrack.src;

  document.querySelector('.current-info__title').textContent = currentTrack.title;
  document.querySelector('.current-info__artist').textContent = currentTrack.artist;

  const cover = document.querySelector(".current-image");
  cover.style.backgroundImage = `url(${currentTrack.image})`;
  cover.style.backgroundSize = "cover";

  if (isPlaying) audio.play();
}

export function togglePlay() {
  if (tracks.length === 0) return;

  if (audio.paused) {
    audio.play();
    isPlaying = true;
    playButtonIcon.style.display = "none";
    pauseButtonIcon.style.display = "block";
  } else {
    audio.pause();
    isPlaying = false;
    playButtonIcon.style.display = "block";
    pauseButtonIcon.style.display = "none";
  }
}

function formatTimeCustom(number) {
  if (!number || isNaN(number)) return '00:00';
  let string = [];
  let hours = Math.floor(number / 3600);
  let minutes = Math.floor(number % 3600 / 60);
  let seconds = Math.round(number % 60);
  if (hours > 0) string.push(hours);
  string.push(minutes, seconds);
  return string.map((value) => value < 10 ? '0' + value : value).join(':');
}

function prevTrack() {
  if (tracks.length === 0) return;

  if (!isShuffled) {
    currentTrackIndex = currentTrackIndex === 0 ? (tracks.length - 1) : (currentTrackIndex - 1);
  } else {
    currentTrackIndex = getRandomIndex();
  }
  loadTrack(currentTrackIndex);
}

function nextTrack() {
  if (tracks.length === 0) return;

  if (!isShuffled) {
    currentTrackIndex = currentTrackIndex === (tracks.length - 1) ? 0 : (currentTrackIndex + 1);
  } else {
    currentTrackIndex = getRandomIndex();
  }
  loadTrack(currentTrackIndex);
}

function getRandomIndex() {
  if (tracks.length <= 1) return 0;

  let newIndex = currentTrackIndex;
  let attempts = 0;
  while (attempts < 20) {
    newIndex = Math.floor(Math.random() * tracks.length);
    if (newIndex !== currentTrackIndex) return newIndex;
    attempts++;
  }
  return 0;
}

audio.addEventListener("canplay", () => {
  document.querySelector('.current-info__duration').textContent = formatTimeCustom(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  document.querySelector('.current-info__inner').value = audio.currentTime / audio.duration;
  document.querySelector('.current-info__progress').textContent = formatTimeCustom(audio.currentTime);
});

audio.addEventListener('ended', () => {
  !isLooped ? nextTrack() : audio.play();
});

document.querySelector('.current-info__inner').addEventListener('input', () => {
  audio.currentTime = document.querySelector('.current-info__inner').value * audio.duration;
});

loopButton.addEventListener('click', () => {
  isLooped = !isLooped;
  loopButton.style.filter = isLooped ? 'brightness(1.2)' : '';
  loopButton.style.transform = isLooped ? 'scale(1.3)' : '';
});

shuffleButton.addEventListener('click', () => {
  isShuffled = !isShuffled;
  shuffleButton.style.filter = isShuffled ? 'brightness(1.2)' : '';
  shuffleButton.style.transform = isShuffled ? 'scale(1.3)' : '';
});

nextButton.addEventListener("click", nextTrack);
prevButton.addEventListener("click", prevTrack);

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
  localStorage.setItem('volume', audio.volume);
});

playButton.addEventListener("click", togglePlay);

pauseButtonIcon.style.display = "none";

init();

window.updatePlayerTracks = function (newTracks) {
  if (newTracks && newTracks.length > 0) {
    tracks = newTracks;
  } else {
    tracks = [...defaultTracks];
  }

  currentTrackIndex = 0;
  if (tracks.length > 0) {
    loadTrack(0);
  }
};

window.playerData = {
  get tracks() { return tracks; },
  defaultTracks: defaultTracks
};

window.playTrack = function (index) {
  if (index >= 0 && index < tracks.length) {
    currentTrackIndex = index;
    loadTrack(index);
    if (!isPlaying) {
      togglePlay();
    }
  }
};