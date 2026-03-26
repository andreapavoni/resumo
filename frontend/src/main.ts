import { render } from "preact";
import { html } from "htm/preact";
import { App } from "./app.js";
import "./styles/tailwind.css";
import "./styles/resume.css";

render(html`<${App} />`, document.getElementById("app")!);
