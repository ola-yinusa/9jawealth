# How to Update Property Videos & Calendar Link

You do **not** need to edit any HTML or code files to swap a video or connect your consultation calendar. Each item below is controlled by a small `.json` text file — just paste your new link between the quotation marks (`"..."`) and save.

---

## 1. Where Each Setting Lives

| What You Want to Update | File(s) to Edit |
|---|---|
| **PalmVille Walkthrough Video** (`palmville.9jawealth.com` & `/palmville`) | Update **both** files identically:<br>• `palmville/video-config.json`<br>• `public/palmville/video-config.json` |
| **Lekki Avana Signature Video** (`signature.9jawealth.com`) | • `lekki-avana-signature/video-config.json` |
| **Investment Consultation Calendar** (`/education` / `/guide`) | • `public/media-config.json` |

---

## 2. Example Files

### PalmVille (`palmville/video-config.json` + `public/palmville/video-config.json`)
```json
{
  "videoUrl": "https://drive.google.com/file/d/1kAgEETfTCE-DDOCOSdFxErsNEu4Dx4a_/preview",
  "fallbackUrl": "https://drive.google.com/file/d/1zGzwy_Dkox6goaIhzOSafCYTVoFScWxa/view"
}
```
> **Note:** Leaving `"videoUrl": ""` shows the branded *On-Site Plantation Walkthrough* card with WhatsApp and Reserve buttons.

### Lekki Avana Signature (`lekki-avana-signature/video-config.json`)
```json
{
  "videoUrl": "https://drive.google.com/file/d/1AtUaFYre8yYUh1huN_OIZALgSaiZKwUN/view",
  "label": "Watch: Latest Site & Allocation Video"
}
```
> You can also edit `"label"` to change the badge text on the video preview.

### Consultation Booking Calendar (`public/media-config.json`)
```json
{
  "bookingCalendarUrl": "https://calendar.app.google/YOUR_BOOKING_SLUG"
}
```
> Supports both `https://calendar.app.google/...` shortlinks and full `https://calendar.google.com/calendar/appointments/schedules/...` URLs from Google Calendar.

> **Technical Note:** Each property site loads its `video-config.json` with `Cache-Control: no-store, max-age=0` from external `app.js` (`palmville/app.js`, `public/palmville/app.js`, and `lekki-avana-signature/app.js`) under strict Content-Security-Policy (no inline executable scripts).

---

## 3. Accepted Video Link Formats

Paste any of these straight from your browser — the website automatically converts them for playback:

- **Google Drive:** `https://drive.google.com/file/d/FILE_ID/view?usp=sharing` (or `/preview` or `open?id=...`)
  * **Important:** Set sharing on Google Drive to **Anyone with the link → Viewer**, or visitors will see a permission screen.
- **YouTube:** `https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, or `https://www.youtube.com/shorts/...`
- **Vimeo:** `https://vimeo.com/123456789`
- **Direct Video File:** Any public HTTPS `.mp4` or `.webm` link (e.g., `https://.../walkthrough.mp4`)

---

## 4. Publishing Your Change (3 Steps)

1. Open the file in GitHub (or your code editor), replace the URL inside `"..."` (keep the quotes and curly braces `{ }`), and commit the change to the main branch.
2. Wait **1–2 minutes** for Vercel to publish automatically.
3. Open the live page in a private/incognito tab and verify the video plays and **Open video** opens the right link.
