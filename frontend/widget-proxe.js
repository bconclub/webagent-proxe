console.log('PROXE Widget Initializing...');

(function() {
  let isOpen = false;
  let messages = [];
  let completedAiMessages = 0;
  let phonePromptShown = false;
  let formShown = false;
  let manualOpen = false; // Track if user manually opened chat
  let userMessageCount = 0; // Track total user messages sent
  let conversationState = 'cold'; // 'cold', 'qualified', 'ready_to_book'
  let userName = null;
  let userPhone = null;
  let painPoint = null;
  let waitingForName = false;
  let waitingForPhone = false;
  const brandName = 'PROXe';
  const brand = 'proxe';

  // Auto-detect API URL based on current page location
  const API_BASE_URL = window.location.origin;
  const API_CHAT_URL = API_BASE_URL + '/api/chat';
  
  console.log('🔍 PROXe Widget - Brand:', brand);
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
    link.href = '/widget-proxe.css';
    document.head.appendChild(link);
  }

  function renderMessages() {
    const msgArea = document.querySelector('.proxe-messages-area');
    if (!msgArea) return;

    msgArea.innerHTML = '';

    if (messages.length === 0 && conversationState === 'cold') {
      // Show opening hook with trigger buttons for PROXe
      const openingMsg = document.createElement('div');
      openingMsg.className = 'proxe-message ai';
      
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
      textDiv.innerHTML = '<p><strong>You\'re answering WhatsApp at 11 PM.</strong></p><p>Not because you want to. Because your customers expect a response.</p><p>Leads are leaving because you can\'t respond in 2 minutes. Content isn\'t posted because you\'re too busy answering messages. You\'re thinking about hiring someone. But really, you need to sleep.</p><p><strong>This is what it looks like when you\'re doing it all alone.</strong></p><p>We got tired of watching business owners drown. So we built PROXe. AI handles the 24/7 stuff. You handle what matters.</p>';
      
      bubble.appendChild(header);
      bubble.appendChild(textDiv);
      openingMsg.appendChild(bubble);
      msgArea.appendChild(openingMsg);
      
      // Add trigger buttons
      const triggerWrapper = document.createElement('div');
      triggerWrapper.className = 'proxe-trigger-buttons';
      
      const triggers = [
        { text: 'Tell me about the WhatsApp agent', painPoint: 'slow-response-messages' },
        { text: 'Tell me about the content engine', painPoint: 'content-creation-time' },
        { text: 'Tell me about the website agent', painPoint: 'lost-leads' },
        { text: 'Is this for me?', painPoint: 'general-qualification' }
      ];
      
      triggers.forEach(function(trigger) {
        const btn = document.createElement('button');
        btn.className = 'proxe-followup-btn';
        btn.type = 'button';
        btn.textContent = trigger.text;
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          painPoint = trigger.painPoint;
          handleQuickButtonClick(trigger.text);
        };
        triggerWrapper.appendChild(btn);
      });
      
      openingMsg.appendChild(triggerWrapper);
    } else {
      messages.forEach(function(msg, index) {
        const msgDiv = document.createElement('div');
        const messageType = msg.type || 'ai';
        msgDiv.className = 'proxe-message ' + messageType;
        msgDiv.dataset.index = index;

        if (msg.variant === 'phone-request') {
          msgDiv.classList.add('proxe-phone-request');
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'proxe-message-bubble';

        if (messageType === 'ai') {
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
          bubble.appendChild(header);
        } else {
          const header = document.createElement('div');
          header.className = 'proxe-message-header';
          
          const name = document.createElement('div');
          name.className = 'proxe-message-name';
          name.textContent = userName || 'You';
          
          const avatar = document.createElement('div');
          avatar.className = 'proxe-bubble-avatar';
          avatar.innerHTML = icons.user;
          
          header.appendChild(name);
          header.appendChild(avatar);
          bubble.appendChild(header);
        }

        const textDiv = document.createElement('div');
        textDiv.className = 'proxe-message-text';
        
        if (msg.isStreaming) {
          const formattedText = formatTextToHTML(msg.text);
          textDiv.innerHTML = formattedText + '<span class="streaming-cursor">▋</span>';
        } else {
          const formattedText = formatTextToHTML(msg.text || '');
          textDiv.innerHTML = formattedText;
        }
        
        bubble.appendChild(textDiv);
        msgDiv.appendChild(bubble);

        // Add follow-up buttons if present
        if (msg.followUps && msg.followUps.length > 0) {
          const followUpWrapper = document.createElement('div');
          followUpWrapper.className = 'proxe-followup-buttons';
          
          msg.followUps.forEach(function(followUp) {
            const followUpLower = followUp.toLowerCase();
            // Filter out Wind Chasers-specific buttons
            const isWindChasersButton = followUpLower.includes('choose your program') || 
                                        followUpLower.includes('which program') ||
                                        followUpLower.includes('schedule admissions');
            
            if (!isWindChasersButton) {
              const followUpBtn = document.createElement('button');
              followUpBtn.className = 'proxe-followup-btn';
              followUpBtn.type = 'button';
              followUpBtn.textContent = followUp;
              followUpBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleQuickButtonClick(followUp);
              };
              followUpWrapper.appendChild(followUpBtn);
            }
          });
          
          bubble.appendChild(followUpWrapper);
        }

        msgArea.appendChild(msgDiv);
      });
    }

    // Scroll to bottom
    setTimeout(function() {
      msgArea.scrollTop = msgArea.scrollHeight;
    }, 100);
  }

  async function sendMessage(userMessage, skipRendering = false) {
    if (!userMessage || !userMessage.trim()) return;
    
    if (waitingForName && !skipRendering) {
      userName = userMessage.trim();
      waitingForName = false;
      messages.push({
        type: 'user',
        text: '<p>' + userName + '</p>',
        hasStreamed: true
      });
      renderMessages();
      
      // Send acknowledgment - backend will handle empty message as state update
      await sendToAPI('Thanks for providing your name.', true);
      return;
    }
    
    if (waitingForPhone && !skipRendering) {
      userPhone = userMessage.trim();
      waitingForPhone = false;
      conversationState = 'qualified';
      messages.push({
        type: 'user',
        text: '<p>' + userPhone + '</p>',
        hasStreamed: true
      });
      renderMessages();
      
      // Send acknowledgment - backend will handle as state update
      await sendToAPI('Thanks for providing your phone number.', true);
      return;
    }
    
    if (!skipRendering) {
      messages.push({
        type: 'user',
        text: '<p>' + userMessage + '</p>',
        hasStreamed: true
      });
      userMessageCount++;
      renderMessages();
    }
    
    await sendToAPI(userMessage);
  }

  async function sendToAPI(message, isStateUpdate = false) {
    const msgArea = document.querySelector('.proxe-messages-area');
    if (!msgArea) return;

    // Check if this is a booking signal
    const lowerMessage = message.toLowerCase();
    const bookingKeywords = ['book', 'schedule', 'demo', 'call', 'meeting', 'let\'s do it', 'yes', 'sounds good', 'i\'m ready'];
    const isBookingSignal = bookingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isBookingSignal && userName && userPhone) {
      conversationState = 'ready_to_book';
      showBookingOption();
      return;
    }

    // Add loading message
    const loadingMsg = {
      type: 'ai',
      text: '<p>Thinking...</p>',
      isStreaming: true,
      hasStreamed: false
    };
    messages.push(loadingMsg);
    renderMessages();

    try {
      const response = await fetch(API_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          brand: brand,
          conversationState: conversationState,
          userName: userName,
          userPhone: userPhone,
          painPoint: painPoint,
          messageCount: userMessageCount
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Remove loading message
      const loadingIndex = messages.findIndex(m => m.isStreaming && !m.hasStreamed);
      if (loadingIndex !== -1) {
        messages.splice(loadingIndex, 1);
      }

      if (data.response) {
        messages.push({
          type: 'ai',
          text: data.response,
          hasStreamed: true,
          followUps: data.followUps || []
        });
        completedAiMessages++;
      }

      // Update conversation state if provided
      if (data.conversationState) {
        conversationState = data.conversationState;
      }

      // Handle post-response actions
      handlePostResponseActions(data);

      renderMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message
      const loadingIndex = messages.findIndex(m => m.isStreaming && !m.hasStreamed);
      if (loadingIndex !== -1) {
        messages.splice(loadingIndex, 1);
      }

      messages.push({
        type: 'ai',
        text: '<p>Sorry, I encountered an error. Please try again.</p>',
        hasStreamed: true
      });
      renderMessages();
    }
  }

  function handlePostResponseActions(data) {
    // Handle name collection
    if (data.shouldCollectName && !userName && !waitingForName) {
      waitingForName = true;
      messages.push({
        type: 'ai',
        text: '<p>What\'s your name?</p>',
        hasStreamed: true
      });
      renderMessages();
      return;
    }

    // Handle phone collection
    if (data.shouldCollectPhone && userName && !userPhone && !waitingForPhone) {
      waitingForPhone = true;
      messages.push({
        type: 'ai',
        text: '<p>Thanks ' + userName + '. What\'s the best number to reach you?</p>',
        hasStreamed: true
      });
      renderMessages();
      return;
    }

    // Handle booking suggestion
    if (data.suggestBooking || data.conversationState === 'ready_to_book') {
      showBookingOption();
    }
  }

  function showBookingOption() {
    // Check if booking already shown
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.variant === 'booking') {
      return;
    }

    messages.push({
      type: 'ai',
      text: '<p><strong>Want to see this in action on YOUR business?</strong></p><p>15 minutes. I\'ll show exactly how it works for ' + (painPoint || 'your situation') + '. No pitch. Just: does this actually help?</p>',
      variant: 'booking',
      hasStreamed: true,
    });
    renderMessages();

    // Load Calendly widget
    if (!window.Calendly) {
      const calendlyScript = document.createElement('script');
      calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
      calendlyScript.async = true;
      document.head.appendChild(calendlyScript);
    }

    setTimeout(function() {
      if (window.Calendly) {
        const calendlyDiv = document.createElement('div');
        calendlyDiv.className = 'calendly-inline-widget';
        calendlyDiv.setAttribute('data-url', 'https://calendly.com/goproxe/demo');
        calendlyDiv.style.minHeight = '700px';
        calendlyDiv.style.width = '100%';
        
        const lastBubble = document.querySelector('.proxe-message:last-child .proxe-message-bubble');
        if (lastBubble) {
          lastBubble.appendChild(calendlyDiv);
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/goproxe/demo',
            parentElement: calendlyDiv
          });
        }
      }
    }, 500);
  }

  function handleQuickButtonClick(message) {
    // Open chat if not already open
    if (!isOpen) {
      isOpen = true;
      createWidget();
      // Wait for chatbox to be created before sending message
      setTimeout(function() {
        sendMessage(message);
      }, 300);
      return;
    }
    
    // Check if this is a booking signal
    const lowerMessage = message.toLowerCase();
    const bookingKeywords = ['book', 'schedule', 'demo', 'call', 'meeting'];
    const isBookingSignal = bookingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isBookingSignal && userName && userPhone) {
      conversationState = 'ready_to_book';
      showBookingOption();
      return;
    }
    
    sendMessage(message);
  }

  function createWidget() {
    let container = document.getElementById('proxe-widget-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'proxe-widget-container';
      container.setAttribute('data-brand', brand); // Add brand data attribute for CSS switching
      document.body.appendChild(container);
    } else {
      // Update brand attribute if it exists but is different
      container.setAttribute('data-brand', brand);
      // Clear container when switching between search bar and chatbox
      container.innerHTML = '';
    }

    // Create or update backdrop overlay
    let backdrop = document.getElementById('proxe-backdrop-overlay');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'proxe-backdrop-overlay';
      backdrop.className = 'proxe-backdrop-overlay';
      document.body.appendChild(backdrop);
    }

    if (!isOpen) {
      // Create search bar
      const searchbarWrapper = document.createElement('div');
      searchbarWrapper.id = 'proxe-searchbar-wrapper';
      searchbarWrapper.className = 'proxe-searchbar-wrapper';

      const quickButtonsWrapper = document.createElement('div');
      quickButtonsWrapper.className = 'proxe-quick-buttons';

      // Create PROXe quick buttons
      const quickButtons = [
        { text: 'What is PROXe', message: 'What is PROXe' },
        { text: 'Deploy PROXe', message: 'Deploy PROXe' },
        { text: 'Book a Demo', message: 'Book a Demo' }
      ];
      
      quickButtons.forEach(function(buttonConfig) {
        const btn = document.createElement('button');
        btn.className = 'proxe-quick-btn';
        btn.textContent = buttonConfig.text;
        btn.type = 'button';
        btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
          handleQuickButtonClick(buttonConfig.message);
        };
        quickButtonsWrapper.appendChild(btn);
      });

      const searchbar = document.createElement('div');
      searchbar.className = 'proxe-searchbar';

      const searchIcon = document.createElement('div');
      searchIcon.className = 'proxe-search-icon';
      searchIcon.innerHTML = icons.search;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'proxe-search-input';
      input.placeholder = 'Ask me anything...';
      input.autocomplete = 'off';

      const sendBtn = document.createElement('button');
      sendBtn.className = 'proxe-searchbar-send-btn';
      sendBtn.innerHTML = icons.send;
      sendBtn.style.display = 'none';

      const handleSearchSend = function() {
        if (!input.value.trim()) return;
        const query = input.value.trim();
        input.value = '';
        isOpen = true;
        createWidget();
        setTimeout(function() {
          sendMessage(query);
        }, 300);
      };

      sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleSearchSend();
      });

      input.addEventListener('focus', function() {
        if (!isOpen) {
          quickButtonsWrapper.style.display = 'flex';
          searchbarWrapper.classList.add('proxe-expanded-mobile');
        }
        if (input.value.trim()) {
          sendBtn.style.display = 'flex';
          searchIcon.style.display = 'none';
        }
      });
      
      // Update send button visibility on input change
      input.addEventListener('input', function() {
        if (input.value.trim()) {
          sendBtn.style.display = 'flex';
          searchIcon.style.display = 'none';
        } else {
          sendBtn.style.display = 'none';
          searchIcon.style.display = 'flex';
        }
      });

      // Hide buttons on blur if empty
      input.addEventListener('blur', function() {
        setTimeout(function() {
          if (!input.value.trim() && !isDown) {
            quickButtonsWrapper.style.display = 'none';
            searchbarWrapper.classList.remove('proxe-expanded-mobile');
            sendBtn.style.display = 'none';
            searchIcon.style.display = 'flex';
          }
        }, 200); // Delay to allow button click to register
      });

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && input.value.trim()) {
          handleSearchSend();
        }
      });

      searchbar.appendChild(searchIcon);
      searchbar.appendChild(input);
      searchbar.appendChild(sendBtn);

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
      refreshBtn.addEventListener('click', function() {
        // Reset conversation
        messages = [];
        userMessageCount = 0;
        conversationState = 'cold';
        userName = null;
        userPhone = null;
        painPoint = null;
        isOpen = false;
        const container = document.getElementById('proxe-widget-container');
        if (container) container.remove();
        const backdrop = document.getElementById('proxe-backdrop-overlay');
        if (backdrop) {
          backdrop.classList.remove('active');
        }
        document.body.style.overflow = '';
        createWidget();
      });

      const closeBtn = document.createElement('button');
      closeBtn.className = 'proxe-header-btn proxe-close-btn';
      closeBtn.innerHTML = icons.close;
      closeBtn.addEventListener('click', function() {
        isOpen = false;
        const container = document.getElementById('proxe-widget-container');
        if (container) container.remove();
        const backdrop = document.getElementById('proxe-backdrop-overlay');
        if (backdrop) {
          backdrop.classList.remove('active');
        }
        document.body.style.overflow = '';
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
        const userMessage = chatInput.value.trim();
        chatInput.value = '';
        
        // Handle name collection
        if (waitingForName) {
          userName = userMessage;
          waitingForName = false;
          messages.push({
            type: 'user',
            text: '<p>' + userName + '</p>',
            hasStreamed: true
          });
          renderMessages();
          sendToAPI('', true); // Send empty message to get next response
          return;
        }
        
        // Handle phone collection
        if (waitingForPhone) {
          userPhone = userMessage;
          waitingForPhone = false;
          conversationState = 'qualified';
          messages.push({
            type: 'user',
            text: '<p>' + userPhone + '</p>',
            hasStreamed: true
          });
          renderMessages();
          sendToAPI('', true); // Send empty message to get next response
          return;
        }
        
        sendMessage(userMessage);
      };

      sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleSend();
      });

      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && chatInput.value.trim()) {
          handleSend();
        }
      });

      chatInput.addEventListener('focus', function() {
        // On mobile, scroll messages to bottom after focus to ensure input is visible
        if (window.innerWidth < 768) {
          const msgArea = chatbox.querySelector('.proxe-messages-area');
          if (msgArea) {
            setTimeout(function() {
              msgArea.scrollTop = msgArea.scrollHeight;
            }, 300); // Delay to account for keyboard animation
          }
        }
      }, 100);

      inputArea.appendChild(chatInput);
      inputArea.appendChild(sendBtn);

      const footer = document.createElement('div');
      footer.className = 'proxe-footer';
      footer.innerHTML = '<div class="proxe-footer-link">Powered by PROXe</div>';

      chatbox.appendChild(inputArea);
      chatbox.appendChild(footer);
      container.appendChild(chatbox);

      // Activate backdrop
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Render messages
      renderMessages();

      // Focus input after a short delay
      setTimeout(function() {
        chatInput.focus();
        // On mobile, scroll messages to bottom after focus to ensure input is visible
        if (window.innerWidth < 768) {
          const msgArea = chatbox.querySelector('.proxe-messages-area');
          if (msgArea) {
            setTimeout(function() {
              msgArea.scrollTop = msgArea.scrollHeight;
            }, 300); // Delay to account for keyboard animation
          }
        }
      }, 100);
      manualOpen = false; // Reset for next time
    }
  }

  // Robust initialization for all browsers, especially mobile
  function initializeWidget() {
    loadCSS();
    // Small delay to ensure DOM is ready, especially on mobile
    if (document.body) {
      createWidget();
    } else {
      // Fallback: wait for body to be ready
      const checkBody = setInterval(function() {
        if (document.body) {
          clearInterval(checkBody);
          createWidget();
        }
      }, 50);
      // Safety timeout
      setTimeout(function() {
        clearInterval(checkBody);
        if (document.body) {
          createWidget();
        }
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM already loaded or loading
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Use setTimeout to ensure everything is ready, especially on mobile
      setTimeout(initializeWidget, 100);
    } else {
      initializeWidget();
    }
  }

  // Function to format text response into HTML (markdown to HTML conversion)
  function formatTextToHTML(text) {
    if (!text) return '';
    
    // If text already contains HTML tags, assume it's already formatted
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }
    
    // Split into lines for processing
    const lines = text.split('\n');
    let output = [];
    let currentList = null;
    let listType = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Empty line - close any open list
      if (!trimmed) {
        if (currentList) {
          const tag = listType === 'ol' ? 'ol' : 'ul';
          output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
          currentList = null;
          listType = null;
        }
        return;
      }
      
      // Headings
      if (trimmed.startsWith('### ')) {
        if (currentList) {
          const tag = listType === 'ol' ? 'ol' : 'ul';
          output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
          currentList = null;
          listType = null;
        }
        output.push(`<h3>${formatInlineMarkdown(trimmed.substring(4))}</h3>`);
        return;
      }
      
      if (trimmed.startsWith('## ')) {
        if (currentList) {
          const tag = listType === 'ol' ? 'ol' : 'ul';
          output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
          currentList = null;
          listType = null;
        }
        output.push(`<h2>${formatInlineMarkdown(trimmed.substring(3))}</h2>`);
        return;
      }
      
      if (trimmed.startsWith('# ')) {
        if (currentList) {
          const tag = listType === 'ol' ? 'ol' : 'ul';
          output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
          currentList = null;
          listType = null;
        }
        output.push(`<h1>${formatInlineMarkdown(trimmed.substring(2))}</h1>`);
        return;
      }
      
      // Numbered list
      const numberedMatch = trimmed.match(/^(\d+)\.\s+/);
      if (numberedMatch) {
        const listItem = trimmed.substring(numberedMatch[0].length);
        if (!currentList || listType !== 'ol') {
          if (currentList) {
            const tag = listType === 'ol' ? 'ol' : 'ul';
            output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
          }
          currentList = [];
          listType = 'ol';
        }
        currentList.push(listItem);
        return;
      }
      
      // Bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItem = trimmed.substring(2);
        if (!currentList || listType !== 'ul') {
          if (currentList) {
            const tag = listType === 'ol' ? 'ol' : 'ul';
            output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
          }
          currentList = [];
          listType = 'ul';
        }
        currentList.push(listItem);
        return;
      }
      
      // Regular paragraph
      if (currentList) {
        const tag = listType === 'ol' ? 'ol' : 'ul';
        output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
        currentList = null;
        listType = null;
      }
      
      output.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
    });
    
    // Close any remaining list
    if (currentList) {
      const tag = listType === 'ol' ? 'ol' : 'ul';
      output.push(`<${tag}>${currentList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
    }
    
    return output.join('');
  }
  
  // Function to format inline markdown (bold, italic, etc.)
  function formatInlineMarkdown(text) {
    // First handle bold text (**text** or __text__) - do this before italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Then handle italic (*text* or _text_) - but not if already processed as bold
    // Use word boundaries and negative lookahead to avoid conflicts
    text = text.replace(/(^|[^*])\*([^*]+?)\*([^*]|$)/g, '$1<em>$2</em>$3');
    text = text.replace(/(^|[^_])_([^_]+?)_([^_]|$)/g, '$1<em>$2</em>$3');
    
    // Code inline (`code`)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return text;
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
      const backdrop = document.getElementById('proxe-backdrop-overlay');
      if (backdrop) {
        backdrop.classList.remove('active');
      }
      document.body.style.overflow = '';
      createWidget();
    }
  };
})();
