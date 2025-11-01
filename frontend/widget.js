console.log('PROXE Widget Initializing...');

(function() {
  let isOpen = false;
  let messages = [];
  let completedAiMessages = 0;
  let phonePromptShown = false;
  let formShown = false;
  let manualOpen = false; // Track if user manually opened chat
  let userMessageCount = 0; // Track total user messages sent
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
      messages.forEach(function(msg, index) {
        const msgDiv = document.createElement('div');
        const messageType = msg.type || 'ai';
        msgDiv.className = 'proxe-message ' + messageType;
        msgDiv.dataset.index = index;

        if (msg.variant === 'phone-request') {
          msgDiv.classList.add('proxe-phone-request');
        }
        
        if (msg.variant === 'admissions-form') {
          msgDiv.classList.add('proxe-admissions-form');
        }
        
        if (msg.variant === 'program-selection') {
          msgDiv.classList.add('proxe-program-selection');
        }

        const bubble = document.createElement('div');
        bubble.className = 'proxe-message-bubble';

        if (msg.variant === 'phone-request') {
          bubble.classList.add('proxe-phone-request-bubble');
        }
        
        if (msg.variant === 'admissions-form') {
          bubble.classList.add('proxe-admissions-form-bubble');
        }
        
        if (msg.variant === 'program-selection') {
          bubble.classList.add('proxe-program-selection-bubble');
        }

        const header = document.createElement('div');
        header.className = 'proxe-message-header';

        const avatar = document.createElement('div');
        avatar.className = 'proxe-bubble-avatar';
        avatar.innerHTML = icons.user;

        const name = document.createElement('div');
        name.className = 'proxe-message-name';
        name.textContent = messageType === 'ai' ? brandName : 'You';

        header.appendChild(avatar);
        header.appendChild(name);

        const textDiv = document.createElement('div');
        textDiv.className = 'proxe-message-text';

        if (msg.isLoading) {
          textDiv.innerHTML = msg.text;
        } else if (messageType === 'ai' && !msg.hasStreamed) {
          textDiv.innerHTML = '';
        } else {
          // Format markdown to HTML only when not streaming
          const formattedHtml = messageType === 'ai' ? formatTextToHTML(msg.text) : msg.text;
          textDiv.innerHTML = formattedHtml;
        }

        bubble.appendChild(header);
        bubble.appendChild(textDiv);
        msgDiv.appendChild(bubble);

        if (messageType === 'ai' && msg.variant === 'admissions-form') {
          if (!formShown) {
            msgDiv.appendChild(createAdmissionsForm());
          }
        }
        
        if (messageType === 'ai' && msg.quickQuestions && !formShown) {
          const quickQuestionsWrapper = document.createElement('div');
          quickQuestionsWrapper.className = 'proxe-quick-questions-inline';

          const q1 = createQuickQuestionBtn('Schedule Admissions Call 📞', 'schedule');
          const q2 = createQuickQuestionBtn('Get Program Details 📚', 'course');
          const q3 = createQuickQuestionBtn('Check Eligibility ⭐', 'eligibility');

          quickQuestionsWrapper.appendChild(q1);
          quickQuestionsWrapper.appendChild(q2);
          quickQuestionsWrapper.appendChild(q3);

          msgDiv.appendChild(quickQuestionsWrapper);
        }
        
        if (messageType === 'ai' && msg.showContactButtons) {
          const contactWrapper = document.createElement('div');
          contactWrapper.className = 'proxe-contact-buttons';

          const callBtn = document.createElement('a');
          callBtn.href = 'tel:+919591004043';
          callBtn.className = 'proxe-contact-btn proxe-call-btn';
          callBtn.innerHTML = '📞 Call: +91 95910 04043';

          const whatsappBtn = document.createElement('a');
          whatsappBtn.href = 'https://wa.me/919591004043';
          whatsappBtn.target = '_blank';
          whatsappBtn.className = 'proxe-contact-btn proxe-whatsapp-btn';
          whatsappBtn.innerHTML = '💬 WhatsApp Us';

          const calendlyBtn = document.createElement('button');
          calendlyBtn.type = 'button';
          calendlyBtn.className = 'proxe-contact-btn proxe-calendly-btn';
          calendlyBtn.innerHTML = '📅 Schedule Discovery Call';
          calendlyBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            showCalendlyWidget(msgDiv);
          };

          contactWrapper.appendChild(callBtn);
          contactWrapper.appendChild(whatsappBtn);
          contactWrapper.appendChild(calendlyBtn);

          msgDiv.appendChild(contactWrapper);
        }
        
        if (messageType === 'ai' && msg.variant === 'program-selection' && msg.programs) {
          const programWrapper = document.createElement('div');
          programWrapper.className = 'proxe-program-selection-buttons';

          msg.programs.forEach(function(program) {
            const programBtn = document.createElement('button');
            programBtn.className = 'proxe-program-btn';
            programBtn.type = 'button';
            programBtn.textContent = program.label;
            programBtn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              manualOpen = false;
              
              // Add user message
              userMessageCount += 1;
              messages.push({
                type: 'user',
                text: program.label,
                hasStreamed: true
              });
              
              // Add skeleton loader
              messages.push({ 
                type: 'ai', 
                text: '<div class="proxe-skeleton-loader"><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div></div>',
                isLoading: true
              });
              
              renderMessages();
              
              // Send to API
              fetch(API_CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: program.label, messageCount: userMessageCount })
              })
              .then(function(res) { return res.json(); })
              .then(function(data) {
                console.log('API Response:', data);
                handleApiResponse(data);
              })
              .catch(handleApiError);
            };
            programWrapper.appendChild(programBtn);
          });

          msgDiv.appendChild(programWrapper);
        }

        if (messageType === 'ai' && msg.followUp && msg.followUpVisible) {
          const followupWrapper = document.createElement('div');
          followupWrapper.className = 'proxe-followup-buttons';

          const followupBtn = document.createElement('button');
          followupBtn.className = 'proxe-followup-btn primary';
          followupBtn.type = 'button';
          followupBtn.textContent = msg.followUp;
          followupBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Check if this is a program selection request
            const followUpLower = msg.followUp ? msg.followUp.toLowerCase() : '';
            if (followUpLower.includes('choose your program') || followUpLower.includes('which program')) {
              showProgramSelection();
            } else if (followUpLower.includes('i am ready to enroll') || followUpLower.includes('ready to enroll')) {
              // Handle enrollment - show Calendly widget
              isOpen = true;
              createWidget();
              // Find the message div containing this button
              const messageDiv = e.target.closest('.proxe-message');
              if (messageDiv) {
                showCalendlyWidget(messageDiv);
              }
            } else if (followUpLower.includes('schedule admissions call')) {
              // Handle schedule admissions call directly
              handleQuickButtonClick(msg.followUp);
            } else {
              handleQuickButtonClick(msg.followUp);
            }
          };

          followupWrapper.appendChild(followupBtn);
          msgDiv.appendChild(followupWrapper);
        }

        msgArea.appendChild(msgDiv);
      });
    }

    setTimeout(function() {
      msgArea.scrollTop = msgArea.scrollHeight;
    }, 50);
  }

  function streamText(element, markdownText, speed = 8, onComplete) {
    let index = 0;
    const charsPerUpdate = 3;
    
    function typeNextChar() {
      if (index < markdownText.length) {
        const charsToAdd = Math.min(charsPerUpdate, markdownText.length - index);
        const partialText = markdownText.substring(0, index + charsToAdd);
        const formattedHtml = formatTextToHTML(partialText);
        element.innerHTML = formattedHtml;
        index += charsToAdd;
        setTimeout(typeNextChar, speed);
      } else {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }

    typeNextChar();
  }

  // Function to format text response into HTML
  function formatTextToHTML(text) {
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
        output.push(`<h2>${formatInlineMarkdown(trimmed.substring(2))}</h2>`);
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
  
  function formatInlineMarkdown(text) {
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return text;
  }
  
  function createQuickQuestionBtn(text, action) {
    const btn = document.createElement('button');
    btn.className = 'proxe-inline-question-btn';
    btn.type = 'button';
    btn.textContent = text;
    btn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (action === 'schedule') {
        handleQuickButtonClick('Schedule Admissions Call');
      } else if (action === 'course') {
        // Directly show program selection instead of sending message
      
        isOpen = true;
        createWidget();
        showProgramSelection();
      } else if (action === 'eligibility') {
        handleQuickButtonClick('Check eligibility');
      }
    };
    return btn;
  }
  
  function showProgramSelection() {
    const programs = [
      { value: 'DGCA Ground Classes', label: 'DGCA Ground Classes' },
      { value: 'PPL', label: 'Private Pilot License (PPL)' },
      { value: 'CPL', label: 'Commercial Pilot License (CPL)' },
      { value: 'ATPL', label: 'Airline Transport Pilot License (ATPL)' },
      { value: 'IR', label: 'Instrument Rating (IR)' },
      { value: 'ME', label: 'Multi-Engine Rating' },
      { value: 'CFI', label: 'Certified Flight Instructor (CFI)' },
      { value: 'Cabin Crew Training', label: 'Cabin Crew Training' },
      { value: 'International Flight Schools', label: 'International Flight Schools' },
      { value: 'Type Rating Programs', label: 'Type Rating Programs' },
      { value: 'Helicopter Training', label: 'Helicopter Training' }
    ];
    
    messages.push({
      type: 'ai',
      text: '<p><strong>Which program interests you? 📚</strong></p>',
      variant: 'program-selection',
      hasStreamed: true,
      programs: programs
    });
    renderMessages();
  }

  function createAdmissionsForm() {
    const formWrapper = document.createElement('div');
    formWrapper.className = 'proxe-admissions-form-wrapper';
    
    const form = document.createElement('form');
    form.className = 'proxe-admissions-form-element';
    
    const nameField = createFormField('Name', 'text', 'formName', true);
    const phoneField = createFormField('Phone', 'tel', 'formPhone', true);
    const emailField = createFormField('Email', 'email', 'formEmail', true);
    const cityField = createFormField('City', 'text', 'formCity', true);
    
    const courseField = createSelectField('Program', 'formCourse', true, [
      { value: '', label: 'Select Program' },
      { value: 'DGCA', label: 'DGCA Ground Classes' },
      { value: 'PPL', label: 'Private Pilot License (PPL)' },
      { value: 'CPL', label: 'Commercial Pilot License (CPL)' },
      { value: 'ATPL', label: 'Airline Transport Pilot License (ATPL)' },
      { value: 'IR', label: 'Instrument Rating (IR)' },
      { value: 'ME', label: 'Multi-Engine Rating' },
      { value: 'CFI', label: 'Certified Flight Instructor (CFI)' },
      { value: 'CabinCrew', label: 'Cabin Crew Training' },
      { value: 'International', label: 'International Flight Schools' },
      { value: 'TypeRating', label: 'Type Rating Programs' },
      { value: 'Helicopter', label: 'Helicopter Training' },
      { value: 'Other', label: 'Other' }
    ]);
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'proxe-form-submit-btn';
    submitBtn.textContent = 'Submit 📞';
    
    form.appendChild(nameField);
    form.appendChild(phoneField);
    form.appendChild(emailField);
    form.appendChild(cityField);
    form.appendChild(courseField);
    form.appendChild(submitBtn);
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmit(form);
    });
    
    formWrapper.appendChild(form);
    return formWrapper;
  }
  
  function createFormField(label, type, name, required) {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'proxe-form-field';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label + (required ? ' *' : '');
    labelEl.htmlFor = name;
    
    const input = document.createElement('input');
    input.type = type;
    input.id = name;
    input.name = name;
    input.required = required;
    input.className = 'proxe-form-input';
    
    fieldWrapper.appendChild(labelEl);
    fieldWrapper.appendChild(input);
    return fieldWrapper;
  }
  
  function createSelectField(label, name, required, options) {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'proxe-form-field';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label + (required ? ' *' : '');
    labelEl.htmlFor = name;
    
    const select = document.createElement('select');
    select.id = name;
    select.name = name;
    select.required = required;
    select.className = 'proxe-form-select';
    
    options.forEach(function(opt) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    
    fieldWrapper.appendChild(labelEl);
    fieldWrapper.appendChild(select);
    return fieldWrapper;
  }
  
  function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    formShown = true;
    
    // Send data to webhook
    fetch('https://build.goproxe.com/webhook/wc-webagent-proxe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Webhook submission failed');
      }
      return response.json();
    })
    .then(function(result) {
      console.log('Form submitted successfully:', result);
    })
    .catch(function(error) {
      console.error('Error submitting form:', error);
    });
    
    messages.push({
      type: 'ai',
      text: '<p><strong>Thank you! ✅</strong><br>We have received your information. Our admissions team will call you shortly to discuss your pilot training journey. 📞✈️</p>',
      hasStreamed: true
    });
    
    renderMessages();
    
    console.log('Form data:', data);
  }

  function maybeShowPhoneRequest() {
    if (phonePromptShown) return;
    if (completedAiMessages < 2) return;

    phonePromptShown = true;
    messages.push({
      type: 'ai',
      text: '<p><strong>Ready to take the next step? 🚀</strong><br>Our admissions team is here to help you start your pilot journey!</p>',
      variant: 'phone-request',
      hasStreamed: true,
      quickQuestions: true
    });
    renderMessages();
  }

  function handleApiResponse(data) {
    if (!data || !data.response) {
      throw new Error('Invalid response payload');
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.isLoading) {
      messages.pop();
    }

    const aiMessage = {
      type: 'ai',
      text: data.response,
      followUp: data.followUp || null,
      followUpVisible: false,
      hasStreamed: false
    };

    messages.push(aiMessage);
    renderMessages();

    const textElements = document.querySelectorAll('.proxe-message-text');
    const currentElement = textElements[textElements.length - 1];

    if (!currentElement) {
      aiMessage.hasStreamed = true;
      if (aiMessage.followUp) {
        aiMessage.followUpVisible = true;
        renderMessages();
      }
      return;
    }

    streamText(currentElement, data.response, 8, function() {
      aiMessage.hasStreamed = true;
      if (aiMessage.followUp) {
        aiMessage.followUpVisible = true;
      }
      renderMessages();
      completedAiMessages += 1;
      maybeShowPhoneRequest();
    });
  }
  
  function checkForScheduleCall(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') return false;
    const normalized = userMessage.toLowerCase().trim();
    
    // Check for various forms of scheduling/consultation requests
    if (normalized.includes('schedule') && (normalized.includes('call') || normalized.includes('admission') || normalized.includes('consultation') || normalized.includes('free'))) {
      return true;
    }
    if (normalized.includes('connect') && (normalized.includes('admission') || normalized.includes('admissions') || normalized.includes('me'))) {
      return true;
    }
    if ((normalized.includes('free') && normalized.includes('consultation')) || (normalized.includes('consultation') && normalized.includes('free'))) {
      return true;
    }
    
    return false;
  }
  
  function showAdmissionsForm() {
    if (formShown) {
      messages.push({
        type: 'ai',
        text: '<p><strong>We have your details! ✅</strong><br>Our admissions team will call you shortly.</p><p><strong>Want to connect right away?</strong></p>',
        variant: 'phone-request',
        hasStreamed: true,
        showContactButtons: true
      });
      renderMessages();
      return;
    }
    
    messages.push({
      type: 'ai',
      text: '<h2>What We\'ll Discuss</h2><ul><li>Your aviation career goals</li><li>Program requirements and eligibility</li><li>Training timeline and duration</li><li>Financing options and payment plans</li><li>DGCA certification process</li><li>International training opportunities</li><li>Career prospects and placement support</li></ul><p><strong>Please fill in your details below to schedule your personalized admission call:</strong></p>',
      variant: 'admissions-form',
      hasStreamed: true
    });
    renderMessages();
  }

  function showCalendlyWidget(msgDiv) {
    // Check if Calendly widget already exists in this message
    const existingWidget = msgDiv.querySelector('.proxe-calendly-widget');
    if (existingWidget) {
      existingWidget.style.display = existingWidget.style.display === 'none' ? 'block' : 'none';
      return;
    }

    // Create Calendly widget container
    const calendlyContainer = document.createElement('div');
    calendlyContainer.className = 'proxe-calendly-widget';
    
    const calendlyDiv = document.createElement('div');
    calendlyDiv.className = 'calendly-inline-widget';
    calendlyDiv.setAttribute('data-url', 'https://calendly.com/bconclub/discovery-call?hide_event_type_details=1&hide_gdpr_banner=1');
    calendlyDiv.style.minWidth = '320px';
    calendlyDiv.style.height = '700px';
    
    calendlyContainer.appendChild(calendlyDiv);
    msgDiv.appendChild(calendlyContainer);

    // Load Calendly script if not already loaded
    let calendlyScript = document.querySelector('script[src*="calendly.com"]');
    if (!calendlyScript) {
      calendlyScript = document.createElement('script');
      calendlyScript.type = 'text/javascript';
      calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
      calendlyScript.async = true;
      document.head.appendChild(calendlyScript);
    }
    
    // Wait for script to load and then initialize
    function initializeCalendly() {
      if (window.Calendly && window.Calendly.initInlineWidget) {
        try {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/bconclub/discovery-call?hide_event_type_details=1&hide_gdpr_banner=1',
            parentElement: calendlyDiv
          });
        } catch (error) {
          console.error('Calendly initialization error:', error);
        }
      } else {
        // Try again after a short delay
        setTimeout(initializeCalendly, 200);
      }
    }
    
    // Initialize immediately if already loaded, otherwise wait for load event
    if (window.Calendly) {
      setTimeout(initializeCalendly, 100);
    } else {
      calendlyScript.addEventListener('load', initializeCalendly);
      // Fallback: try initializing after 1 second even if load event doesn't fire
      setTimeout(initializeCalendly, 1000);
    }

    // Scroll to show the widget
    setTimeout(function() {
      calendlyContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  function handleApiError(err) {
    console.error('API Error:', err);
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.isLoading) {
      messages.pop();
    }
    messages.push({ type: 'ai', text: 'Sorry, error connecting to server.', hasStreamed: true });
    renderMessages();
  }
  
  // Centralized handler for quick button clicks
  function handleQuickButtonClick(promptText) {
    console.log('Quick button clicked:', promptText);
    
    manualOpen = false; // Don't open keyboard when clicking quick/follow-up buttons
    
    // Add user message
    userMessageCount += 1;
    messages.push({ type: 'user', text: promptText });
    
    // Check if this is a schedule call request
    if (checkForScheduleCall(promptText)) {
      isOpen = true;
      createWidget();
      showAdmissionsForm();
      return;
    }
    
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
      body: JSON.stringify({ message: promptText, messageCount: userMessageCount })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log('API Response:', data);
      handleApiResponse(data);
    })
    .catch(handleApiError);
  }

  function createWidget() {
    let container = document.getElementById('proxe-widget-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'proxe-widget-container';
      document.body.appendChild(container);
    }

    // Create or update backdrop overlay
    let backdrop = document.getElementById('proxe-backdrop-overlay');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'proxe-backdrop-overlay';
      backdrop.className = 'proxe-backdrop-overlay';
      document.body.appendChild(backdrop);
    }
    
    if (isOpen) {
      backdrop.classList.add('active');
      // Prevent body scroll when chat is open
      document.body.style.overflow = 'hidden';
    } else {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
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
          manualOpen = true;
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
      
      const sendBtn = document.createElement('button');
      sendBtn.className = 'proxe-searchbar-send-btn';
      sendBtn.innerHTML = icons.send;
      sendBtn.type = 'button';
      sendBtn.style.display = 'none'; // Hidden by default

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
      
      // Mobile touch-to-scroll
      let touchStartX = 0;
      let touchScrollLeft = 0;
      
      quickButtonsWrapper.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].pageX - quickButtonsWrapper.offsetLeft;
        touchScrollLeft = quickButtonsWrapper.scrollLeft;
      }, { passive: true });
      
      quickButtonsWrapper.addEventListener('touchmove', function(e) {
        if (e.touches.length === 0) return;
        const x = e.touches[0].pageX - quickButtonsWrapper.offsetLeft;
        const walk = (x - touchStartX) * 1.5;
        quickButtonsWrapper.scrollLeft = touchScrollLeft - walk;
      }, { passive: true });

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
      btn2.textContent = 'What programs are offered?';
      btn2.type = 'button';
      btn2.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleQuickButtonClick('What programs are offered?');
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

      // Send handler function
      const handleSearchSend = function() {
        if (!input.value.trim()) return;
        const userMessage = input.value;
        input.value = '';
        manualOpen = true;
        isOpen = true;
        sendBtn.style.display = 'none'; // Hide send button after sending
        
        // Add user message
        userMessageCount += 1;
        messages.push({ type: 'user', text: userMessage });
        
        // Check if this is a schedule call request
        if (checkForScheduleCall(userMessage)) {
          createWidget();
          showAdmissionsForm();
          return;
        }
        
        messages.push({ 
          type: 'ai', 
          text: '<div class="proxe-skeleton-loader"><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div></div>',
          isLoading: true
        });
        createWidget();
        
        fetch(API_CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, messageCount: userMessageCount })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          console.log('API Response:', data);
          handleApiResponse(data);
        })
        .catch(handleApiError);
      };
      
      // Send button click handler
      sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleSearchSend();
      });
      
      // Show buttons and send button on search focus
      input.addEventListener('focus', function() {
        if (messages.length > 0) {
          isOpen = true;
          createWidget();
          return;
        }
        if (!formShown) {
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
        const userMessage = chatInput.value;
        userMessageCount += 1;
        messages.push({ type: 'user', text: userMessage });
        chatInput.value = '';
        renderMessages();

        // Check if this is a schedule call request
        if (checkForScheduleCall(userMessage)) {
          showAdmissionsForm();
          return;
        }

        messages.push({ 
          type: 'ai', 
          text: '<div class="proxe-skeleton-loader"><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div><div class="proxe-skeleton-line"></div></div>',
          isLoading: true
        });
        renderMessages();

        fetch(API_CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, messageCount: userMessageCount })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          console.log('API Response:', data);
          handleApiResponse(data);
        })
        .catch(handleApiError);
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

      // Only auto-focus if user manually opened chat (not via button click)
      if (manualOpen) {
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
      manualOpen = false; // Reset for next time
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
      const backdrop = document.getElementById('proxe-backdrop-overlay');
      if (backdrop) {
        backdrop.classList.remove('active');
      }
      document.body.style.overflow = '';
      createWidget();
    }
  };
})();