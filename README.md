# SE·EMU — Social Engineering Emulator

> **scenario:** ZZXC-Corp · homograph impersonation · avatar cloning · pretexting lab  
> **version:** v1.3 · 100% client-side · nothing leaves your browser

🔗 **Live:** [giriaryan694-a11y.github.io/SE-EMU](https://giriaryan694-a11y.github.io/SE-EMU/)  
📁 **Repo:** [github.com/giriaryan694-a11y/SE-EMU](https://github.com/giriaryan694-a11y/SE-EMU)

---

## What is this?

SE·EMU is a browser-based social engineering simulation lab. It puts you in the role of an operator running a real attack chain — recon, impersonation, pretexting — against a fictional company called **ZZXC-Corp**, entirely inside your browser with no servers, no accounts, no data sent anywhere.

The sim is built around one of the most underestimated attack techniques in the field: **homograph impersonation** — making a username that *looks* identical to a target's handle but is built from different Unicode codepoints (Cyrillic, Greek) that render identically in most fonts.

---

## ⚠️ A Note on Client-Side Code

Yes — because this runs 100% in the browser, the credentials exist in `app.js`. You can open DevTools and read them right now.

**That is not the point. That is not the skill being taught.**

Anyone can hit F12. The simulation teaches the *human* attack chain:

- Mapping a target's social graph (recon)
- Constructing a byte-identical avatar (clone)
- Crafting a handle that passes a visual check (homoglyph)
- Using authority, urgency, and trust to extract information (pretext)

Reading source is a technical shortcut that completely bypasses the lesson. The lab is designed to be *worked through*, not inspected.

---

## Concepts Covered

| Technique | Description |
|---|---|
| **Homograph Attack** | Unicode look-alike characters from Cyrillic/Greek alphabets that render identically to Latin in most fonts |
| **Avatar Cloning** | Byte-for-byte identical profile image, verified by SHA-256 hash comparison |
| **Bio Spoofing** | Character-for-character profile copy, exposed via a "raw" toggle |
| **Pretexting** | Authority, urgency, secrecy, and friendliness lure templates |
| **Social Graph Recon** | Mapping following/follower relationships to identify high-value targets |

---

## Scenario

**Target org:** ZZXC-Corp  
**Target:** `@RohanIyerTech` — Support Engineer, has access to the admin panel  
**Person to impersonate:** `@adrain_vose` — CEO, Adrian Voss  
**Objective:** Extract the admin panel credentials from Rohan via DM

---

## Operator Toolbox 🧰

The draggable 🧰 button gives you:

- **sim** — reset the simulation (wipes accounts + chat history, keeps notes & position)
- **lures** — pre-written social engineering message templates (urgency, authority, fake IT desk, friendliness)
- **notes** — persistent scratchpad with a starter recon checklist, auto-saved to localStorage
- **about** — version info

---

## Tech Stack

- Vanilla HTML / CSS / JavaScript — zero dependencies, zero frameworks
- SHA-256 via `crypto.subtle` with a pure-JS fallback for `file://` contexts
- All state in `localStorage` — no backend, no network calls
- Draggable toolbox with pointer-event capture and viewport clamping

---

## Useful Tool

[**TrustNoChar**](https://giriaryan694-a11y.github.io/TrustNoChar/) — paste a username and inspect it codepoint-by-codepoint. Helps you spot (and craft) homoglyph handles.

---

## Defense Takeaways

- Always verify handles in a **monospace font** — proportional fonts hide substitution
- Confirm sensitive requests on a **second channel** (phone, face-to-face)
- Never transmit credentials over chat, regardless of who appears to be asking
- Train staff to recognize **urgency + authority** combinations — that pairing is a red flag

---

## Files

```
SE-EMU/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
    └── profile-pics/
```

---

## License

See [LICENSE](LICENSE).

---

<p align="center">Made by <b>Aryan Giri</b> &nbsp;|&nbsp; <a href="https://github.com/giriaryan694-a11y">giriaryan694-a11y</a><br>
<sub>educational use — sanctioned labs only</sub></p>
