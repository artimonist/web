use artimonist::{Diagram, Password, SimpleDiagram, Xpriv, BIP85};
use std::{str::FromStr, sync::RwLock};
use wasm_bindgen::prelude::*;

static MASTER_KEY: RwLock<String> = RwLock::new(String::new());

/// init master key by simple diagram
#[wasm_bindgen]
pub fn simple_init(
    values: Vec<String>,
    indices_x: Vec<usize>,
    indices_y: Vec<usize>,
    salt: String,
) {
    let master = {
        let items: Vec<_> = values.into_iter().map(|s| s.chars().next()).collect();
        let indices: Vec<_> = indices_x.into_iter().zip(indices_y).collect();
        let diagram = SimpleDiagram::from_items(items, &indices).expect_throw("invalid parameters");
        diagram
            .to_master(salt.as_bytes())
            .expect_throw("message error")
    };
    let mut master_mut = MASTER_KEY.write().unwrap();
    *master_mut = master.to_string();
}

#[wasm_bindgen]
pub fn mnemonic_list() -> Vec<String> {
    let mk = MASTER_KEY.read().unwrap();
    if mk.is_empty() {
        return vec![];
    }
    let xpriv = Xpriv::from_str(mk.as_str()).expect_throw("xpriv error");
    xpriv
        .bip85_mnemonic_list(Default::default(), 1)
        .expect_throw("mnemonic error")
        .to_vec()
}

#[wasm_bindgen]
pub fn wallet_list(min: u32, max: u32) -> Vec<String> {
    if !(1..=20).contains(&min) || !(1..=20).contains(&max) {
        return Default::default();
    }
    let mk = MASTER_KEY.read().unwrap();
    if mk.is_empty() {
        return Default::default();
    }
    let xpriv = Xpriv::from_str(mk.as_str()).expect_throw("xpriv error");
    (min..=max)
        .map(|i| xpriv.bip85_wif(i).unwrap().extra_address())
        .map(|(addr, pk)| format!("{},{}", addr, pk))
        .collect()
}

#[wasm_bindgen]
pub fn xpriv_list(min: u32, max: u32) -> Vec<String> {
    if !(1..=20).contains(&min) || !(1..=20).contains(&max) {
        return Default::default();
    }
    let mk = MASTER_KEY.read().unwrap();
    if mk.is_empty() {
        return Default::default();
    }
    let xpriv = Xpriv::from_str(mk.as_str()).expect_throw("xpriv error");
    (min..=max).map(|i| xpriv.bip85_xpriv(i).unwrap()).collect()
}

#[wasm_bindgen]
pub fn pwd_list(pwd_type: u32, min: u32, max: u32) -> Vec<String> {
    if !(1..=20).contains(&min) || !(1..=20).contains(&max) {
        return vec![];
    }
    let password = *[
        Password::Legacy,
        Password::Distinct,
        Password::Emoji,
        Password::Mixture,
    ]
    .get(pwd_type as usize)
    .expect_throw("invalid password type");

    let mk = MASTER_KEY.read().unwrap();
    if mk.is_empty() {
        return vec![];
    }
    let xpriv = Xpriv::from_str(mk.as_str()).expect_throw("xpriv error");
    (min..=max)
        .map(|i| xpriv.bip85_pwd(password, 20, i).unwrap())
        .collect()
}

#[cfg(test)]
mod wasm_test {
    use super::*;

    #[test]
    fn test_wasm() {
        const MNEMONIC: &str = "alpha suggest twelve course present layer hand property endless shallow detect cousin ceiling crazy owner deputy ladder moral punch vacuum ice pencil fine charge";
        const WALLETS: [&str; 5] = [
            "3MDfN9tXdozXKRiGbDpgWujk6haJXXVXSS,KzUjZbdPGN8UqJTE9UXzpQugKWRMZwRqE3vCqhwJJs1dJ3qXSz3z", 
            "35mY6LGhApUhgqd5xw3FR4ngZhjGvZjHMq,L4KcnHRnJFdRjHDuLHoGjQ1Lf82Fs2WUanGtRuZsYQChKXN9cs1t", 
            "3EgqQwGyeYBtZTdbaposrRuszsaPju3oBK,KxLnnzRK3hdfJ7kfkE6kHsyLEMMoWLypchyJw92dFRG6z6fvNqL5", 
            "3QhuuovyzenmJfyjL257AgDK2n7CG3DJSi,KygF68fiRUuk8W2c7nf3iA5Mxzi4rdijz49MKAp1aZ2nkLHkWJ3J", 
            "3Hais6eax24J9pR67WCzgAJ8x1nCk3bLi5,L4QZzKctCqHkHpQcfAUboE3oF2g8rXKYYGtpUZEisD6phuS8Ba1o",
        ];
        const XPRIV: &str = "xprv9s21ZrQH143K3v3XUUoByovSMUyyJqKBpDesqkPg4Ybh9oL7ixjE3v1wv63LJciLuPKHqYYn5msUfhv8vwVzSrdUk8FiaPcL71rYx45gnXn";
        const PASSWORDS: [&str; 5] = [
            "yo%r9stqLShHW8EXbS1A",
            "7xT5kfHDyqrGQkrV9kku",
            "aBj1kp7Wus&eyZh3Y%g5",
            "pBnRfSRt9FM*rmhmvBkg",
            "j@fEyGzSGF5o#38%H#86",
        ];

        let items = ["【", "1", "$", "≈", "⅞", "£", "】"]
            .map(|s| s.to_owned())
            .to_vec();
        simple_init(
            items,
            vec![0, 1, 2, 3, 4, 5, 6],
            vec![0, 1, 2, 3, 4, 5, 6],
            Default::default(),
        );

        let mnemonics = mnemonic_list();
        assert_eq!(mnemonics[0], MNEMONIC);
        let wallts = wallet_list(1, 5);
        assert_eq!(wallts, WALLETS);
        let xpriv = xpriv_list(1, 1);
        assert_eq!(xpriv[0], XPRIV);
        let pwds = pwd_list(1, 1, 5);
        assert_eq!(pwds, PASSWORDS);
    }
}
