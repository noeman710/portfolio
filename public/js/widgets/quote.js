/* Design quote widget
   Rotating design quotes. */

const designQuotes = [
  'Good design is as little design as possible.',
  'Structure first, ornament when it is earned.',
  'A user should never have to think about the interface.',
  'Every pixel should have a reason to exist.',
  'Research is the part nobody sees and the part that matters most.',
  'The grid is a promise you make to the user.',
  'If it needs a tutorial, the design failed first.',
];

function initQuoteWidget() {
  const ps = document.querySelectorAll('.widget-quote p');
  const btns = document.querySelectorAll('.widget-quote button');
  if (!ps.length) return;
  let last = -1;
  function next() {
    let i = Math.floor(Math.random() * designQuotes.length);
    if (i === last) i = (i + 1) % designQuotes.length;
    last = i;
    ps.forEach((p) => { p.textContent = designQuotes[i]; });
  }
  next();
  btns.forEach((btn) => btn.addEventListener('click', () => { Sound.click(); next(); }));
}
