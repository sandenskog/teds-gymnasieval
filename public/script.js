// --- i18n ---
const translations = {
  en: {
    hero_title: "Ted is starting high school!",
    hero_subtitle: "New adventures await in fall 2026",
    nav_photos: "Photos",
    nav_choices: "School choices",
    nav_guestbook: "Guestbook",
    photos_title: "Ted in photos",
    choices_title: "Ted's school choices",
    choices_intro: "Ted has applied to the Arts programme at 16 different schools. Here's the full list in order of priority:",
    choice_1: "Aesthetics & media",
    choice_2: "Aesthetics & media, Film",
    choice_3: "Aesthetics & media, Digital creation",
    choice_4: "Aesthetics & media, Society profile",
    choice_5: "Art & design, Graphic design",
    choice_6: "Art & design",
    choice_7: "Art & design",
    choice_8: "Art & design, Art and design",
    choice_9: "Art & design, Design",
    choice_10: "Aesthetics & media, Digital design",
    choice_11: "Art & design, Graphic design",
    choice_12: "Art & design, Graphic design",
    choice_13: "Aesthetics & media",
    choice_14: "Aesthetics & media, Photo",
    choice_15: "Aesthetics & media, Photography",
    choice_16: "Aesthetics & media, Digital design",
    guestbook_title: "Write a message for Ted!",
    guestbook_intro: "Got a wish, a funny memory or some good advice? Write it here!",
    form_name_label: "Your name",
    form_name_placeholder: "Who are you?",
    form_message_label: "Your message",
    form_message_placeholder: "Write something nice, funny or wise...",
    form_submit: "Send message",
    form_sending: "Sending...",
    no_comments: "No messages yet. Be the first!",
    load_error: "Could not load messages.",
    submit_error: "Something went wrong. Try again!",
    footer: "Good luck Ted! We're cheering for you.",
    page_title: "Ted is starting high school!",
  },
};

const isEnglish = navigator.language.startsWith('en');
const lang = isEnglish ? 'en' : 'sv';

function t(key, fallback) {
  if (lang === 'sv') return fallback;
  return translations.en[key] || fallback;
}

function applyTranslations() {
  if (lang === 'sv') return;

  document.documentElement.lang = 'en';
  document.title = translations.en.page_title;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations.en[key]) {
      el.textContent = translations.en[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations.en[key]) {
      el.placeholder = translations.en[key];
    }
  });
}

applyTranslations();

// --- Guestbook ---
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
const submitBtn = document.getElementById('submit-btn');

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(isEnglish ? 'en-US' : 'sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderComment(comment) {
  return `
    <div class="comment">
      <div class="comment-header">
        <span class="comment-name">${escapeHtml(comment.name)}</span>
        <span class="comment-date">${formatDate(comment.date)}</span>
      </div>
      <p class="comment-message">${escapeHtml(comment.message)}</p>
    </div>
  `;
}

async function loadComments() {
  try {
    const res = await fetch('/api/comments');
    const comments = await res.json();

    if (comments.length === 0) {
      commentsList.innerHTML = `<p class="no-comments">${t('no_comments', 'Inga hälsningar ännu. Bli den första!')}</p>`;
      return;
    }

    commentsList.innerHTML = comments
      .reverse()
      .map(renderComment)
      .join('');
  } catch {
    commentsList.innerHTML = `<p class="no-comments">${t('load_error', 'Kunde inte ladda hälsningar.')}</p>`;
  }
}

commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !message) return;

  submitBtn.disabled = true;
  submitBtn.textContent = t('form_sending', 'Skickar...');

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });

    if (!res.ok) throw new Error('Error');

    commentForm.reset();
    await loadComments();
  } catch {
    alert(t('submit_error', 'Något gick fel. Försök igen!'));
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = t('form_submit', 'Skicka hälsning');
  }
});

loadComments();
