const homePage = document.querySelector('.main-home-page');
const libraryPage = document.querySelector('.main-favorite-tracks');

const homeButton = document.querySelector('.nav-links__home');
const libraryButton = document.querySelector('.nav-links__library');

const navButtons = [homeButton, libraryButton];
const cooldownTime = 800;

const sonarLetters = [...document.querySelector('.welcome-animated-inner').children];

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
    return window.playerData?.tracks || [];
}

function renderTracksLibrary() {
    const container = libraryPage;
    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'tracks-header';
    
    container.appendChild(header);

    const tracksList = document.createElement('div');
    tracksList.className = 'tracks-list';
    
    const tracks = getTracks();
    
    tracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-row';
        trackElement.dataset.index = index;
        
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
            <div class="track-duration">3:30</div>
        `;
        
        tracksList.appendChild(trackElement);
    });
    
    container.appendChild(tracksList);

    tracksList.addEventListener('click', (e) => {
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

// Привязка кнопок
homeButton.addEventListener('click', () => showPage(homePage));
libraryButton.addEventListener('click', () => showPage(libraryPage));

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    homePage.style.display = "block";
    libraryPage.style.display = "none";
});