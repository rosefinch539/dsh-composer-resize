window.__ModuleLoader__.load({
  id: "dsh-composer-resize",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    // ---- CSS: relative card + custom drag handle on the top edge ----
    const css = [
      '[data-composer-card] { position: relative; }',
      '[data-composer-card] [data-input-scroll] { display: flex !important; flex-direction: column !important; }',
      '[data-composer-card] [data-input-scroll] > div { flex: 1 1 auto; }',
      '[data-resize-handle] {',
      '  position: absolute;',
      '  top: -7px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 72px;',
      '  height: 14px;',
      '  cursor: ns-resize;',
      '  z-index: 40;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: transparent;',
      '  border: none;',
      '  padding: 0;',
      '  touch-action: none;',
      '  user-select: none;',
      '}',
      '[data-resize-handle]::before {',
      '  content: "";',
      '  width: 40px;',
      '  height: 4px;',
      '  border-radius: 2px;',
      '  background: var(--dsw-alias-label-caption, rgba(148, 163, 184, 0.55));',
      '  transition: background 0.15s ease, width 0.15s ease;',
      '}',
      '[data-resize-handle]:hover::before,',
      '[data-resize-handle][data-dragging="true"]::before {',
      '  width: 56px;',
      '  background: var(--dsw-alias-label-secondary, rgba(100, 116, 139, 0.9));',
      '}'
    ].join('\n');

    const tagId = "dsh-composer-resize/style.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-composer-resize";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    const MIN_HEIGHT = 52;
    const MAX_HEIGHT = () => Math.max(MIN_HEIGHT, Math.min(Math.round(window.innerHeight * 0.75), 720));

    /**
     * Install a custom drag handle on every composer card.
     * The handle sits on the TOP edge of the card, so the drag direction
     * matches the deformation direction: drag up = taller, drag down = shorter.
     * The scroll area is bottom-anchored while dragging, so shrinking a long
     * draft keeps the last lines in view.
     */
    function attachHandles() {
      if (typeof document === "undefined") return;
      document.querySelectorAll('[data-composer-card]').forEach((card) => {
        if (card.querySelector('[data-resize-handle]')) return;
        const scroll = card.querySelector('[data-input-scroll]');
        if (!scroll) return;

        const handle = document.createElement("div");
        handle.dataset.resizeHandle = "true";
        handle.setAttribute("aria-hidden", "true");

        let startY = 0;
        let startHeight = 0;
        let dragging = false;

        const applyHeight = (h) => {
          scroll.style.height = h + "px";
          scroll.style.maxHeight = h + "px";
          requestAnimationFrame(() => {
            scroll.scrollTop = scroll.scrollHeight;
          });
        };

        const onPointerDown = (event) => {
          if (event.button !== 0 && event.pointerType === "mouse") return;
          event.preventDefault();
          dragging = true;
          startY = event.clientY;
          const rect = scroll.getBoundingClientRect();
          startHeight = rect.height || scroll.offsetHeight || MIN_HEIGHT;
          handle.dataset.dragging = "true";
          try { handle.setPointerCapture(event.pointerId); } catch (_) {}
        };

        const onPointerMove = (event) => {
          if (!dragging) return;
          // Dragging up: clientY decreases, delta positive -> taller.
          const delta = startY - event.clientY;
          const target = Math.round(startHeight + delta);
          const clamped = Math.max(MIN_HEIGHT, Math.min(target, MAX_HEIGHT()));
          applyHeight(clamped);
        };

        const endDrag = (event) => {
          if (!dragging) return;
          dragging = false;
          delete handle.dataset.dragging;
          try { handle.releasePointerCapture(event.pointerId); } catch (_) {}
          requestAnimationFrame(() => {
            scroll.scrollTop = scroll.scrollHeight;
          });
        };

        handle.addEventListener("pointerdown", onPointerDown);
        handle.addEventListener("pointermove", onPointerMove);
        handle.addEventListener("pointerup", endDrag);
        handle.addEventListener("pointercancel", endDrag);
        card.appendChild(handle);
      });
    }

    const inject = [];

    function apply(ctx) {
      if (typeof document === "undefined") return;
      attachHandles();
      const observer = new MutationObserver(() => attachHandles());
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("resize", attachHandles);
      if (ctx && ctx.logger && typeof ctx.logger.info === "function") {
        ctx.logger.info("[dsh-composer-resize] drag handle installed (up = taller, down = shorter)");
      }
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
