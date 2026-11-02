## 2026-11-02 — Suppress native context menus on standard ADL menus

**Decided:** Cancel `contextmenu` on each standard menu container, including
toolbar menus and submenus, without a document-wide handler or a change to custom
popup content.

**Why:** Voxel Paint opens its voxel menu from Scroll3D's pointer-up callback.
In a browser reproduction, the newly inserted menu becomes the target of the
subsequent `contextmenu` event. Suppression on the canvas or render holder cannot
catch that event because the menu is attached directly to the document body.
Handling it on the ADL menu fixes every standard menu entry point while retaining
native browser behavior elsewhere, including editable custom popup content.
