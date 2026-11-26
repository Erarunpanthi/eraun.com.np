(() => {
  const host = document.querySelector('main') || document.getElementById('main-content') || document.body;
  if (!host) return;

  host.classList.add('note-pen-surface');
  const layer = document.createElement('div');
  layer.className = 'note-pen-layer';
  layer.setAttribute('aria-label', 'Drawing layer');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  layer.append(canvas);
  host.append(layer);

  const toolbar = document.createElement('div');
  toolbar.className = 'note-pen-toolbar';
  toolbar.innerHTML = `
    <div class="note-pen-panel" hidden>
      <div class="note-pen-heading">Page annotations</div>
      <div class="note-pen-row" aria-label="Choose pen color">
        <span class="note-pen-label">Color</span>
        <button type="button" class="note-pen-color" style="--pen-color:#d32f2f" data-color="#d32f2f" aria-label="Red pen" aria-pressed="false"></button>
        <button type="button" class="note-pen-color" style="--pen-color:#1565c0" data-color="#1565c0" aria-label="Blue pen" aria-pressed="true"></button>
        <button type="button" class="note-pen-color" style="--pen-color:#2e7d32" data-color="#2e7d32" aria-label="Green pen" aria-pressed="false"></button>
        <button type="button" class="note-pen-color" style="--pen-color:#212121" data-color="#212121" aria-label="Black pen" aria-pressed="false"></button>
      </div>
      <div class="note-pen-row">
        <label class="note-pen-label" for="note-pen-size">Size</label>
        <input id="note-pen-size" type="range" min="1" max="12" value="3" aria-label="Pen size">
      </div>
      <div class="note-pen-row">
        <button type="button" class="note-pen-action" data-action="erase" aria-pressed="false">Eraser</button>
        <button type="button" class="note-pen-action" data-action="undo">Undo</button>
        <button type="button" class="note-pen-action" data-action="clear">Clear</button>
      </div>
      <p class="note-pen-help">Draw over the notes. Your marks are saved in this browser on this device.</p>
    </div>
    <button type="button" class="note-pen-toggle" aria-expanded="false">✎ Annotate</button>`;
  document.body.append(toolbar);

  const panel = toolbar.querySelector('.note-pen-panel');
  const toggle = toolbar.querySelector('.note-pen-toggle');
  const sizeInput = toolbar.querySelector('#note-pen-size');
  const storageKey = `psc-note-annotations:${window.location?.pathname || 'notes'}`;
  let color = '#1565c0';
  let size = 3;
  let erasing = false;
  let strokes = [];
  let activeStroke = null;
  let context = canvas.getContext('2d');

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) strokes = stored;
  } catch (_error) {
    strokes = [];
  }

  const paintStroke = (stroke) => {
    if (!stroke?.points?.length) return;
    context.save();
    context.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
    context.strokeStyle = stroke.color || color;
    context.lineWidth = Number(stroke.size) || size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);
    if (stroke.points.length === 1) {
      context.lineTo(stroke.points[0].x + 0.01, stroke.points[0].y + 0.01);
    } else {
      stroke.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    }
    context.stroke();
    context.restore();
  };

  const redraw = () => {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.scale(canvas.width / Math.max(1, host.clientWidth), canvas.height / Math.max(1, host.scrollHeight));
    strokes.forEach(paintStroke);
    if (activeStroke) paintStroke(activeStroke);
    context.restore();
  };

  const resize = () => {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.scrollHeight);
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context = canvas.getContext('2d');
    redraw();
  };

  const save = () => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(strokes)); }
    catch (_error) { /* Annotations remain on screen for this visit if storage is unavailable. */ }
  };

  const pointFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (host.clientWidth / Math.max(1, rect.width)),
      y: (event.clientY - rect.top) * (host.scrollHeight / Math.max(1, rect.height))
    };
  };

  canvas.addEventListener('pointerdown', (event) => {
    if (!layer.classList.contains('is-drawing')) return;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    activeStroke = { color, size, erase: erasing, points: [pointFromEvent(event)] };
    redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!activeStroke) return;
    activeStroke.points.push(pointFromEvent(event));
    redraw();
  });
  const finishStroke = () => {
    if (!activeStroke) return;
    strokes.push(activeStroke);
    activeStroke = null;
    save();
    redraw();
  };
  canvas.addEventListener('pointerup', finishStroke);
  canvas.addEventListener('pointercancel', finishStroke);

  toggle.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (!open) {
      layer.classList.remove('is-drawing');
      toggle.textContent = '✎ Annotate';
      toggle.setAttribute('aria-pressed', 'false');
    }
  });
  const drawButton = document.createElement('button');
  drawButton.type = 'button';
  drawButton.className = 'note-pen-action';
  drawButton.dataset.action = 'draw';
  drawButton.textContent = 'Draw';
  toolbar.querySelector('.note-pen-row').after(drawButton);
  drawButton.addEventListener('click', () => {
    const drawing = !layer.classList.contains('is-drawing');
    layer.classList.toggle('is-drawing', drawing);
    drawButton.setAttribute('aria-pressed', String(drawing));
    toggle.textContent = drawing ? '✎ Stop drawing' : '✎ Annotate';
    toggle.setAttribute('aria-pressed', String(drawing));
  });

  toolbar.querySelectorAll('.note-pen-color').forEach((button) => {
    button.addEventListener('click', () => {
      color = button.dataset.color || '#1565c0';
      erasing = false;
      toolbar.querySelector('[data-action="erase"]').setAttribute('aria-pressed', 'false');
      toolbar.querySelectorAll('.note-pen-color').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  sizeInput.addEventListener('input', () => { size = Number(sizeInput.value) || 3; });
  toolbar.querySelector('[data-action="erase"]').addEventListener('click', (event) => {
    erasing = !erasing;
    event.currentTarget.setAttribute('aria-pressed', String(erasing));
  });
  toolbar.querySelector('[data-action="undo"]').addEventListener('click', () => {
    strokes.pop(); save(); redraw();
  });
  toolbar.querySelector('[data-action="clear"]').addEventListener('click', () => {
    strokes = []; save(); redraw();
  });

  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  window.addEventListener('load', resize, { once: true });
  resize();
})();
