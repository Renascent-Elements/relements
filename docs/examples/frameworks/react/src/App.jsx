import { useEffect, useRef, useState } from "react";
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import "@relements/core/elements/re-tabs";

export default function App() {
  const enhancedRef = useRef(null);
  const ceRef = useRef(null);
  const [lastTab, setLastTab] = useState("none");

  useEffect(() => {
    const controller = enhanceTabs(enhancedRef.current);
    const el = ceRef.current;
    const onChange = (event) => setLastTab(event.detail.tabId);
    el.addEventListener("re-change", onChange);
    return () => {
      controller.destroy();
      el.removeEventListener("re-change", onChange);
    };
  }, []);

  return (
    <main style={{ padding: "var(--re-space-8)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>React</h1>

      <p>
        <button className="re-button" type="button">
          Save
        </button>
      </p>

      <section aria-labelledby="enh-h">
        <h2 id="enh-h">enhanceTabs</h2>
        <div className="re-tabs" data-re-tabs id="enhanced" ref={enhancedRef}>
          <div className="re-tabs__list" role="tablist" aria-label="Enhanced">
            <button className="re-tab" role="tab" id="e-tab-1" aria-controls="e-panel-1" aria-selected="true">One</button>
            <button className="re-tab" role="tab" id="e-tab-2" aria-controls="e-panel-2" aria-selected="false" tabIndex={-1}>Two</button>
            <button className="re-tab" role="tab" id="e-tab-3" aria-controls="e-panel-3" aria-selected="false" tabIndex={-1}>Three</button>
          </div>
          <section className="re-tabpanel" role="tabpanel" id="e-panel-1" aria-labelledby="e-tab-1" tabIndex={0}>Panel one</section>
          <section className="re-tabpanel" role="tabpanel" id="e-panel-2" aria-labelledby="e-tab-2" tabIndex={0} hidden>Panel two</section>
          <section className="re-tabpanel" role="tabpanel" id="e-panel-3" aria-labelledby="e-tab-3" tabIndex={0} hidden>Panel three</section>
        </div>
      </section>

      <section aria-labelledby="ce-h">
        <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
        <re-tabs id="ce" ref={ceRef} aria-label="Custom element">
          <div className="re-tabs__list" role="tablist" aria-label="Custom element">
            <button className="re-tab" role="tab" id="c-tab-1" aria-controls="c-panel-1" aria-selected="true">Alpha</button>
            <button className="re-tab" role="tab" id="c-tab-2" aria-controls="c-panel-2" aria-selected="false" tabIndex={-1}>Beta</button>
            <button className="re-tab" role="tab" id="c-tab-3" aria-controls="c-panel-3" aria-selected="false" tabIndex={-1}>Gamma</button>
          </div>
          <section className="re-tabpanel" role="tabpanel" id="c-panel-1" aria-labelledby="c-tab-1" tabIndex={0}>Alpha panel</section>
          <section className="re-tabpanel" role="tabpanel" id="c-panel-2" aria-labelledby="c-tab-2" tabIndex={0} hidden>Beta panel</section>
          <section className="re-tabpanel" role="tabpanel" id="c-panel-3" aria-labelledby="c-tab-3" tabIndex={0} hidden>Gamma panel</section>
        </re-tabs>
        <p>Last tab: <output id="last-tab">{lastTab}</output></p>
      </section>
    </main>
  );
}
