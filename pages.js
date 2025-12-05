import { loadUserTracks, deleteTrack } from './upload.js';

const homePage = document.querySelector('.main-home-page');
const libraryPage = document.querySelector('.main-favorite-tracks');
const homeButton = document.querySelector('.nav-links__home');
const libraryButton = document.querySelector('.nav-links__library');
const navButtons = [homeButton, libraryButton];
const cooldownTime = 800;
const sonarLetters = [...document.querySelector('.welcome-animated-inner').children];

let userTracks = [];

function animateSonarHide(callback) {
    sonarLetters.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add("hide-letter");
        }, i * 80);
    });
    setTimeout(callback, sonarLetters.length * 80 + 500);
}

function animateSonarShow() {
    sonarLetters.forEach((el, i) => {
        setTimeout(() => {
            el.classList.remove("hide-letter");
        }, i * 80);
    });
}

function setNavCooldown() {
    navButtons.forEach(btn => {
        btn.classList.add('on-cooldown');
        btn.disabled = true;
    });

    setTimeout(() => {
        navButtons.forEach(btn => {
            btn.classList.remove('on-cooldown');
            btn.disabled = false;
        });
    }, cooldownTime);
}

function getTracks() {
    if (userTracks.length > 0) {
        return userTracks;
    }
    return window.playerData?.defaultTracks || [];
}

async function renderTracksLibrary() {
    const container = libraryPage;
    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'tracks-header';
    header.innerHTML = `
        <div class="library-title">Моя библиотека</div>
        <button class="upload-track-btn">
            <img src="assets/Name=Add, Filled=No.svg" alt=""> Загрузить трек
        </button>
    `;
    container.appendChild(header);

    header.querySelector('.upload-track-btn').addEventListener('click', () => {
        window.openUploadModal();
    });

    const loader = document.createElement('div');
    loader.className = 'tracks-loader';
    loader.innerHTML = '<div class="loader-spinner"></div><span>Загрузка треков...</span>';
    container.appendChild(loader);

    userTracks = await loadUserTracks();
    window.updatePlayerTracks(userTracks);

    loader.remove();

    const tracks = getTracks();

    if (tracks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'tracks-empty';
        empty.innerHTML = `
            <img src="assets/Name=Library, Filled=No.svg" alt="">
            <p>У вас пока нет треков</p>
            <button class="upload-track-btn">Загрузить первый трек</button>
        `;
        container.appendChild(empty);

        empty.querySelector('.upload-track-btn').addEventListener('click', () => {
            window.openUploadModal();
        });
        return;
    }

    const tracksList = document.createElement('div');
    tracksList.className = 'tracks-list';

    tracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-row';
        trackElement.dataset.index = index;
        trackElement.dataset.trackId = track.id;

        trackElement.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-cover">
                    <img src="${track.image}" alt="${track.title}" loading="lazy">
                </div>
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
            </div>
            <div class="track-author">${track.artist}</div>
            <button class="track-delete-btn" data-id="${track.id}" title="Удалить трек">
                <img src="assets/Name=Close, Filled=No.svg" alt="Удалить">
            </button>
        `;

        tracksList.appendChild(trackElement);
    });

    container.appendChild(tracksList);

    tracksList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.track-delete-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const trackRow = deleteBtn.closest('.track-row');
            const trackId = parseInt(trackRow.dataset.trackId);

            if (confirm('Удалить этот трек?')) {
                trackRow.style.opacity = '0.5';
                const success = await deleteTrack(trackId);
                if (success) {
                    trackRow.remove();
                    userTracks = userTracks.filter(t => t.id !== trackId);
                    window.updatePlayerTracks(userTracks);

                    if (userTracks.length === 0) {
                        renderTracksLibrary();
                    }
                } else {
                    trackRow.style.opacity = '1';
                    alert('Ошибка удаления трека');
                }
            }
            return;
        }

        const trackRow = e.target.closest('.track-row');
        if (trackRow) {
            const index = parseInt(trackRow.dataset.index);
            if (window.playTrack) {
                window.playTrack(index);
            }
        }
    });
}

function showPage(page) {
    setNavCooldown();

    if (page !== homePage) {
        animateSonarHide(() => {
            homePage.style.display = "none";
            libraryPage.style.display = "none";
            page.style.display = "block";

            if (page === libraryPage) {
                renderTracksLibrary();
            }
        });
    } else {
        page.style.display = "block";
        libraryPage.style.display = "none";
        animateSonarShow();
    }
}

homeButton.addEventListener('click', () => showPage(homePage));
libraryButton.addEventListener('click', () => showPage(libraryPage));

window.addEventListener('trackUploaded', () => {
    if (libraryPage.style.display === 'block') {
        renderTracksLibrary();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    homePage.style.display = "block";
    libraryPage.style.display = "none";
});