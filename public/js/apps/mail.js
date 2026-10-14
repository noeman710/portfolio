/* Mail app
   Contact form (Web3Forms). */

function initMail() {
  const form = document.querySelector('.mail-form');
  if (!form) return;

  const successBox = document.querySelector('.mail-success');
  const errorBox = document.querySelector('.mail-error');
  const sendAgainBtn = document.querySelector('.mail-send-another-btn');
  const submitBtn = form.querySelector('.mail-send-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) { errorBox.style.display = 'none'; errorBox.textContent = ''; }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = await response.json();

      if (result.success) {
        Sound.open();
        form.reset();
        form.classList.add('is-hidden');
        if (successBox) successBox.classList.add('is-visible');
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = "That didn't go through, please try again or email noeman.elafia@outlook.com directly.";
        errorBox.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  if (sendAgainBtn) {
    sendAgainBtn.addEventListener('click', () => {
      if (successBox) successBox.classList.remove('is-visible');
      form.classList.remove('is-hidden');
    });
  }
}
