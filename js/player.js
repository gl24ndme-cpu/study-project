const audio = new Audio();
/*
audio.play()
audio.pause()
audio.src = "path/to/file.mp3"
audio.currentTime
audio.volume
audio.duration */
const tracks = [
  {
    title: "Тестовый трек 1",
    artist: "Сервис для разработчиков",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    image: "assets/image.png"
  },
  {
    title: "Тестовый трек 2",
    artist: "Сервис для разработчиков",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    image: "assets/image.png"
  },
  {
    title: "Тестовый трек 3",
    artist: "Сервис для разработчиков",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    image: "assets/image.png"
  }
];

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


// ИНИАЦИАЛИЗАИВАЦИЯ 
function init() {
  audio.volume = localStorage.getItem('volume')
  volumeSlider.value = audio.volume
  loadTrack(0)
}

function loadTrack(index) {
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
  let string = []
  let hours = Math.floor(number / 3600)
  let minutes = Math.floor(number % 3600 / 60)
  let seconds = Math.round(number % 60)
  if (hours > 0) string.push(hours)
  string.push(minutes, seconds)

  return string.map((value) => { return value < 10 ? '0' + value : value}).join(':')
}

function prevTrack() {
  if (!isShuffled) {
    currentTrackIndex = currentTrackIndex == 0 ? (tracks.length - 1) : (currentTrackIndex - 1)
  }
  else {
    currentTrackIndex = getRandomIndex();
    console.log(currentTrackIndex)
  }
  loadTrack(currentTrackIndex)
}

function nextTrack() {
  if (!isShuffled) {
    currentTrackIndex = currentTrackIndex == (tracks.length - 1) ? 0 : (currentTrackIndex + 1)
  }
  else {
    currentTrackIndex = getRandomIndex();
    console.log(currentTrackIndex)
  }
  loadTrack(currentTrackIndex)
}

function getRandomIndex() {
  let newIndex = currentTrackIndex;
  let c = 0;
  while (true)  {
    c+=1
    newIndex = Math.floor(Math.random() * tracks.length);
    if (newIndex !== currentTrackIndex) return newIndex
    if (c > 20) return 0
  }
}

audio.addEventListener("canplay", () => {
  document.querySelector('.current-info__duration').textContent = formatTimeCustom(audio.duration)
})

audio.addEventListener('timeupdate', () => {
  document.querySelector('.current-info__inner').value = audio.currentTime / audio.duration
  document.querySelector('.current-info__progress').textContent = formatTimeCustom(audio.currentTime)
}) 

audio.addEventListener('ended', () => {
  !isLooped ? nextTrack() : audio.play() 
})

document.querySelector('.current-info__inner').addEventListener('input', () => {
  audio.currentTime = document.querySelector('.current-info__inner').value * audio.duration;
})

loopButton.addEventListener('click', () => {
  isLooped = !isLooped
  loopButton.style.filter = isLooped ? 'brightness(1.2)' : ''
  loopButton.style.transform = isLooped ? 'scale(1.3)' : ''
})

shuffleButton.addEventListener('click', () => {
  isShuffled = !isShuffled
  shuffleButton.style.filter = isShuffled ? 'brightness(1.2)' : ''
  shuffleButton.style.transform = isShuffled ? 'scale(1.3)' : ''
})

nextButton.addEventListener("click", nextTrack)

prevButton.addEventListener("click", prevTrack)

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
  localStorage.setItem('volume', audio.volume);
})

playButton.addEventListener("click", togglePlay);


pauseButtonIcon.style.display = "none";



init()

// глобальные функции для библиотеки
window.playerData = { tracks };
window.playTrack = function(index) {
    currentTrackIndex = index;
    loadTrack(index);
    if (!isPlaying) {
        togglePlay();
    }
};