// Advanced StoryCompliment AI Application
class StoryComplimentAI {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('complimentHistory')) || [];
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderHistory();
        this.setupTouchFeedback();
    }
    
    bindEvents() {
        // DOM Elements
        this.mediaInput = document.getElementById('mediaInput');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.mediaPreview = document.getElementById('mediaPreview');
        this.previewImage = document.getElementById('previewImage');
        this.videoPreview = document.getElementById('videoPreview');
        this.removeMedia = document.getElementById('removeMedia');
        this.shareBtn = document.getElementById('shareBtn');
        this.closeComplimentBtn = document.getElementById('closeComplimentBtn');
        this.cameraBtn = document.getElementById('cameraBtn');
        this.complimentMode = document.getElementById('complimentMode');
        this.languageSelect = document.getElementById('languageSelect');
        this.storyText = document.getElementById('storyText');
        
        // Event Listeners
        this.uploadPlaceholder.addEventListener('click', () => this.mediaInput.click());
        this.mediaInput.addEventListener('change', (e) => this.handleMediaUpload(e));
        this.removeMedia.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeMediaUpload();
        });
        this.shareBtn.addEventListener('click', () => this.generateCompliment());
        this.closeComplimentBtn.addEventListener('click', () => this.closeCompliment());
        this.cameraBtn.addEventListener('click', () => this.mediaInput.click());
        
        // Touch feedback
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', this.handleTouchStart);
            button.addEventListener('touchend', this.handleTouchEnd);
        });
    }
    
    setupTouchFeedback() {
        // Add touch feedback for better mobile experience
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) {
                e.target.closest('button').classList.add('touch-active');
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('button')) {
                e.target.closest('button').classList.remove('touch-active');
            }
        });
    }
    
    handleTouchStart(e) {
        e.target.classList.add('touch-active');
    }
    
    handleTouchEnd(e) {
        e.target.classList.remove('touch-active');
    }
    
    handleMediaUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit. Please choose a smaller file.');
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert('Please upload an image or video file.');
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                this.previewImage.src = e.target.result;
                this.previewImage.style.display = 'block';
                this.videoPreview.style.display = 'none';
            } else {
                this.previewImage.style.display = 'none';
                this.videoPreview.style.display = 'block';
            }
            
            this.uploadPlaceholder.style.display = 'none';
            this.mediaPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    removeMediaUpload() {
        this.mediaInput.value = '';
        this.uploadPlaceholder.style.display = 'block';
        this.mediaPreview.style.display = 'none';
        this.previewImage.style.display = 'none';
        this.videoPreview.style.display = 'none';
    }
    
    async generateCompliment() {
        const storyContent = this.storyText.value.trim();
        const mode = this.complimentMode.value;
        const language = this.languageSelect.value;
        
        // Validate input
        if (!storyContent) {
            alert('Please share your story first!');
            return;
        }
        
        // Show loading state
        document.getElementById('storySection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
        
        try {
            // Prepare request data
            const requestData = {
                story: storyContent,
                mode: mode,
                language: language
            };
            
            // If media is uploaded, add it to the request
            if (this.mediaInput.files.length > 0) {
                const file = this.mediaInput.files[0];
                const reader = new FileReader();
                const mediaData = await new Promise((resolve) => {
                    reader.onload = (e) => {
                        const base64 = e.target.result.split(',')[1];
                        resolve(base64);
                    };
                    reader.readAsDataURL(file);
                });
                
                requestData.media = {
                    data: mediaData,
                    type: file.type
                };
            }
            
            // Call the backend API
            const response = await fetch('/api/compliment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Note: We're not sending the API key from the frontend for security
                    // The backend will use its own environment variable
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store in history
            const historyItem = {
                compliment: data.compliment,
                mode: data.mode || mode,
                language: data.language || language,
                timestamp: new Date().toLocaleString(),
                analysis: data.analysis
            };
            
            this.history.unshift(historyItem);
            // Keep only last 10 items
            if (this.history.length > 10) {
                this.history.pop();
            }
            localStorage.setItem('complimentHistory', JSON.stringify(this.history));
            
            // Display compliment
            this.displayCompliment(data.compliment, data.mode || mode, data.language || language, data.analysis);
            this.renderHistory();
        } catch (error) {
            console.error('Error generating compliment:', error);
            // Show error message
            document.getElementById('loadingSection').style.display = 'none';
            document.getElementById('storySection').style.display = 'block';
            
            // Display more specific error message
            let errorMessage = 'Failed to generate compliment. Please try again.';
            if (error.message) {
                if (error.message.includes('API key')) {
                    errorMessage = 'Invalid API key configuration. Please check the server configuration.';
                } else if (error.message.includes('quota')) {
                    errorMessage = 'API quota exceeded. Please try again later.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            alert(errorMessage);
        }
    }
    
    displayCompliment(compliment, mode, language, analysis) {
        // Hide loading, show compliment
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('complimentSection').style.display = 'block';
        
        // Update compliment text
        document.getElementById('complimentText').textContent = compliment;
        
        // Update analysis if available
        const analysisElement = document.getElementById('complimentAnalysis');
        if (analysis) {
            analysisElement.innerHTML = `
                <div class="analysis-content">
                    <h4>AI Analysis:</h4>
                    <p><strong>Emotion:</strong> ${analysis.emotion || 'Not detected'}</p>
                    <p><strong>Description:</strong> ${analysis.description || 'No description'}</p>
                    <p><strong>Gender:</strong> ${analysis.gender || 'Not identifiable'}</p>
                    <p><strong>Content Type:</strong> ${analysis.contentCategory || 'Mixed'}</p>
                </div>
            `;
            analysisElement.style.display = 'block';
        } else {
            analysisElement.style.display = 'none';
        }
        
        // Update mode tag
        const modeNames = {
            hype: '🔥 Hype Mode',
            care: '🤍 Soft Care',
            friend: '🧸 Best Friend',
            soul: '🌙 Deep Soul',
            auto: '🤖 Auto Select'
        };
        document.getElementById('modeTag').textContent = modeNames[mode];
        
        // Update language tag
        const languageNames = {
            english: '🇺🇸 English',
            hindi: '🇮🇳 Hindi',
            hindlish: '🌐 Hindlish'
        };
        document.getElementById('languageTag').textContent = languageNames[language];
    }
    
    closeCompliment() {
        document.getElementById('complimentSection').style.display = 'none';
        document.getElementById('storySection').style.display = 'block';
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="no-history">No compliments yet. Share a story to get started!</p>';
            return;
        }
        
        let historyHTML = '';
        this.history.forEach(item => {
            const modeNames = {
                hype: 'Hype',
                care: 'Care',
                friend: 'Friend',
                soul: 'Soul',
                auto: 'Auto'
            };
            
            const languageNames = {
                english: 'EN',
                hindi: 'HI',
                hindlish: 'HL'
            };
            
            // Truncate long compliments
            const truncatedCompliment = item.compliment.length > 100 
                ? item.compliment.substring(0, 100) + '...' 
                : item.compliment;
            
            historyHTML += `
                <div class="history-item">
                    <p class="history-compliment">${truncatedCompliment}</p>
                    <div class="history-meta">
                        <span>${modeNames[item.mode]} • ${languageNames[item.language]}</span>
                        <span>${item.timestamp}</span>
                    </div>
                    ${item.analysis ? `
                    <div class="history-analysis">
                        <small>${item.analysis.gender || 'N/A'} • ${item.analysis.contentCategory || 'Mixed'}</small>
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        historyList.innerHTML = historyHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryComplimentAI();
});