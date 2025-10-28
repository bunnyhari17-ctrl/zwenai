// Simple Zwen AI Chat
class ZwenAI {
    constructor() {
        this.isTyping = false;
        this.init();
    }

    init() {
        this.setupEvents();
        console.log('Zwen AI Ready!');
    }

    setupEvents() {
        // File upload events
        document.getElementById('fileInput').addEventListener('change', (e) => this.uploadFile(e, 'file'));
        document.getElementById('imageInput').addEventListener('change', (e) => this.uploadFile(e, 'image'));
        document.getElementById('cameraInput').addEventListener('change', (e) => this.uploadFile(e, 'camera'));
        
        // Enter key for chat
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    // File upload function
    uploadFile(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        this.showMessage(`📤 Uploading ${file.name}...`, 'ai');
        
        setTimeout(() => {
            if (type === 'image' || type === 'camera') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.showMessage(`🖼️ Image uploaded: ${file.name}`, 'ai');
                };
                reader.readAsDataURL(file);
            } else {
                this.showMessage(`📄 File uploaded: ${file.name}`, 'ai');
            }
            event.target.value = '';
        }, 1500);
    }

    // Chat function
    sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;

        // Show user message
        this.showMessage(message, 'user');
        input.value = '';

        // Show typing
        this.isTyping = true;
        this.showTyping();

        // AI response
        setTimeout(() => {
            this.hideTyping();
            const response = this.getAIResponse(message);
            this.showMessage(response, 'ai');
            this.isTyping = false;
        }, 1000 + Math.random() * 1000);
    }

    getAIResponse(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('hello') || lower.includes('hi')) {
            return "Hello! 👋 I'm Zwen AI! How can I help you?";
        }
        if (lower.includes('how are you')) {
            return "I'm great! Ready to chat or help with file uploads! 😊";
        }
        if (lower.includes('upload') || lower.includes('file')) {
            return "You can upload files or images using the buttons above! 📁";
        }
        if (lower.includes('thank')) {
            return "You're welcome! 😊";
        }
        if (lower.includes('help')) {
            return "I can:\n• Chat with you\n• Upload files\n• Process images\n• Take photos\nUse the buttons above!";
        }

        const responses = [
            "That's interesting! Tell me more! 😊",
            "I understand! How can I help?",
            "Thanks for sharing! 💫",
            "Great point! What else?",
            "I'm here to help! 🚀"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // UI functions
    showMessage(text, sender) {
        const chat = document.getElementById('chatMessages');
        const msg = document.createElement('div');
        msg.className = `message ${sender}-message`;
        msg.textContent = text;
        chat.appendChild(msg);
        this.scrollToBottom();
    }

    showTyping() {
        const chat = document.getElementById('chatMessages');
        const typing = document.createElement('div');
        typing.className = 'message ai-message';
        typing.id = 'typing';
        typing.textContent = 'Zwen AI is typing...';
        chat.appendChild(typing);
        this.scrollToBottom();
    }

    hideTyping() {
        const typing = document.getElementById('typing');
        if (typing) typing.remove();
    }

    scrollToBottom() {
        const chat = document.getElementById('chatMessages');
        chat.scrollTop = chat.scrollHeight;
    }
}

// Global functions
let ai;

function startApp() {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('chatScreen').style.display = 'block';
    ai = new ZwenAI();
}

function sendMessage() {
    if (ai) ai.sendMessage();
}

function openFileInput(type) {
    if (type === 'file') {
        document.getElementById('fileInput').click();
    } else if (type === 'image') {
        document.getElementById('imageInput').click();
    }
}

function openCamera() {
    document.getElementById('cameraInput').click();
}

function showHelp() {
    if (ai) {
        ai.showMessage(`🆘 Zwen AI Help:
• Upload files: PDF, Word, Text
• Upload images: JPG, PNG
• Take photos with camera
• Chat with AI assistant
Use the buttons above! 🚀`, 'ai');
    }
}