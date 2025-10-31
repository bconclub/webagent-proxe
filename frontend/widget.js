console.log('PROXE Widget Initializing...');

(function() {
  let isOpen = false;
  let messages = [];
  const brandName = 'Wind Chasers';

  // Auto-detect API URL based on current page location
  const API_BASE_URL = window.location.origin;
  const API_CHAT_URL = API_BASE_URL + '/api/chat';
  
  console.log('API URL:', API_CHAT_URL);

  // SVG Icons
  const icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>',
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
      
      const bubble = document.createElement('div');
      bubble.className = 'proxe-message-bubble';
      
      const header = document.createElement('div');
      header.className = 'proxe-message-header';
      
      const avatar = document.createElement('div');
      avatar.className = 'proxe-bubble-avatar';
      avatar.innerHTML = icons.user;
      
      const name = document.createElement('div');
      name.className = 'proxe-message-name';
      name.textContent = brandName;
      
      header.appendChild(avatar);
      header.appendChild(name);
      
      const textDiv = document.createElement('div');
      textDiv.className = 'proxe-message-text';
      textDiv.innerHTML = '<strong>Welcome! 👋</strong><br>How can we help you today?';
      
      bubble.appendChild(header);
      bubble.appendChild(textDiv);
      welcomeMsg.appendChild(bubble);
      msgArea.appendChild(welcomeMsg);
    } else {
      messages.forEach(function(msg) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'proxe-message ' + msg.type;
        
        const bubble = document.createElement('div');
        bubble.className = 'proxe-message-bubble';
        
        const header = document.createElement('div');
        header.className = 'proxe-message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'proxe-bubble-avatar';
        avatar.innerHTML = icons.user;
        
        const name = document.createElement('div');
        name.className = 'proxe-message-name';
        name.textContent = msg.type === 'ai' ? brandName : 'You';
        
        header.appendChild(avatar);
        header.appendChild(name);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'proxe-message-text';
        textDiv.innerHTML = msg.text;
        
        bubble.appendChild(header);
        bubble.appendChild(textDiv);
        msgDiv.appendChild(bubble);
        msgArea.appendChild(msgDiv);
      });
    }

    setTimeout(function() {
      msgArea.scrollTop = msgArea.scrollHeight;
    }, 50);
  }

  function streamText(element, htmlText, speed = 8) {
    let index = 0;
    
    const temp = document.createElement('div');
    temp.innerHTML = htmlText;
    const plainText = temp.textContent || temp.innerText;

    function typeNextChar() {
      if (index < plainText.length) {
        element.innerHTML = htmlText.substring(0, Math.min(index * 5, htmlText.length));
        index++;
        setTimeout(typeNextChar, speed);
      } else {
        element.innerHTML = htmlText;
      }
    }

    typeNextChar();
  }

  // Function to format text response into HTML
  function formatTextToHTML(text) {
    // Split into paragraphs
    let paragraphs = text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);
    
    let formatted = paragraphs.map(para => {
      // Handle bullet points starting with **
      if (para.includes('\n**') || para.startsWith('**')) {
        let items = para.split('\n').filter(line => line.trim());
        let listItems = items.map(item => {
          // Remove ** markers and clean up
          let cleaned = item.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
          // Bold the title if it ends with **
          if (item.includes('**')) {
            let parts = cleaned.split('**');
            if (parts.length > 1) {
              cleaned = '<strong>' + parts[0].trim() + '</strong> ' + parts.slice(1).join(' ').trim();
            }
          }
          return '<li>' + cleaned + '</li>';
        }).join('');
        return '<ul>' + listItems + '</ul>';
      }
      
      // Regular paragraph
      let formatted = para.replace(/\n/g, '<br>');
      
      // Bold text
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Italic text  
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return '<p>' + formatted + '</p>';
    }).join('');
    
    return formatted;
  }

  // Centralized handler for quick button clicks
  function handleQuickButtonClick(promptText) {
    console.log('Quick button clicked:', promptText);
    
    // Add user message
    messages.push({ type: 'user', text: promptText });
    
    // Add skeleton loader with header
    messages.push({ 
      type: 'ai', 
      text: '<div class="proxe-skeleton-loader"><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div></div>',
      isLoading: true
    });
    
    // Open chat
    isOpen = true;
    createWidget();
    
    // Send to API
    fetch(API_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: promptText })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log('API Response:', data);
      // Remove skeleton loader
      messages.pop();
      // Add AI response (already formatted as HTML from server)
      messages.push({ type: 'ai', text: data.response });
      renderMessages();
      
      // Stream the response
      const lastBubble = document.querySelectorAll('.proxe-message-bubble')[document.querySelectorAll('.proxe-message-bubble').length - 1];
      streamText(lastBubble, data.response, 8);
    })
    .catch(function(err) {
      console.error('API Error:', err);
      messages.pop();
      messages.push({ type: 'ai', text: 'Sorry, error connecting to server.' });
      renderMessages();
    });
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
      const searchbarWrapper = document.createElement('div');
      searchbarWrapper.id = 'proxe-searchbar-wrapper';
      searchbarWrapper.className = 'proxe-searchbar-mobile';

      const searchbar = document.createElement('div');
      searchbar.className = 'proxe-searchbar';
      
      // Click searchbar to open chat if messages exist
      searchbar.addEventListener('click', function() {
        if (messages.length > 0) {
          isOpen = true;
          createWidget();
        }
      });

      const searchIcon = document.createElement('div');
      searchIcon.className = 'proxe-search-icon';
      searchIcon.innerHTML = icons.search;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'proxe-search-input';
      input.placeholder = 'Ask me anything...';
      input.id = 'proxe-searchbar-input';
      input.autocomplete = 'off';

      // Quick buttons wrapper
      const quickButtonsWrapper = document.createElement('div');
      quickButtonsWrapper.className = 'proxe-quick-buttons';
      quickButtonsWrapper.style.display = 'none';
      
      // Desktop drag-to-scroll
      let isDown = false;
      let startX;
      let scrollLeft;
      
      quickButtonsWrapper.addEventListener('mousedown', function(e) {
        isDown = true;
        startX = e.pageX - quickButtonsWrapper.offsetLeft;
        scrollLeft = quickButtonsWrapper.scrollLeft;
        e.preventDefault(); // Prevent input from losing focus
      });
      
      quickButtonsWrapper.addEventListener('mouseleave', function() {
        isDown = false;
      });
      
      quickButtonsWrapper.addEventListener('mouseup', function() {
        isDown = false;
      });
      
      quickButtonsWrapper.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - quickButtonsWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        quickButtonsWrapper.scrollLeft = scrollLeft - walk;
      });

      // Create buttons with onclick handlers
      const btn1 = document.createElement('button');
      btn1.className = 'proxe-quick-btn';
      btn1.textContent = 'What is Wind Chasers?';
      btn1.type = 'button';
      btn1.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleQuickButtonClick('What is Wind Chasers?');
      };

      const btn2 = document.createElement('button');
      btn2.className = 'proxe-quick-btn';
      btn2.textContent = 'What courses are offered?';
      btn2.type = 'button';
      btn2.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleQuickButtonClick('What courses are offered?');
      };

      const btn3 = document.createElement('button');
      btn3.className = 'proxe-quick-btn';
      btn3.textContent = 'How to start my pilot journey?';
      btn3.type = 'button';
      btn3.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleQuickButtonClick('How to start my pilot journey?');
      };

      quickButtonsWrapper.appendChild(btn1);
      quickButtonsWrapper.appendChild(btn2);
      quickButtonsWrapper.appendChild(btn3);

      // Show buttons on search focus
      input.addEventListener('focus', function() {
        if (messages.length > 0) {
          isOpen = true;
          createWidget();
          return;
        }
        quickButtonsWrapper.style.display = 'flex';
        searchbarWrapper.classList.add('proxe-expanded-mobile');
      });

      // Hide buttons on blur if empty
      input.addEventListener('blur', function() {
        setTimeout(function() {
          if (!input.value.trim() && !isDown) {
            quickButtonsWrapper.style.display = 'none';
            searchbarWrapper.classList.remove('proxe-expanded-mobile');
          }
        }, 200); // Delay to allow button click to register
      });

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && input.value.trim()) {
          messages.push({ type: 'user', text: input.value });
          const userMessage = input.value;
          input.value = '';
          isOpen = true;
          
          messages.push({ 
            type: 'ai', 
            text: '<div class="proxe-skeleton-loader"><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div></div>',
            isLoading: true
          });
          createWidget();
          
          fetch(API_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            messages.pop();
            messages.push({ type: 'ai', text: data.response });
            renderMessages();
            
            const lastBubble = document.querySelectorAll('.proxe-message-text');
            streamText(lastBubble[lastBubble.length - 1], data.response, 8);
          })
          .catch(function(err) {
            console.error('Error:', err);
            messages.pop();
            messages.push({ type: 'ai', text: 'Sorry, error connecting to server.' });
            renderMessages();
          });
        }
      });

      searchbar.appendChild(searchIcon);
      searchbar.appendChild(input);

      searchbarWrapper.appendChild(quickButtonsWrapper);
      searchbarWrapper.appendChild(searchbar);
      container.appendChild(searchbarWrapper);

    } else {
      const chatbox = document.createElement('div');
      chatbox.id = 'proxe-chatbox';
      chatbox.className = 'proxe-chatbox-expanded';

      const header = document.createElement('div');
      header.className = 'proxe-chat-header';

      const brandNameEl = document.createElement('div');
      brandNameEl.className = 'proxe-brand-name';
      
      const headerAvatar = document.createElement('div');
      headerAvatar.className = 'proxe-header-avatar';
      headerAvatar.innerHTML = icons.user;
      
      const brandText = document.createElement('span');
      brandText.textContent = brandName;
      
      brandNameEl.appendChild(headerAvatar);
      brandNameEl.appendChild(brandText);

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

      const messagesArea = document.createElement('div');
      messagesArea.className = 'proxe-messages-area';
      chatbox.appendChild(messagesArea);

      const inputArea = document.createElement('div');
      inputArea.className = 'proxe-input-area';

      const chatInput = document.createElement('input');
      chatInput.type = 'text';
      chatInput.className = 'proxe-chat-input';
      chatInput.placeholder = 'Type your message...';

      const sendBtn = document.createElement('button');
      sendBtn.className = 'proxe-send-btn';
      sendBtn.innerHTML = icons.send;

      const handleSend = function() {
        if (!chatInput.value.trim()) return;
        messages.push({ type: 'user', text: chatInput.value });
        const userMessage = chatInput.value;
        chatInput.value = '';
        renderMessages();

        messages.push({ 
          type: 'ai', 
          text: '<div class="proxe-skeleton-loader"><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div></div>',
          isLoading: true
        });
        renderMessages();

        fetch(API_CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          messages.pop();
          messages.push({ type: 'ai', text: data.response });
          renderMessages();
          
          const lastBubble = document.querySelectorAll('.proxe-message-text');
          streamText(lastBubble[lastBubble.length - 1], data.response, 8);
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

      const footer = document.createElement('div');
      footer.className = 'proxe-footer';
      
      const footerLink = document.createElement('a');
      footerLink.href = 'https://goproxe.com';
      footerLink.target = '_blank';
      footerLink.className = 'proxe-footer-link';
      footerLink.innerHTML = 'Chat powered by PROXe';
      
      footer.appendChild(footerLink);
      chatbox.appendChild(footer);

      container.appendChild(chatbox);
      
      renderMessages();

      setTimeout(function() {
        chatInput.focus();
      }, 100);
    }
  }

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