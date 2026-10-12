// The catalog stays in normal document flow; no iframe or nested scroll area.
const root = document.querySelector('[data-realistic-library]');
if (root) {
  const records = new Map(JSON.parse(document.getElementById('book-catalog-data').textContent).map(book => [String(book.id), book]));
  const room = root.querySelector('.book-reading-room');
  const stage = room.querySelector('.reading-book-stage');
  const heading = room.querySelector('h3');
  const close = room.querySelector('.reading-close');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...root.querySelectorAll('.book-button')];
  let selected = null;
  let generation = 0;
  let flights = [];

  function stopFlights() {
    generation++;
    flights.forEach(({ node, animations }) => {
      animations.forEach(animation => animation.cancel());
      node.remove();
    });
    flights = [];
  }

  function reset() {
    stopFlights();
    buttons.forEach(button => {
      button.classList.remove('is-selected', 'is-neighbor');
      button.setAttribute('aria-expanded', 'false');
    });
    selected = null;
    stage.replaceChildren();
    room.hidden = true;
    close.disabled = false;
  }

  function setMetadata(book) {
    heading.textContent = book.title;
    room.querySelector('.reading-book-author').textContent = book.author;
    for (const [selector, value] of [
      ['.reading-book-year', book.year],
      ['.reading-book-rating', book.rating ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : null],
      ['.reading-book-review', book.review],
    ]) {
      const element = room.querySelector(selector);
      element.hidden = !value;
      element.textContent = value || '';
    }
    const rating = room.querySelector('.reading-book-rating');
    if (book.rating) rating.setAttribute('aria-label', `My rating: ${book.rating} out of 5`);
    else rating.removeAttribute('aria-label');
  }

  function cloneVolume(button, book) {
    const volume = button.querySelector('.book-volume').cloneNode(true);
    const computed = getComputedStyle(button);
    for (const property of ['--cloth', '--foil', '--h', '--d', '--lean', '--cover-w']) {
      volume.style.setProperty(property, computed.getPropertyValue(property));
    }
    for (const [selector, className] of [['.cover-outside', 'cover-author'], ['.book-title-page', 'title-page-author']]) {
      const author = document.createElement('span');
      author.className = className;
      author.textContent = book.author;
      volume.querySelector(selector).append(author);
    }
    return volume;
  }

  // Scroll the document only, before measuring animation endpoints.
  function revealRoom() {
    const bottom = room.getBoundingClientRect().bottom;
    if (bottom <= innerHeight - 18) return;
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: scrollY + bottom - innerHeight + 18, behavior: 'instant' });
    document.documentElement.style.scrollBehavior = previous;
  }

  async function flight(button, volume, returning = false) {
    if (reduced.matches) return;
    const ticket = generation;
    const sourceBox = button.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const stacked = button.classList.contains('stacked-book');
    const stackScale = getComputedStyle(button.parentElement).getPropertyValue('--stack-scale').trim();
    const sourceTransform = stacked
      ? `translate(-50%,-50%) rotateZ(90deg) rotateY(88deg) scale(${stackScale})`
      : 'translateX(-50%) rotateY(88deg) rotateZ(var(--lean,0deg))';
    const targetStyle = getComputedStyle(volume);
    const dx = stageBox.left + stageBox.width / 2 - (sourceBox.left + sourceBox.width / 2);
    const dy = stageBox.top + 26 - sourceBox.top;
    const node = document.createElement('div');
    node.className = 'book-flight';
    node.setAttribute('aria-hidden', 'true');
    Object.assign(node.style, { left: `${sourceBox.left + scrollX}px`, top: `${sourceBox.top + scrollY}px`, width: `${sourceBox.width}px`, height: `${sourceBox.height}px` });
    const model = volume.cloneNode(true);
    model.style.visibility = 'visible';
    model.querySelector('.book-cover-front').classList.remove('is-open');
    node.append(model);
    document.body.append(node);
    const positions = [
      { transform: 'translate(0,0)' },
      { transform: `translate(${dx}px,${dy}px)` },
    ];
    const rotations = [
      { transform: sourceTransform, top: stacked ? `${sourceBox.height / 2}px` : '0px' },
      { transform: targetStyle.transform, top: '0px' },
    ];
    if (returning) { positions.reverse(); rotations.reverse(); }
    const options = { duration: returning ? 650 : 780, easing: 'cubic-bezier(.22,.65,.2,1)', fill: 'both' };
    const animations = [node.animate(positions, options), model.animate(rotations, options)];
    flights.push({ node, animations });
    try { await Promise.all(animations.map(animation => animation.finished)); }
    catch { /* A new selection, resize or return cancels the previous flight. */ }
    node.remove();
    flights = flights.filter(entry => entry.node !== node);
    if (ticket !== generation) return;
  }

  async function openBook(button) {
    if (button === selected) { await returnBook(); return; }
    reset();
    const book = records.get(button.dataset.bookId);
    if (!book) return;
    selected = button;
    const ticket = generation;
    const row = button.closest('.wood-row');
    row.after(room);
    setMetadata(book);
    const volume = cloneVolume(button, book);
    stage.append(volume);
    room.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    revealRoom();
    button.classList.add('is-selected');
    const siblings = [...row.querySelectorAll('.upright-book .book-button')];
    const index = siblings.indexOf(button);
    if (index >= 0) {
      for (const [neighbor, direction] of [[siblings[index - 1], -1], [siblings[index + 1], 1]]) {
        if (!neighbor) continue;
        neighbor.style.setProperty('--nudge', `${direction * 1.1}deg`);
        neighbor.classList.add('is-neighbor');
      }
    }
    if (!reduced.matches) volume.style.visibility = 'hidden';
    await flight(button, volume);
    if (ticket !== generation) return;
    volume.style.visibility = 'visible';
    // Let the closed cover paint before articulating its hinge.
    if (!reduced.matches) await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (ticket !== generation) return;
    volume.querySelector('.book-cover-front').classList.add('is-open');
    heading.focus({ preventScroll: true });
  }

  async function returnBook() {
    if (!selected) return;
    stopFlights();
    const ticket = generation;
    const button = selected;
    const volume = stage.querySelector('.book-volume');
    close.disabled = true;
    volume.style.visibility = 'visible';
    volume.querySelector('.book-cover-front').classList.remove('is-open');
    if (!reduced.matches) await new Promise(resolve => setTimeout(resolve, 520));
    if (ticket !== generation) { close.disabled = false; return; }
    if (!reduced.matches) volume.style.visibility = 'hidden';
    await flight(button, volume, true);
    if (ticket !== generation) { close.disabled = false; return; }
    reset();
    close.disabled = false;
    button.focus({ preventScroll: true });
  }

  buttons.forEach(button => {
    button.addEventListener('click', event => { event.preventDefault(); openBook(button); });
    button.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); openBook(button); }
    });
  });
  close.addEventListener('click', returnBook);
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected) { event.preventDefault(); returnBook(); }
  });
  root.closest('.library-page').addEventListener('catalog-reset', () => { reset(); close.disabled = false; });
  root.closest('.library-page').addEventListener('library-category', () => {
    root.classList.add('is-arriving');
    setTimeout(() => root.classList.remove('is-arriving'), 650);
  });
  // A viewport change must not leave a detached animation over the new layout.
  window.addEventListener('resize', () => {
    stopFlights();
    const volume = stage.querySelector('.book-volume');
    if (volume) { volume.style.visibility = 'visible'; volume.querySelector('.book-cover-front').classList.add('is-open'); }
    close.disabled = false;
  });
}
