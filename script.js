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
        this.qualitySelect = document.getElementById('quality');
        this.viewerCountElement = document.getElementById('viewer-count');
        this.currentQuality = this.qualitySelect?.value || '720p';
    }

    bindEvents() {
        this.loadBtn.addEventListener('click', () => this.loadLive());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadLive();
            }
        });

        this.urlInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                const url = this.urlInput.value.trim();
                if (this.isValidTikTokUrl(url)) {
                    this.loadLive();
                }
            }, 100);
        });

        if (this.qualitySelect) {
            this.qualitySelect.addEventListener('change', () => {
                this.currentQuality = this.qualitySelect.value;
                if (this.liveFrame.src) {
                    this.updateStreamQuality();
                }
            });
        }
    }

    isValidTikTokUrl(url) {
        const tiktokPatterns = [
            /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/live/i,
            /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w]+/i,
            /^https?:\/\/vm\.tiktok\.com\/[\w]+/i,
            /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i
        ];
        return tiktokPatterns.some(pattern => pattern.test(url));
    }

    extractTikTokId(url) {
        const patterns = [
            /tiktok\.com\/@([\w.-]+)\/live/i,
            /tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i,
            /tiktok\.com\/t\/([\w]+)/i,
            /vm\.tiktok\.com\/([\w]+)/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    showLoading() {
        this.placeholder.style.display = 'none';
        this.videoContainer.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.loading.style.display = 'block';
        this.loadBtn.disabled = true;
        this.loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    }

    showVideo() {
        this.placeholder.style.display = 'none';
        this.loading.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.videoContainer.style.display = 'block';
        this.loadBtn.disabled = false;
        this.loadBtn.innerHTML = '<i class="fas fa-play"></i> Charger Live';
    }

    showError() {
        this.placeholder.style.display = 'none';
        this.loading.style.display = 'none';
        this.videoContainer.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.loadBtn.disabled = false;
        this.loadBtn.innerHTML = '<i class="fas fa-play"></i> Charger Live';
    }

    showPlaceholder() {
        this.loading.style.display = 'none';
        this.videoContainer.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.placeholder.style.display = 'block';
        this.loadBtn.disabled = false;
        this.loadBtn.innerHTML = '<i class="fas fa-play"></i> Charger Live';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        if (!document.querySelector('.notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .notification.success { background: #27ae60; }
                .notification.error { background: #e74c3c; }
                .notification.warning { background: #f39c12; }
                .notification.info { background: #3498db; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateStreamQuality() {
        const quality = this.qualitySelect.value;
        let qualityParam;

        switch (quality) {
            case '540p':
                qualityParam = { resolution: '540*960', data_rate: '1' };
                break;
            case '720p':
                qualityParam = { resolution: '720*1280', data_rate: '2' };
                break;
            case '1080p':
                qualityParam = { resolution: '1080*1920', data_rate: '3' };
                break;
            default:
                qualityParam = { resolution: '720*1280', data_rate: '2' };
        }

        const url = new URL(this.liveFrame.src);
        url.searchParams.set('resolution', qualityParam.resolution);
        url.searchParams.set('data_rate', qualityParam.data_rate);

        this.liveFrame.src = url.toString();
    }

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

    startViewerCountUpdates(streamId) {
        if (this.viewerCountInterval) {
            clearInterval(this.viewerCountInterval);
        }

        this.viewerCountInterval = setInterval(async () => {
            const viewerCount = await this.fetchViewerCount(streamId);
            if (this.viewerCountElement) {
                this.viewerCountElement.textContent = `${viewerCount} viewers`;
            }
        }, 5000);
    }

    stopViewerCountUpdates() {
        if (this.viewerCountInterval) {
            clearInterval(this.viewerCountInterval);
            this.viewerCountInterval = null;
        }
    }

    async tryDirectEmbed(url) {
        return new Promise((resolve, reject) => {
            let embedUrl = this.getEmbedUrl(url);

            this.liveFrame.onload = () => {
                setTimeout(() => {
                    try {
                        this.showVideo();
                        this.showNotification('Live chargé avec succès!', 'success');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }, 2000);
            };

            this.liveFrame.onerror = () => {
                reject(new Error('Erreur lors du chargement de l’iframe'));
            };

            setTimeout(() => {
                if (this.loading.style.display !== 'none') {
                    reject(new Error('Timeout lors du chargement'));
                }
            }, 10000);

            this.liveFrame.src = embedUrl;
        });
    }

    getEmbedUrl(url) {
        if (url.includes('/live')) {
            return url.replace('tiktok.com/', 'tiktok.com/embed/');
        }

        if (url.includes('/video/')) {
            return url.replace('tiktok.com/', 'tiktok.com/embed/');
        }

        if (url.includes('vm.tiktok.com') || url.includes('/t/')) {
            return `https://www.tiktok.com/embed/v2/?url=${encodeURIComponent(url)}`;
        }

        return url;
    }

    async tryAlternativeMethod(url) {
        return new Promise((resolve, reject) => {
            const alternativeUrls = [
                `https://www.tiktok.com/embed/v2/?url=${encodeURIComponent(url)}`,
                `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
                url.replace('www.tiktok.com', 'm.tiktok.com'),
                url + '?embed=1'
            ];

            let currentIndex = 0;

            const tryNext = () => {
                if (currentIndex >= alternativeUrls.length) {
                    reject(new Error('Tous les méthodes alternatives ont échoué'));
                    return;
                }

                const currentUrl = alternativeUrls[currentIndex];
                currentIndex++;

                this.liveFrame.onload = () => {
                    setTimeout(() => {
                        this.showVideo();
                        this.showNotification('Live chargé avec méthode alternative!', 'success');
                        resolve();
                    }, 1500);
                };

                this.liveFrame.onerror = tryNext;
                this.liveFrame.src = currentUrl;

                setTimeout(() => {
                    if (this.loading.style.display !== 'none') {
                        tryNext();
                    }
                }, 5000);
            };

            tryNext();
        });
    }

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
            const streamId = this.extractTikTokId(url);
            if (!streamId) {
                throw new Error("Impossible d'extraire l'ID du live.");
            }

            this.startViewerCountUpdates(streamId);
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
}

document.addEventListener('DOMContentLoaded', () => {
    new TikTokLiveViewer();
});
