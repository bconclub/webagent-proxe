(function() {
  let isOpen = false;
  let messages = [];
  let completedAiMessages = 0;
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
    if (!msgArea) {
      console.warn('⚠️ Message area not found!');
      return;
    }

    msgArea.innerHTML = '';

    if (messages.length === 0 && conversationState === 'cold') {
      // Empty state - no initial message text, buttons appear outside chat box
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
        textDiv.dataset.messageIndex = index; // Store index for direct updates
        
        if (msg.isStreaming) {
          const textToFormat = msg.text || '';
          // Show infinity symbol while streaming/thinking
          if (!textToFormat) {
            textDiv.className = 'proxe-message-text proxe-typing-infinity';
            textDiv.innerHTML = '<svg viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg"><path class="infinity-path" d="M12 12 C8 6, 4 6, 4 12 C4 18, 8 18, 12 12 M36 12 C40 6, 44 6, 44 12 C44 18, 40 18, 36 12 M12 12 C16 18, 20 18, 24 12 C28 18, 32 18, 36 12" /><path class="infinity-stroke" d="M12 12 C8 6, 4 6, 4 12 C4 18, 8 18, 12 12 M36 12 C40 6, 44 6, 44 12 C44 18, 40 18, 36 12 M12 12 C16 18, 20 18, 24 12 C28 18, 32 18, 36 12" /></svg>';
          } else {
            const formattedText = formatTextToHTML(textToFormat);
            textDiv.innerHTML = formattedText + '<span class="streaming-cursor">▋</span>';
          }
        } else {
          const formattedText = formatTextToHTML(msg.text || '');
          textDiv.innerHTML = formattedText;
        }
        
        bubble.appendChild(textDiv);
        msgDiv.appendChild(bubble);

        // Add follow-up buttons if present - but exclude main action buttons (shown outside)
        if (msg.followUps && msg.followUps.length > 0) {
          const followUpWrapper = document.createElement('div');
          followUpWrapper.className = 'proxe-followup-buttons';
          
          msg.followUps.forEach(function(followUp) {
            const followUpLower = followUp.toLowerCase();
            // Show all follow-up buttons in chat (no filtering needed)
            // "What is PROXe", "Deploy PROXe", "Book a Call", "PROXe Pricing" can all appear in chat
            const isOutsideOnlyCTA = false;
            
            if (!isOutsideOnlyCTA) {
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
          
          // Only append if there are buttons to show
          if (followUpWrapper.children.length > 0) {
            bubble.appendChild(followUpWrapper);
          }
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
      // PROXe uses streaming
      if (brand === 'proxe') {
        // Streaming response
        const response = await fetch(API_CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            brand: brand,
            messageCount: userMessageCount
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove loading message and add streaming message
        const loadingIndex = messages.findIndex(m => m.isStreaming && !m.hasStreamed);
        if (loadingIndex !== -1) {
          messages.splice(loadingIndex, 1);
        }

        const streamingMsg = {
          type: 'ai',
          text: '',
          isStreaming: true,
          hasStreamed: false,
          followUps: []
        };
        messages.push(streamingMsg);
        const streamingMsgIndex = messages.length - 1;
        
        // Initial render with empty text to ensure message bubble appears
        renderMessages();

        // Read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // If stream ends without 'done' event, mark as complete
              if (messages[streamingMsgIndex].isStreaming) {
                messages[streamingMsgIndex].isStreaming = false;
                messages[streamingMsgIndex].hasStreamed = true;
                
                // Clean response (remove greetings, etc.)
                let cleanedText = messages[streamingMsgIndex].text
                  .replace(/^(Hi there!|Hello!|Hey!|Hi!)\s*/gi, '')
                  .replace(/^(Hi|Hello|Hey),?\s*/gi, '')
                  .trim();
                messages[streamingMsgIndex].text = cleanedText;
                
                completedAiMessages++;
                renderMessages();
              }
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete SSE messages (separated by \n\n)
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                try {
                  const jsonStr = trimmed.slice(6); // Remove 'data: ' prefix
                  const data = JSON.parse(jsonStr);
                  
                  if (data.type === 'chunk') {
                    // Update message text
                    messages[streamingMsgIndex].text += data.text || '';
                    
                    // Update only the streaming message element directly (no full re-render)
                    const msgArea = document.querySelector('.proxe-messages-area');
                    if (msgArea) {
                      const streamingMsgElement = msgArea.querySelector(`[data-index="${streamingMsgIndex}"]`);
                      if (streamingMsgElement) {
                        const textDiv = streamingMsgElement.querySelector('.proxe-message-text');
                        if (textDiv) {
                          const formattedText = formatTextToHTML(messages[streamingMsgIndex].text || '');
                          textDiv.innerHTML = formattedText + '<span class="streaming-cursor">▋</span>';
                          
                          // Smooth scroll to bottom
                          requestAnimationFrame(function() {
                            msgArea.scrollTop = msgArea.scrollHeight;
                          });
                        }
                      }
                    }
                  } else if (data.type === 'followUps') {
                    messages[streamingMsgIndex].followUps = data.followUps || [];
                    // Only re-render to add follow-up buttons
                    renderMessages();
                  } else if (data.type === 'error') {
                    console.error('Stream error from server:', data.error);
                    messages[streamingMsgIndex].isStreaming = false;
                    messages[streamingMsgIndex].hasStreamed = true;
                    messages[streamingMsgIndex].text = messages[streamingMsgIndex].text || 'Error: ' + (data.error || 'Unknown error');
                    completedAiMessages++;
                    renderMessages();
                  } else if (data.type === 'done') {
                    messages[streamingMsgIndex].isStreaming = false;
                    messages[streamingMsgIndex].hasStreamed = true;
                    
                    // Clean response (remove greetings, etc.)
                    let cleanedText = messages[streamingMsgIndex].text
                      .replace(/^(Hi there!|Hello!|Hey!|Hi!)\s*/gi, '')
                      .replace(/^(Hi|Hello|Hey),?\s*/gi, '')
                      .trim();
                    messages[streamingMsgIndex].text = cleanedText;
                    
                    // Update final text directly and remove cursor (no full re-render)
                    const msgArea = document.querySelector('.proxe-messages-area');
                    if (msgArea) {
                      const streamingMsgElement = msgArea.querySelector(`[data-index="${streamingMsgIndex}"]`);
                      if (streamingMsgElement) {
                        const textDiv = streamingMsgElement.querySelector('.proxe-message-text');
                        if (textDiv) {
                          const formattedText = formatTextToHTML(cleanedText);
                          textDiv.innerHTML = formattedText;
                        }
                      }
                    }
                    
                    completedAiMessages++;
                    // Re-render only if we need to add follow-up buttons
                    renderMessages();
                  }
                } catch (parseError) {
                  console.error('Error parsing stream data:', parseError, 'Line:', line);
                  // Continue processing other lines
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          // Mark message as complete even if stream fails
          messages[streamingMsgIndex].isStreaming = false;
          messages[streamingMsgIndex].hasStreamed = true;
          messages[streamingMsgIndex].text = messages[streamingMsgIndex].text || 'Error receiving response. Please try again.';
          completedAiMessages++;
          renderMessages();
        }
      } else {
        // Non-streaming fallback (shouldn't happen for PROXe)
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
          // Try to get error details from response
          let errorDetails = 'Network response was not ok';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.details || errorDetails;
            console.error('API Error:', errorData);
          } catch (e) {
            console.error('API Error Response:', response.status, response.statusText);
          }
          throw new Error(errorDetails);
        }

        const data = await response.json();
        
        // Check if response contains an error
        if (data.error) {
          throw new Error(data.error + (data.details ? ': ' + data.details : ''));
        }
        
        // Remove loading message
        const loadingIndex = messages.findIndex(m => m.isStreaming && !m.hasStreamed);
        if (loadingIndex !== -1) {
          messages.splice(loadingIndex, 1);
        }

        if (data.response) {
          // Handle both followUps array and followUp string for backward compatibility
          let followUpsArray = [];
          if (data.followUps && Array.isArray(data.followUps)) {
            followUpsArray = data.followUps;
          } else if (data.followUp && data.followUp.toLowerCase() !== 'skip') {
            followUpsArray = [data.followUp];
          }
          
          messages.push({
            type: 'ai',
            text: data.response,
            hasStreamed: true,
            followUps: followUpsArray
          });
          completedAiMessages++;
        } else {
          throw new Error('No response received from server');
        }

        // Update conversation state if provided
        if (data.conversationState) {
          conversationState = data.conversationState;
        }

        // Handle post-response actions
        handlePostResponseActions(data);

        renderMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message);
      
      // Remove loading message
      const loadingIndex = messages.findIndex(m => m.isStreaming && !m.hasStreamed);
      if (loadingIndex !== -1) {
        messages.splice(loadingIndex, 1);
      }

      // Show more helpful error message
      let errorMessage = '<p>Sorry, I encountered an error. Please try again.</p>';
      
      // Check for specific error types
      if (error.message && error.message.includes('fetch')) {
        errorMessage = '<p>Unable to connect to the server. Please check your connection and try again.</p>';
      } else if (error.message && error.message.includes('CLAUDE_API_KEY')) {
        errorMessage = '<p>Service configuration error. Please contact support.</p>';
      } else if (error.message && error.message.length > 0) {
        // Show the actual error message for debugging (only in console)
        console.error('Full error:', error);
      }

      messages.push({
        type: 'ai',
        text: errorMessage,
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

      // Track if button is being clicked to prevent blur from hiding buttons
      let isDown = false;

      // Create PROXe quick buttons - shown outside chat box
      const quickButtons = [
        { text: 'What is PROXe', message: 'What is PROXe' },
        { text: 'Deploy PROXe', message: 'Deploy PROXe' },
        { text: 'Book a Call', message: 'Book a Call' }
      ];
      
      quickButtons.forEach(function(buttonConfig) {
        const btn = document.createElement('button');
        btn.className = 'proxe-quick-btn';
        btn.textContent = buttonConfig.text;
        btn.type = 'button';
        btn.addEventListener('mousedown', function() {
          isDown = true;
        });
        btn.addEventListener('mouseup', function() {
          isDown = false;
        });
        btn.addEventListener('mouseleave', function() {
          isDown = false;
        });
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

      // Show buttons on searchbar click or input focus
      searchbar.addEventListener('click', function(e) {
        if (!isOpen && e.target !== input) {
          input.focus();
        }
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
    if (!text) {
      return '';
    }
    
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
