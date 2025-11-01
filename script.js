class TikTokLiveViewer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
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
    }

    bindEvents() {
        this.loadBtn.addEventListener('click', () => this.loadLive());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadLive();
            }
        });

        // Auto-load quando colar uma URL
        this.urlInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                const url = this.urlInput.value.trim();
                if (this.isValidTikTokUrl(url)) {
                    this.loadLive();
                }
            }, 100);
        });
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
        // Diferentes padrões de URL do TikTok
        const patterns = [
            /tiktok\.com\/@([\w.-]+)\/live/i,
            /tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i,
            /tiktok\.com\/t\/([\w]+)/i,
            /vm\.tiktok\.com\/([\w]+)/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1] || match[2];
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
        this.loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    }

    showVideo() {
        this.placeholder.style.display = 'none';
        this.loading.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.videoContainer.style.display = 'block';
        this.loadBtn.disabled = false;
        this.loadBtn.innerHTML = '<i class="fas fa-play"></i> Carregar Live';
    }

    showError() {
        this.placeholder.style.display = 'none';
        this.loading.style.display = 'none';
        this.videoContainer.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.loadBtn.disabled = false;
        this.loadBtn.innerHTML = '<i class="fas fa-play"></i> Carregar Live';
    }

    showPlaceholder() {
        this.loading.style.display = 'none';
        this.videoContainer.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.placeholder.style.display = 'block';
        this.loadBtn.disabled = false;
        this.loadBtn.innerHTML = '<i class="fas fa-play"></i> Carregar Live';
    }

    async loadLive() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showNotification('Por favor, insira uma URL do TikTok', 'warning');
            return;
        }

        if (!this.isValidTikTokUrl(url)) {
            this.showNotification('URL do TikTok inválida. Verifique o formato.', 'error');
            return;
        }

        this.showLoading();

        try {
            // Método 1: Tentar embed direto
            await this.tryDirectEmbed(url);
        } catch (error) {
            console.error('Erro ao carregar live:', error);
            
            try {
                // Método 2: Tentar com proxy/alternativa
                await this.tryAlternativeMethod(url);
            } catch (alternativeError) {
                console.error('Erro no método alternativo:', alternativeError);
                this.showError();
                this.showNotification('Não foi possível carregar a live. Verifique se ela ainda está ativa.', 'error');
            }
        }
    }

    async tryDirectEmbed(url) {
        return new Promise((resolve, reject) => {
            // Limpar URL e tentar diferentes formatos
            let embedUrl = this.getEmbedUrl(url);
            
            this.liveFrame.onload = () => {
                setTimeout(() => {
                    try {
                        // Verificar se o iframe carregou conteúdo válido
                        this.showVideo();
                        this.showNotification('Live carregada com sucesso!', 'success');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }, 2000);
            };

            this.liveFrame.onerror = () => {
                reject(new Error('Erro ao carregar iframe'));
            };

            // Timeout para casos onde o onload não dispara
            setTimeout(() => {
                if (this.loading.style.display !== 'none') {
                    reject(new Error('Timeout ao carregar'));
                }
            }, 10000);

            this.liveFrame.src = embedUrl;
        });
    }

    getEmbedUrl(url) {
        // Diferentes estratégias para criar URL de embed
        
        // Se for uma URL de live direta
        if (url.includes('/live')) {
            return url.replace('tiktok.com/', 'tiktok.com/embed/');
        }
        
        // Se for uma URL de vídeo, tentar converter
        if (url.includes('/video/')) {
            return url.replace('tiktok.com/', 'tiktok.com/embed/');
        }
        
        // Para URLs curtas, tentar expandir
        if (url.includes('vm.tiktok.com') || url.includes('/t/')) {
            // Usar a URL original e deixar o TikTok redirecionar
            return `https://www.tiktok.com/embed/v2/?url=${encodeURIComponent(url)}`;
        }
        
        // Fallback: tentar URL direta
        return url;
    }

    async tryAlternativeMethod(url) {
        return new Promise((resolve, reject) => {
            // Método alternativo: usar diferentes domínios de embed
            const alternativeUrls = [
                `https://www.tiktok.com/embed/v2/?url=${encodeURIComponent(url)}`,
                `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
                url.replace('www.tiktok.com', 'm.tiktok.com'),
                url + '?embed=1'
            ];

            let currentIndex = 0;
            
            const tryNext = () => {
                if (currentIndex >= alternativeUrls.length) {
                    reject(new Error('Todos os métodos alternativos falharam'));
                    return;
                }

                const currentUrl = alternativeUrls[currentIndex];
                currentIndex++;

                this.liveFrame.onload = () => {
                    setTimeout(() => {
                        this.showVideo();
                        this.showNotification('Live carregada com método alternativo!', 'success');
                        resolve();
                    }, 1500);
                };

                this.liveFrame.onerror = tryNext;
                this.liveFrame.src = currentUrl;

                // Timeout para tentar próximo método
                setTimeout(() => {
                    if (this.loading.style.display !== 'none') {
                        tryNext();
                    }
                }, 5000);
            };

            tryNext();
        });
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Adicionar estilos da notificação se não existirem
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

        // Remover após 4 segundos
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
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TikTokLiveViewer();
    
    // Adicionar funcionalidade de exemplo
    const examples = [
        'https://www.tiktok.com/@username/live',
        'https://vm.tiktok.com/example123'
    ];
    
    // Adicionar dica de exemplo no placeholder
    const urlInput = document.getElementById('liveUrl');
    let exampleIndex = 0;
    
    setInterval(() => {
        if (!urlInput.value && document.activeElement !== urlInput) {
            urlInput.placeholder = `Exemplo: ${examples[exampleIndex]}`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }
    }, 3000);
});
