console.log('PROXE Widget Initializing...');

(function() {
  let isOpen = false;
  let messages = [];
  const brandName = 'Wind Chasers';

  // SVG Icons
  const icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    user: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 3-8 3v7h16v-7s-2-3-8-3z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64M3.51 15A9 9 0 0 0 18.36 18.36"></path></svg>'
  };

  function loadCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/widget.css';
    document.head.appendChild(link);
  }

  function renderMessages() {
    const msgArea = document.querySelector('.proxe-messages-area');
    if (!msgArea) return;

    msgArea.innerHTML = '';

    if (messages.length === 0) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.className = 'proxe-message ai';
      
      const avatar = document.createElement('div');
      avatar.className = 'proxe-avatar';
      avatar.innerHTML = icons.user;
      
      const bubble = document.createElement('div');
      bubble.className = 'proxe-message-bubble';
      bubble.innerHTML = '<strong>Welcome! 👋</strong><br>How can we help you today?';
      
      welcomeMsg.appendChild(avatar);
      welcomeMsg.appendChild(bubble);
      msgArea.appendChild(welcomeMsg);
    } else {
      messages.forEach(function(msg) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'proxe-message ' + msg.type;
        
        if (msg.type === 'ai') {
          const avatar = document.createElement('div');
          avatar.className = 'proxe-avatar';
          avatar.innerHTML = icons.user;
          msgDiv.appendChild(avatar);
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'proxe-message-bubble';
        bubble.innerHTML = msg.text;
        msgDiv.appendChild(bubble);
        msgArea.appendChild(msgDiv);
      });
    }

    // Scroll to bottom
    setTimeout(function() {
      msgArea.scrollTop = msgArea.scrollHeight;
    }, 50);
  }

  function streamText(element, htmlText, speed = 8) {
    let index = 0;
    
    // Parse HTML into chunks to display progressively
    const temp = document.createElement('div');
    temp.innerHTML = htmlText;
    const plainText = temp.textContent || temp.innerText;

    function typeNextChar() {
      if (index < plainText.length) {
        // Show partial text with HTML formatting applied
        element.innerHTML = htmlText.substring(0, Math.min(index * 5, htmlText.length));
        index++;
        setTimeout(typeNextChar, speed);
      } else {
        // When done, show the full HTML
        element.innerHTML = htmlText;
      }
    }

    typeNextChar();
  }

  function createWidget() {
    let container = document.getElementById('proxe-widget-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'proxe-widget-container';
      document.body.appendChild(container);
    }

    container.innerHTML = '';

    if (!isOpen) {
      // Searchbar wrapper - collapsed view
      const searchbarWrapper = document.createElement('div');
      searchbarWrapper.id = 'proxe-searchbar-wrapper';

      const searchbar = document.createElement('div');
      searchbar.className = 'proxe-searchbar';

      const searchIcon = document.createElement('div');
      searchIcon.className = 'proxe-search-icon';
      searchIcon.innerHTML = icons.search;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'proxe-search-input';
      input.placeholder = 'Ask me anything...';
      input.id = 'proxe-searchbar-input';
      
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && input.value.trim()) {
          messages.push({ type: 'user', text: input.value });
          const userMessage = input.value;
          input.value = '';
          isOpen = true;
          createWidget();
          
          fetch('http://127.0.0.1:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            messages.push({ type: 'ai', text: data.response, isStreaming: true });
            renderMessages();
            
            // Stream the text
            const lastBubble = document.querySelectorAll('.proxe-message-bubble')[document.querySelectorAll('.proxe-message-bubble').length - 1];
            streamText(lastBubble, data.response, 8);
          })
          .catch(function(err) {
            console.error('Error:', err);
            messages.push({ type: 'ai', text: 'Sorry, error connecting to server.' });
            renderMessages();
          });
        }
      });

      searchbar.appendChild(searchIcon);
      searchbar.appendChild(input);

      searchbar.addEventListener('click', function() {
        input.focus();
      });

      searchbarWrapper.appendChild(searchbar);
      container.appendChild(searchbarWrapper);
    } else {
      // Expanded chat view
      const chatbox = document.createElement('div');
      chatbox.id = 'proxe-chatbox';
      chatbox.className = 'proxe-chatbox-expanded';

      // Header
      const header = document.createElement('div');
      header.className = 'proxe-chat-header';

      const brandNameEl = document.createElement('div');
      brandNameEl.className = 'proxe-brand-name';
      brandNameEl.textContent = brandName;

      const headerActions = document.createElement('div');
      headerActions.className = 'proxe-header-actions';

      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'proxe-header-btn';
      settingsBtn.innerHTML = icons.user;

      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'proxe-header-btn';
      refreshBtn.innerHTML = icons.refresh;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'proxe-header-btn proxe-close-btn';
      closeBtn.innerHTML = icons.close;
      closeBtn.addEventListener('click', function() {
        isOpen = false;
        const container = document.getElementById('proxe-widget-container');
        if (container) container.remove();
        createWidget();
      });

      headerActions.appendChild(settingsBtn);
      headerActions.appendChild(refreshBtn);
      headerActions.appendChild(closeBtn);

      header.appendChild(brandNameEl);
      header.appendChild(headerActions);
      chatbox.appendChild(header);

      // Messages area
      const messagesArea = document.createElement('div');
      messagesArea.className = 'proxe-messages-area';
      chatbox.appendChild(messagesArea);

      // Input area
      const inputArea = document.createElement('div');
      inputArea.className = 'proxe-input-area';

      const chatInput = document.createElement('input');
      chatInput.type = 'text';
      chatInput.className = 'proxe-chat-input';
      chatInput.placeholder = 'Type your message...';

      const sendBtn = document.createElement('button');
      sendBtn.className = 'proxe-send-btn';
      sendBtn.innerHTML = icons.phone;

      const handleSend = function() {
        if (!chatInput.value.trim()) return;
        messages.push({ type: 'user', text: chatInput.value });
        const userMessage = chatInput.value;
        chatInput.value = '';
        renderMessages();

        // Add typing indicator
        messages.push({ type: 'ai', text: '<div class="proxe-typing"><span></span><span></span><span></span></div>' });
        renderMessages();

        fetch('http://127.0.0.1:3000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          // Remove typing indicator
          messages.pop();
          messages.push({ type: 'ai', text: data.response });
          renderMessages();
          
          // Stream the text
          const lastBubble = document.querySelectorAll('.proxe-message-bubble')[document.querySelectorAll('.proxe-message-bubble').length - 1];
          streamText(lastBubble, data.response, 8);
        })
        .catch(function(err) {
          console.error('Error:', err);
          messages.pop();
          messages.push({ type: 'ai', text: 'Sorry, error connecting to server.' });
          renderMessages();
        });
      };

      sendBtn.addEventListener('click', handleSend);
      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSend();
      });

      inputArea.appendChild(chatInput);
      inputArea.appendChild(sendBtn);
      chatbox.appendChild(inputArea);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'proxe-footer';
      
      const footerLink = document.createElement('a');
      footerLink.href = '#';
      footerLink.className = 'proxe-footer-link';
      footerLink.innerHTML = '💬 Add AI chat to your site';
      
      footer.appendChild(footerLink);
      chatbox.appendChild(footer);

      container.appendChild(chatbox);
      
      // Render initial messages
      renderMessages();

      setTimeout(function() {
        chatInput.focus();
      }, 100);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadCSS();
      createWidget();
    });
  } else {
    loadCSS();
    createWidget();
  }

  window.PROXE = { 
    openChat: function() { 
      isOpen = true; 
      createWidget(); 
    }, 
    closeChat: function() {
      isOpen = false;
      const container = document.getElementById('proxe-widget-container');
      if (container) container.remove();
      createWidget();
    }
  };
})();