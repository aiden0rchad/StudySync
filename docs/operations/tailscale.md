# Tailscale Remote Access

StudySync includes built-in **dynamic host detection**, making it a first-class citizen on your private **Tailscale** network.

> Looking for WireGuard, NetBird, or ZeroTier setups? See the comprehensive [Remote Access Guide](/operations/remote-access).

---

## How Dynamic Host Detection Works

When accessing StudySync, the server dynamically examines incoming HTTP headers:
```javascript
const reqHost = req.headers['x-forwarded-host'] || req.get('host');
```

When you connect from your phone over Tailscale (e.g. `http://my-macbook.tailnet-xyz.ts.net:3000`):
* Webcal links automatically output: `webcal://my-macbook.tailnet-xyz.ts.net:3000/api/calendar/feed.ics`
* Apple Calendar on your iPhone can sync with your StudySync server whether you are at home, on campus Wi-Fi, or on cellular data.

---

## Step-by-Step Setup

1. Install Tailscale on your host server and your iPhone/Android.
2. Verify MagicDNS is active in your Tailscale admin console.
3. On your phone, open Safari and navigate to:
   ```text
   http://<your-tailscale-device-name>:3000
   ```
4. Install the app to your home screen via **Share → Add to Home Screen**.
5. Subscribe to the Apple Calendar feed; updates will flow securely over your encrypted Tailnet anywhere in the world.
