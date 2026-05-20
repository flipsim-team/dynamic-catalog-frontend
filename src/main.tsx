import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Mount the React app into the root DOM node.
createRoot(document.getElementById("root")!).render(<App />);
