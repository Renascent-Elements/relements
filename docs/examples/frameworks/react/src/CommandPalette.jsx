import { useEffect, useRef, useState } from "react";
import { enhanceDialog } from "@relements/core/behaviors/dialog";
import { enhanceCommandPalette } from "@relements/core/behaviors/command-palette";

export default function CommandPalette() {
  const wrapRef = useRef(null);
  const [renders, setRenders] = useState(0);

  useEffect(() => {
    // enhanceDialog wires #cmd-open → #cmdk; enhanceCommandPalette applies
    // combobox/listbox ARIA to existing nodes and injects an sr-only role=status
    // announcer as a SIBLING of the list (additive — it never moves author DOM),
    // so nothing React rendered is reparented.
    const dialog = enhanceDialog(wrapRef.current);
    const cmd = enhanceCommandPalette(wrapRef.current);
    return () => {
      dialog.destroy();
      cmd.destroy();
    };
  }, []);

  return (
    <section id="cmd-wrap" aria-labelledby="cmd-h" ref={wrapRef}>
      <h2 id="cmd-h">enhanceCommandPalette</h2>
      <p>
        <button id="cmd-rerender" type="button" onClick={() => setRenders((n) => n + 1)}>
          Re-render
        </button>{" "}
        <output id="cmd-renders">{renders}</output> renders
      </p>
      <button
        id="cmd-open"
        type="button"
        className="re-button"
        data-re-dialog-trigger=""
        data-re-dialog-target="cmdk"
      >
        Search
      </button>
      <dialog
        id="cmdk"
        className="re-dialog re-command-palette"
        aria-label="Commands"
        data-re-dialog-close-on-backdrop=""
        data-re-command-palette=""
      >
        <form className="re-command-palette__search" role="search" method="dialog">
          <input
            type="search"
            className="re-command-palette__input"
            id="cmd-input"
            autoComplete="off"
            aria-label="Search commands"
          />
          <button type="submit" className="re-sr-only" data-re-dialog-close="">
            Close
          </button>
        </form>
        <ul className="re-command-palette__list">
          <li className="re-command-palette__item">
            <a href="#alpha" className="re-command-palette__action">
              <span className="re-command-palette__item-label">Alpha</span>
            </a>
          </li>
          <li className="re-command-palette__item">
            <a href="#beta" className="re-command-palette__action">
              <span className="re-command-palette__item-label">Beta</span>
            </a>
          </li>
        </ul>
        <div className="re-command-palette__empty" hidden>
          <div className="re-empty-state" data-size="sm" role="status">
            <p className="re-empty-state__description">No results.</p>
          </div>
        </div>
      </dialog>
    </section>
  );
}
