document.body.append((() => {
  const css = `
input {
  width: 380px;
  height: 35px;
  padding-left: 5px;
  text-overflow: ellipsis;
  font-size: large;
  border-width: 2px;
  border-radius: 6px;
}
input:focus {
  border-width: 1px;
}
input:valid {
  border-color: #e5e4e9;
  box-shadow: inset -1px -1px 3px #ffffff, inset 1px 1px 3px #aaaaaa;
}
input:invalid,
input.invalid {
  border-color: #ffc0c0;
  border-width: 3px;
  box-shadow: 5px 5px 10px #ff5050, -5px -5px 10px #ffffff;
}`;
  const html = `<input type="text" minlength="5" maxlength="255" required autofocus/>`;

  let template = document.createElement('template');
  template.id = "UnicodePassword";
  template.innerHTML = `<style>${css}</style>${html}`;
  return template;
})());

class UnicodePassword extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(document.getElementById('UnicodePassword').content.cloneNode(true));

    // cell can be filled with only one character
    shadow.addEventListener('input', (e) => {
      let t = e.target;
      Array.from(t.value ?? '').length < 5 ? t.classList.add('invalid') : t.classList.remove('invalid');
    });

    // dispatch custom event
    shadow.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('onchange', { detail: e }));
    });
  }
}
customElements.define('unicode-password', UnicodePassword)

