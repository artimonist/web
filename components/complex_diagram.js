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
  width: 120px;
  height: 60px;
  resize: none;
  text-align: center;

  overflow: hidden;
  border: 1px solid #e5e4e9;
  border-radius: 5px;
  padding-top: 10px;

  font-size: 36px;
  line-height: 1.2;
  text-wrap-style: pretty;
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
}`;
var cell = `<textarea required maxlength="50" placeholder=" " class="cell" spellcheck="false"></textarea>`;

var template = document.createElement("template");
template.id = "ComplexDiagram";
template.innerHTML = `<style>${css}</style>${cell.repeat(49)}`;
document.body.append(template);

var unicode_limit = (s, n) => Array.from(s ?? '').length > 1 ? Array.from(s).slice(0, n).join('') : s;
var unicode_tip = (s) => Array.from(s ?? '').map(c => `\\u\{${c.codePointAt(0).toString(16)}\}`).join('');

class ComplexDiagram extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(
      document.getElementById('ComplexDiagram').content.cloneNode(true)
    );
    this.$cells = Array.from(shadow.querySelectorAll('.cell'));

    shadow.addEventListener('input', (e) => {
      // prevent newline character, newlines are not allowed.
      let s = e.target.value.replace(/\r?\n/gi, '');
      // limit characters length to 20. (most words are less than 20 characters in length)
      e.target.value = unicode_limit(s, 20);
      e.target.title = unicode_tip(e.target.value);
      // auto ajust font-size, none characters hide.
      let t = e.target;
      let n = 36;
      t.style.fontSize = `${n}px`;
      while (t.clientHeight < t.scrollHeight) {
        t.style.fontSize = `${--n}px`;
      }
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
      let value = unicode_limit(v);
      this.$cells[i].value = value;
      this.$cells[i].title = unicode_tip(value);
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
customElements.define('complex-diagram', ComplexDiagram)
