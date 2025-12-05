const DB_NAME = 'MusicOpenDB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

let db = null;

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }
        };
    });
}

export async function loadUserTracks() {
    try {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const tracks = request.result.map(track => ({
                    ...track,
                    src: URL.createObjectURL(track.audioBlob)
                }));
                resolve(tracks.reverse());
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        return [];
    }
}

export async function deleteTrack(trackId) {
    try {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(trackId);

            request.onsuccess = () => {
                window.dispatchEvent(new CustomEvent('trackDeleted', { detail: { trackId } }));
                resolve(true);
            };
            request.onerror = () => reject(false);
        });
    } catch (error) {
        return false;
    }
}

async function addTrack(trackData) {
    try {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(trackData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        throw error;
    }
}

const uploadOverlay = document.getElementById('upload-overlay');
const closeUploadBtn = document.getElementById('close-upload');
const trackTitleInput = document.getElementById('track-title');
const trackArtistInput = document.getElementById('track-artist');
const trackFileInput = document.getElementById('track-file');
const fileNameSpan = document.getElementById('file-name');
const uploadBtn = document.getElementById('upload-btn');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

trackFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameSpan.textContent = file.name;
    } else {
        fileNameSpan.textContent = 'Выберите MP3 файл';
    }
});

closeUploadBtn?.addEventListener('click', () => {
    closeUploadModal();
});

uploadOverlay?.addEventListener('click', (e) => {
    if (e.target === uploadOverlay) {
        closeUploadModal();
    }
});

uploadBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Upload button clicked!');

    const title = trackTitleInput.value.trim();
    const artist = trackArtistInput.value.trim();
    const file = trackFileInput.files[0];

    if (!title) {
        alert('Введите название трека');
        return;
    }
    if (!artist) {
        alert('Введите исполнителя');
        return;
    }
    if (!file) {
        alert('Выберите MP3 файл');
        return;
    }
    if (!file.type.includes('audio')) {
        alert('Выберите аудио файл (MP3)');
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        alert('Файл слишком большой (максимум 50MB)');
        return;
    }

    uploadBtn.disabled = true;
    uploadProgress.style.display = 'flex';
    progressBar.style.width = '50%';
    progressText.textContent = '50%';

    try {
        const trackData = {
            title: title,
            artist: artist,
            audioBlob: file,
            image: 'assets/Name=Discover, Filled=Yes.svg',
            uploadedAt: new Date().toISOString()
        };

        await addTrack(trackData);

        progressBar.style.width = '100%';
        progressText.textContent = '100%';

        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('trackUploaded', { detail: trackData }));
            closeUploadModal();
            resetUploadForm();
        }, 300);

    } catch (error) {
        alert('Ошибка сохранения: ' + error.message);
        resetUploadForm();
    }
});

window.openUploadModal = function () {
    uploadOverlay.classList.add('active');
};

function closeUploadModal() {
    uploadOverlay.classList.remove('active');
    resetUploadForm();
}

function resetUploadForm() {
    trackTitleInput.value = '';
    trackArtistInput.value = '';
    trackFileInput.value = '';
    fileNameSpan.textContent = 'Выберите MP3 файл';
    uploadBtn.disabled = false;
    uploadProgress.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

openDatabase();
