'use strict';

/**
 * Pairing screen.
 *
 * The only screen shown on first run, and the only place a human types anything.
 * Everything here is in service of getting one code entered correctly by someone
 * who is standing at a till and would rather be doing something else.
 */

const codeInput = document.getElementById('code');
const pairButton = document.getElementById('pair');
const message = document.getElementById('message');

/**
 * @param {'error'|'success'|'info'} kind
 * @param {string} text
 */
function show(kind, text) {
  message.className = `message show ${kind}`;
  message.textContent = text;
}

function clearMessage() {
  message.className = 'message';
  message.textContent = '';
}

/**
 * Formats what the user is typing into FKN-XXXX-XXXX-XXXX as they go.
 *
 * People paste codes with spaces, type them in lowercase, and forget the dashes.
 * Rejecting any of that would be hostile; silently fixing it costs a few lines.
 *
 * @param {string} raw
 * @returns {string}
 */
function formatCode(raw) {
  // Keep only the characters a code can contain, then re-insert the dashes.
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 15); // FKN + 12 payload characters

  const parts = [];

  if (cleaned.length > 0) parts.push(cleaned.slice(0, 3));
  if (cleaned.length > 3) parts.push(cleaned.slice(3, 7));
  if (cleaned.length > 7) parts.push(cleaned.slice(7, 11));
  if (cleaned.length > 11) parts.push(cleaned.slice(11, 15));

  return parts.join('-');
}

codeInput.addEventListener('input', () => {
  const formatted = formatCode(codeInput.value);

  // Only rewrite the field when the value actually changed, otherwise the caret
  // jumps to the end on every keystroke and editing the middle becomes painful.
  if (codeInput.value !== formatted) {
    codeInput.value = formatted;
  }

  clearMessage();
});

codeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') pair();
});

async function pair() {
  const code = codeInput.value.trim();

  if (!code) {
    show('error', 'Enter the pairing code from your dashboard.');
    codeInput.focus();
    return;
  }

  pairButton.disabled = true;
  codeInput.disabled = true;
  pairButton.innerHTML = '<span class="spin"></span>Pairing…';

  clearMessage();

  try {
    const result = await window.fikranova.pair(code);

    if (!result.ok) {
      show('error', result.error.message);

      pairButton.disabled = false;
      codeInput.disabled = false;
      pairButton.textContent = 'Pair this device';

      codeInput.focus();
      codeInput.select();
      return;
    }

    show('success', `Paired with ${result.data.restaurantName}. This window will close.`);
    pairButton.textContent = 'Paired';

    // The main process closes this window once pairing completes; the delay is
    // purely so the success message is readable.
  } catch (error) {
    show('error', `Something went wrong: ${error.message}`);

    pairButton.disabled = false;
    codeInput.disabled = false;
    pairButton.textContent = 'Pair this device';
  }
}

pairButton.addEventListener('click', pair);

codeInput.focus();
