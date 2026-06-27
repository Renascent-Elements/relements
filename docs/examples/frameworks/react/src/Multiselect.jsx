import { useEffect, useRef, useState } from "react";
import { enhanceMultiSelect } from "@relements/core/behaviors/multiselect";

export default function Multiselect() {
  const wrapRef = useRef(null);
  const [renders, setRenders] = useState(0);

  useEffect(() => {
    // Enhance the WRAPPER, not the <details>: enhanceMultiSelect injects its live
    // region as a sibling via host.after(), so it lands as a trailing child of
    // #ms-wrap — a node React doesn't reconcile against any JSX — instead of
    // between two JSX siblings (which React would reorder/remove on re-render).
    const controller = enhanceMultiSelect(wrapRef.current);
    return () => controller.destroy();
  }, []);

  return (
    <section aria-labelledby="ms-h">
      <h2 id="ms-h">enhanceMultiSelect</h2>
      {/* Above the field: the open (absolutely-positioned) panel must not cover
          this control. Bumping `renders` re-renders this component (reconciling
          the multiselect subtree) without unmounting it. */}
      <p>
        <button id="ms-rerender" type="button" onClick={() => setRenders((n) => n + 1)}>
          Re-render
        </button>{" "}
        <output id="ms-renders">{renders}</output> renders
      </p>
      <div className="re-field">
        <span className="re-field__label" id="ms-label">
          Frameworks
        </span>
        <div id="ms-wrap" ref={wrapRef}>
          <details className="re-multiselect" id="ms" data-re-multiselect>
            <summary className="re-multiselect__summary" aria-labelledby="ms-label ms-value">
              {/* Static text → React never re-renders a changed value, so the
                  behavior's out-of-band writes to it are never reverted. */}
              <span className="re-multiselect__value" id="ms-value" data-placeholder="">
                Select frameworks
              </span>
            </summary>
            <fieldset className="re-multiselect__panel">
              <legend className="re-sr-only">Frameworks</legend>
              <label className="re-multiselect__option">
                <input type="checkbox" className="re-checkbox" name="fw" value="react" /> React
              </label>
              <label className="re-multiselect__option">
                <input type="checkbox" className="re-checkbox" name="fw" value="vue" /> Vue
              </label>
              <label className="re-multiselect__option">
                <input type="checkbox" className="re-checkbox" name="fw" value="svelte" /> Svelte
              </label>
            </fieldset>
          </details>
        </div>
      </div>
    </section>
  );
}
