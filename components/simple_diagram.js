var css = `
:host {
  display: inline-grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  place-content: center;
  gap: 3px;
  border: 1px solid #e5e4e9;
}
.cell {
  width: 60px;
  height: 45px;
  resize: none;
  font-size: 5.8vh;
  text-align: center;
  line-height: 100%;

  overflow: hidden;
  border: 1px solid #e5e4e9;
  border-radius: 5px;
  padding-top: 12px;
}
.cell:hover {
  box-shadow: 5px 5px 10px #aaaaaa, -5px -5px 10px #ffffff;
}
.cell:nth-of-type(7n+4),
.cell:nth-of-type(n + 22):nth-of-type(-n + 28),
.cell:nth-of-type(28n + 9),
.cell:nth-of-type(28n + 13) {
  background-color: #f5f5f5;
}
.cell:valid {
  box-shadow: inset -1px -1px 3px #ffffff, inset 1px 1px 3px #aaaaaa;
}
#tooltip {
    background: #fff;
    border: 1px solid red;
    padding: 3px 10px;
}`;
var cell = `<textarea required maxlength="2" placeholder=" " class="cell"></textarea>`;

var template = document.createElement("template");
template.id = "SimpleDiagram";
template.innerHTML = `<style>${css}</style>${cell.repeat(49)}`;
document.body.append(template);

var unicode_first = (s) => Array.from(s ?? '').length > 1 ? Array.from(s).slice(0, 1).join("") : s;
var unicode_tip = (s) => s ? `\\u\{${s.codePointAt(0).toString(16)}\}` : ``;

class SimpleDiagram extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(
      document.getElementById('SimpleDiagram').content.cloneNode(true)
    );
    this.$cells = Array.from(shadow.querySelectorAll('.cell'));

    // cell can be filled with only one character
    shadow.addEventListener('input', (e) => {
      e.target.value = unicode_first(e.target.value);
      e.target.title = unicode_tip(e.target.value);
    });

    // dispatch custom event
    shadow.addEventListener('change', (e) => {
      this.dispatchEvent(
        new CustomEvent('onchange', { detail: e })
      );
    });
  }

  is_empty() {
    return this.$cells.every(e => e.value === '');
  }

  get values() {
    return JSON.stringify(this.$cells.map(e => e.value));
  }

  set values(value) {
    JSON.parse(value).forEach((v, i) => {
      this.$cells[i].value = unicode_first(v);
      this.$cells[i].title = unicode_tip(v);
    });
  }

  static get observedAttributes() {
    return ['values'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
    this.render();
  }

  render() {
  }
}
customElements.define('simple-diagram', SimpleDiagram)
