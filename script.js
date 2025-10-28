// === ZWEN AI APPLICATION ===
class ZwenAI {
    constructor() {
        this.conversationHistory = [];
        this.isProcessing = false;
        this.currentUser = null;
        this.uploadOptionsVisible = false;
        this.sidebarVisible = false;
        this.chats = [];
        this.currentChatId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChats();
        this.createNewChat(true);
        console.log('Zwen AI initialized! 🤖');
    }

    setupEventListeners() {
        // File input events - FIXED: Proper event binding
        const fileInput = document.getElementById('fileInput');
        const imageInput = document.getElementById('imageInput');
        const cameraInput = document.getElementById('cameraInput');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'file');
            });
        }
        
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'image');
            });
        }
        
        if (cameraInput) {
            cameraInput.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'camera');
            });
        }

        // Enter key for sending messages
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Close sidebar when clicking overlay
        document.getElementById('overlay').addEventListener('click', () => {
            this.hideAllOverlays();
        });
    }

    // === UPLOAD OPTIONS FUNCTIONS ===
    toggleUploadOptions() {
        if (this.uploadOptionsVisible) {
            this.hideUploadOptions();
        } else {
            this.showUploadOptions();
        }
    }

    showUploadOptions() {
        const uploadOptions = document.getElementById('uploadOptions');
        const plusBtn = document.getElementById('plusUploadBtn');
        const overlay = document.getElementById('overlay');
        
        if (uploadOptions && plusBtn && overlay) {
            uploadOptions.style.display = 'block';
            plusBtn.classList.add('active');
            overlay.style.display = 'block';
            this.uploadOptionsVisible = true;
        }
    }

    hideUploadOptions() {
        const uploadOptions = document.getElementById('uploadOptions');
        const plusBtn = document.getElementById('plusUploadBtn');
        const overlay = document.getElementById('overlay');
        
        if (uploadOptions && plusBtn) {
            uploadOptions.style.display = 'none';
            plusBtn.classList.remove('active');
            this.uploadOptionsVisible = false;
        }
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // === FILE UPLOAD FUNCTIONS - FIXED ===
    openFileInput(type) {
        this.hideUploadOptions();
        
        console.log('Opening file input for:', type);
        
        try {
            if (type === 'file') {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                } else {
                    console.error('File input not found');
                }
            } else if (type === 'image') {
                const imageInput = document.getElementById('imageInput');
                if (imageInput) {
                    imageInput.click();
                } else {
                    console.error('Image input not found');
                }
            }
        } catch (error) {
            console.error('Error opening file input:', error);
            this.showNotification('Error accessing file system', 'error');
        }
    }

    openCamera() {
        this.hideUploadOptions();
        
        console.log('Opening camera...');
        
        try {
            const cameraInput = document.getElementById('cameraInput');
            if (cameraInput) {
                cameraInput.click();
            } else {
                console.error('Camera input not found');
                this.showNotification('Camera not available', 'error');
            }
        } catch (error) {
            console.error('Error opening camera:', error);
            this.showNotification('Error accessing camera', 'error');
        }
    }

    handleFileUpload(event, type) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name, 'Type:', type, 'Size:', file.size);

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showNotification('File size too large. Maximum size is 10MB.', 'error');
            event.target.value = '';
            return;
        }

        // Show upload progress
        this.showUploadProgress(file.name, type);

        // Process file after delay
        setTimeout(() => {
            this.displayUploadedFile(file, type);
            event.target.value = ''; // Reset input
        }, 1500);
    }

    showUploadProgress(fileName, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const progressMsg = document.createElement('div');
        progressMsg.className = 'message ai-message';
        progressMsg.innerHTML = `
            <div class="upload-progress">
                📤 Uploading ${type}: ${this.escapeHtml(fileName)}...
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(progressMsg);
        this.scrollToBottom();

        // Animate progress bar
        setTimeout(() => {
            const progressFill = progressMsg.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
        }, 100);
    }

    displayUploadedFile(file, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const fileMessage = document.createElement('div');
        fileMessage.className = 'file-message';

        if (type === 'image' || type === 'camera') {
            // Handle images
            const reader = new FileReader();
            reader.onload = (e) => {
                fileMessage.innerHTML = `
                    <div class="file-info">
                        <div class="file-icon">🖼️</div>
                        <div class="file-details">
                            <h4>${this.escapeHtml(file.name)}</h4>
                            <p>${this.formatFileSize(file.size)} • ${type === 'camera' ? 'Camera Photo' : 'Image'} • ${file.type}</p>
                            <img src="${e.target.result}" class="image-preview" alt="Uploaded Image">
                            <p>✅ ${type === 'camera' ? 'Photo' : 'Image'} uploaded successfully!</p>
                        </div>
                    </div>
                `;
                chatMessages.appendChild(fileMessage);
                this.scrollToBottom();
            };
            reader.onerror = () => {
                this.showNotification('Error reading image file', 'error');
            };
            reader.readAsDataURL(file);
        } else {
            // Handle documents
            const fileExtension = file.name.split('.').pop().toUpperCase();
            fileMessage.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">📄</div>
                    <div class="file-details">
                        <h4>${this.escapeHtml(file.name)}</h4>
                        <p>${this.formatFileSize(file.size)} • ${fileExtension} File • ${file.type || 'Unknown Type'}</p>
                        <p>✅ File uploaded successfully! I can help you analyze this document.</p>
                    </div>
                </div>
            `;
            chatMessages.appendChild(fileMessage);
            this.scrollToBottom();
        }

        // AI response about uploaded file
        setTimeout(() => {
            this.addMessage(
                `I've successfully processed your ${type === 'camera' ? 'photo' : type === 'image' ? 'image' : 'file'}! ` +
                `You can now ask me questions about it or request analysis! 📁✨`,
                'ai'
            );
        }, 500);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // === CHAT MANAGEMENT ===
    createNewChat(isInitial = false) {
        const chatId = 'chat_' + Date.now();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.chats.unshift(newChat);
        this.currentChatId = chatId;
        
        this.saveChats();
        this.renderChatList();
        this.renderCurrentChat();
        
        if (!isInitial) {
            this.addMessage("Hello! I'm Zwen AI! How can I help you today? 😊", 'ai');
        }
        
        const currentChatTitle = document.getElementById('currentChatTitle');
        if (currentChatTitle) {
            currentChatTitle.textContent = 'New Chat';
        }
        
        this.hideSidebar();
    }

    addMessage(content, sender) {
        this.addMessageToDOM(content, sender);
        
        // Save to current chat
        if (this.currentChatId) {
            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (chat) {
                chat.messages.push({
                    content: content,
                    sender: sender,
                    timestamp: new Date().toISOString()
                });
                chat.updatedAt = new Date().toISOString();
                this.saveChats();
                this.renderChatList();
            }
        }
    }

    addMessageToDOM(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = content;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // === UTILITY FUNCTIONS ===
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // === DATA PERSISTENCE ===
    saveChats() {
        try {
            localStorage.setItem('zwenAI_chats', JSON.stringify(this.chats));
            localStorage.setItem('zwenAI_currentChatId', this.currentChatId);
        } catch (error) {
            console.warn('Could not save data to localStorage:', error);
        }
    }

    loadChats() {
        try {
            const savedChats = localStorage.getItem('zwenAI_chats');
            const savedCurrentChatId = localStorage.getItem('zwenAI_currentChatId');
            
            if (savedChats) {
                this.chats = JSON.parse(savedChats);
            }
            
            if (savedCurrentChatId) {
                this.currentChatId = savedCurrentChatId;
            }
        } catch (error) {
            console.warn('Could not load data from localStorage:', error);
        }
    }

    // ... (other methods remain the same)
}

// === GLOBAL FUNCTIONS ===
const zwenAI = new ZwenAI();

function startApp() {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('chatScreen').style.display = 'block';
}

function toggleUploadOptions() {
    zwenAI.toggleUploadOptions();
}

function openFileInput(type) {
    zwenAI.openFileInput(type);
}

function openCamera() {
    zwenAI.openCamera();
}

function sendMessage() {
    zwenAI.sendMessage();
}

// Add the missing CSS for upload progress
const uploadStyles = `
    .upload-progress {
        background: #4CAF50;
        color: white;
        padding: 12px 15px;
        border-radius: 10px;
        font-size: 0.9em;
        margin-top: 5px;
        display: inline-block;
    }
    
    .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: white;
        width: 0%;
        transition: width 1.5s ease-in-out;
        border-radius: 2px;
    }
    
    .file-message {
        background: #e3f2fd;
        border: 1px solid #bbdefb;
        padding: 20px;
        border-radius: 15px;
        margin: 15px 0;
    }
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .file-icon {
        font-size: 2em;
    }
    
    .file-details h4 {
        margin: 0;
        color: #1565c0;
        font-size: 1.1em;
    }
    
    .file-details p {
        margin: 5px 0;
        color: #666;
        font-size: 0.9em;
    }
    
    .image-preview {
        max-width: 250px;
        border-radius: 10px;
        margin: 10px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
`;

// Inject the styles
const styleSheet = document.createElement('style');
styleSheet.textContent = uploadStyles;
document.head.appendChild(styleSheet);