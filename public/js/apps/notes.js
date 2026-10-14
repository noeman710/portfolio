/* Notes app
   Autosaves to localStorage. */

function initNotes() {
  const textarea = document.querySelector('.notes-editor textarea');
  const status = document.querySelector('.notes-status');
  if (!textarea) return;

  const defaultNote = 'Feel free to play with this Notes app.\n\nIt actually saves what you type, right here in your browser.';
  let saved = null;
  try { saved = localStorage.getItem('icon_notes_content'); } catch (e) {}
  textarea.value = saved !== null ? saved : defaultNote;

  let timeout;
  textarea.addEventListener('input', () => {
    if (status) status.textContent = 'Editing…';
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      try { localStorage.setItem('icon_notes_content', textarea.value); } catch (e) {}
      if (status) status.textContent = 'Saved just now';
    }, 500);
  });
}
