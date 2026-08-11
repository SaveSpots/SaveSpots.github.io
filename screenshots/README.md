# App Store screenshots

Captured from the real app on an iPhone 17 Pro Max simulator (iOS 26.5) at
**1320x2868**, which is Apple's 6.9" display size. App Store Connect accepts
6.9" images for the 6.7" slot, so these cover both.

Simulator location was set to downtown Chicago so the map shows genuine
SaveSpots with real distances and drive times — nothing here is mocked.

| File | Screen |
|------|--------|
| `02-map.png` | Map home with nearest SaveSpots, distances and drive times |
| `03-account.png` | Account |
| `04-checkin.png` | Check-in flow for a SaveBox |
| `05-log-savebox.png` | Submitting a new SaveBox location |

Upload order matters — the first is what people see while browsing. Lead with
`02-map.png`.

To recapture after UI changes:

```bash
xcrun simctl boot "iPhone 17 Pro Max"
xcrun simctl location <UDID> set 41.8781,-87.6298
cd apps/mobile && npx expo run:ios --device <UDID>
xcrun simctl io <UDID> screenshot out.png
```
