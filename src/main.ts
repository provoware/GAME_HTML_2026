import './styles/base.css';

const app = document.querySelector<HTMLElement>('#app');

if (app === null) {
  throw new Error('App-Container #app wurde nicht gefunden.');
}

app.textContent = 'PPPoppi 1986 — Euronen, Ehre, Untergrund';
