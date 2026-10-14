/* Window resizing
   Resize handles on desktop windows. */

function initWindowResize() {
  if (IS_MOBILE) return;
  const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  document.querySelectorAll('.os-window').forEach((win) => {
    if (win.querySelector('.window-resize-handle')) return;

    directions.forEach((dir) => {
      const handle = document.createElement('div');
      handle.className = `window-resize-handle window-resize-${dir}`;
      handle.setAttribute('aria-hidden', 'true');
      win.appendChild(handle);

      let resizing = false;
      let startX, startY, startW, startH, startLeft, startTop;

      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resizing = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = win.getBoundingClientRect();
        startW = rect.width;
        startH = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        win.style.width = startW + 'px';
        win.style.height = startH + 'px';
        win.style.left = startLeft + 'px';
        win.style.top = startTop + 'px';
        win.classList.add('is-resizing');
        const id = win.id.replace('win-', '');
        if (WM && WM.focus) WM.focus(id);
        handle.setPointerCapture(e.pointerId);
      });

      handle.addEventListener('pointermove', (e) => {
        if (!resizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const minW = 340;
        const minH = 260;
        const maxW = window.innerWidth - 40;
        const maxH = window.innerHeight - 80;

        if (dir.includes('e')) {
          win.style.width = Math.min(maxW, Math.max(minW, startW + dx)) + 'px';
        }
        if (dir.includes('s')) {
          win.style.height = Math.min(maxH, Math.max(minH, startH + dy)) + 'px';
        }
        if (dir.includes('w')) {
          const proposedW = Math.min(maxW, Math.max(minW, startW - dx));
          win.style.width = proposedW + 'px';
          win.style.left = (startLeft + (startW - proposedW)) + 'px';
        }
        if (dir.includes('n')) {
          const proposedH = Math.min(maxH, Math.max(minH, startH - dy));
          win.style.height = proposedH + 'px';
          win.style.top = Math.max(28, startTop + (startH - proposedH)) + 'px';
        }
      });

      ['pointerup', 'pointercancel'].forEach((evt) => {
        handle.addEventListener(evt, () => {
          resizing = false;
          win.classList.remove('is-resizing');
        });
      });
    });
  });
}
