class TikTokLiveViewer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.viewerCountInterval = null;
    }

    initializeElements() {
        this.urlInput = document.getElementById('liveUrl');
        this.loadBtn = document.getElementById('loadLive');
        this.videoSection = document.getElementById('videoSection');
        this.videoContainer = document.getElementById('videoContainer');
        this.liveFrame = document.getElementById('liveFrame');
        this.placeholder = document.getElementById('placeholder');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');

        // Nouveaux éléments pour la qualité et le nombre de viewers
        this.qualitySelect = document.getElementById('quality');
        this.viewerCountElement = document.getElementById('viewer-count');

        // Initialisation de la qualité
        this.currentQuality = this.qualitySelect?.value || 'medium';
    }

    bindEvents() {
        this.loadBtn.addEventListener('click', () => this.loadLive());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadLive();
            }
        });

        // Auto-load après collage d'une URL
        this.urlInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                const url = this.urlInput.value.trim();
                if (this.isValidTikTokUrl(url)) {
                    this.loadLive();
                }
            }, 100);
        });

        // Écouteur pour le changement de qualité
        if (this.qualitySelect) {
            this.qualitySelect.addEventListener('change', () => {
                this.currentQuality = this.qualitySelect.value;
                if (this.liveFrame.src) {
                    this.updateStreamQuality();
                }
            });
        }
    }

    // Met à jour la qualité du flux
    updateStreamQuality() {
        const url = new URL(this.liveFrame.src);
        const qualityParams = {
            low: { resolution: '540*960', data_rate: '1' },
            medium: { resolution: '720*1280', data_rate: '2' },
            high: { resolution: '1080*1920', data_rate: '3' }
        };

        // Met à jour les paramètres de qualité
        url.searchParams.set('resolution', qualityParams[this.currentQuality].resolution);
        url.searchParams.set('data_rate', qualityParams[this.currentQuality].data_rate);

        // Recharge le flux
        this.liveFrame.src = url.toString();
    }

    // Récupère le nombre de viewers
    async fetchViewerCount(streamId) {
        try {
            const response = await fetch(`https://webcast.immomo.com/webcast/room/reverse_info/?room_id=${streamId}`);
            const data = await response.json();
            return data.data.user_count || 0;
        } catch (error) {
            console.error("Erreur lors de la récupération du nombre de viewers :", error);
            return 0;
        }
    }

    // Actualise le nombre de viewers
    startViewerCountUpdates(streamId) {
        if (this.viewerCountInterval) {
            clearInterval(this.viewerCountInterval);
        }

        this.viewerCountInterval = setInterval(async () => {
            const viewerCount = await this.fetchViewerCount(streamId);
            if (this.viewerCountElement) {
                this.viewerCountElement.textContent = `${viewerCount} viewers`;
            }
        }, 5000); // Actualisation toutes les 5 secondes
    }

    // Arrête l'actualisation du nombre de viewers
    stopViewerCountUpdates() {
        if (this.viewerCountInterval) {
            clearInterval(this.viewerCountInterval);
            this.viewerCountInterval = null;
        }
    }

    // ... (le reste de tes méthodes existantes : isValidTikTokUrl, extractTikTokId, showLoading, showVideo, etc.)
    // (Conserve toutes tes méthodes existantes sans modification)

    async loadLive() {
        const url = this.urlInput.value.trim();

        if (!url) {
            this.showNotification('Veuillez entrer une URL TikTok', 'warning');
            return;
        }

        if (!this.isValidTikTokUrl(url)) {
            this.showNotification('URL TikTok invalide. Vérifiez le format.', 'error');
            return;
        }

        this.showLoading();

        try {
            // Extraire l'ID du live
            const streamId = this.extractTikTokId(url);
            if (!streamId) {
                throw new Error("Impossible d'extraire l'ID du live.");
            }

            // Démarrer l'actualisation du nombre de viewers
            this.startViewerCountUpdates(streamId);

            // Charger le live
            await this.tryDirectEmbed(url);
        } catch (error) {
            console.error('Erreur lors du chargement du live:', error);
            this.stopViewerCountUpdates();

            try {
                await this.tryAlternativeMethod(url);
            } catch (alternativeError) {
                console.error('Erreur avec la méthode alternative:', alternativeError);
                this.showError();
                this.showNotification('Impossible de charger le live. Vérifiez qu\'il est toujours actif.', 'error');
            }
        }
    }

    // ... (le reste de tes méthodes existantes)
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter les éléments pour la qualité et le nombre de viewers dans le HTML si nécessaire
    const videoSection = document.getElementById('videoSection');
    if (videoSection) {
        const qualitySelectHTML = `
            <label for="quality">Qualité :</label>
            <select id="quality">
                <option value="low">Basse</option>
                <option value="medium" selected>Moyenne</option>
                <option value="high">Haute</option>
            </select>
        `;
        const viewerCountHTML = `
            <p>Nombre de viewers : <span id="viewer-count">0</span></p>
        `;
        videoSection.insertAdjacentHTML('afterbegin', qualitySelectHTML);
        videoSection.insertAdjacentHTML('beforeend', viewerCountHTML);
    }

    new TikTokLiveViewer();
});
