import { useEffect, useState } from "react";
import { ensureDataLayer, subscribeToDataLayer } from "../lib/analytics";

export function AnalyticsDebugger() {
  const [events, setEvents] = useState(() => [...ensureDataLayer()]);

  useEffect(
    () =>
      subscribeToDataLayer(() => {
        setEvents([...ensureDataLayer()]);
      }),
    [],
  );

  return (
    <details className="analytics-debugger">
      <summary>Analytics debugger ({events.length})</summary>
      <ol>
        {events
          .slice(-8)
          .reverse()
          .map((event, index) => (
            <li key={`${event.event}-${events.length - index}`}>
              <code>{JSON.stringify(event, null, 2)}</code>
            </li>
          ))}
      </ol>
    </details>
  );
}
