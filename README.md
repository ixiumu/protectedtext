# ProtectedText

> [ProtectedText](https://www.protectedtext.com/) is an free online notepad with password, where you can securely save your notes on the web. It's a secure notepad with password, for all your notes, ideas, to-do lists, scripts, etc.

> **Your password never leaves your device.** [ProtectedText](https://www.protectedtext.com/) only store encrypted content.

## install

```bash
npm i protectedtext
```

## usage

```javascript
const protectedText = new ProtectedText('sitename', 'password')

// get content or create new site
await protectedText.get()

// update content
await protectedText.set(['note1', 'note2'])

// delete site
await protectedText.removeSite()
```
