/* global __dirname */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

class Element extends EventTarget {
    constructor(className = "") {
        super();
        this.classList = {
            add() {},
            contains: (name) => className.split(" ").includes(name)
        };
        this.children = [];
        this.style = {};
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
    }

    getBoundingClientRect() {
        return { width: 200, height: 200, right: 200 };
    }

    dispatchEvent(event) {
        super.dispatchEvent(event);
        if(event.bubbles && !event.cancelBubble && this.parentNode) {
            this.parentNode.dispatchEvent(event);
        }
        return !event.defaultPrevented;
    }
}

function createMenus() {
    const body = new Element();
    const source = readFileSync(path.join(__dirname, "../adl/adl.js"), "utf8")
        .replace(/^import .*;$/gm, "")
        .replace("export default {", "globalThis.adl = {")
        .replace(/^export /gm, "");
    const context = vm.createContext({
        window: { addEventListener() {}, innerWidth: 800, innerHeight: 600 },
        document: { body, querySelectorAll: () => [] },
        createClassedElement(tag, className) { return new Element(className); },
        rgbToHex() {},
        icons: {}
    });
    vm.runInContext(source, context);
    return { body, adl: context.adl };
}

test("a popup opened on pointer release cancels the subsequent native menu", () => {
    const { body, adl } = createMenus();
    const canvas = new Element();
    body.appendChild(canvas);
    canvas.addEventListener("pointerup", () => {
        adl.popupMenu({ title: "Voxel", items: [{ title: "Delete" }] }, 100, 100);
    });
    canvas.dispatchEvent(new Event("pointerup"));
    const menu = body.children[1];
    const event = new Event("contextmenu", { bubbles: true, cancelable: true });
    assert.equal(menu.dispatchEvent(event), false);
    assert.equal(event.defaultPrevented, true);
    assert.equal(menu.children.length, 2);
});

test("menu titles, items and submenu contents cancel native menus without blocking propagation", () => {
    const { body, adl } = createMenus();
    adl.popupMenu({
        title: "Voxel",
        items: [{ title: "More", menu: { items: [{ title: "Delete" }] } }]
    }, 100, 100);
    const menu = body.children[0];
    const item = menu.children[1];
    item.onpointerenter({ clientY: 100 });
    const submenu = body.children[1];
    let bubbled = 0;
    body.addEventListener("contextmenu", () => bubbled++);
    for(const element of [menu.children[0], item.children[0], submenu.children[0].children[0]]) {
        const event = new Event("contextmenu", { bubbles: true, cancelable: true });
        assert.equal(element.dispatchEvent(event), false);
        assert.equal(event.defaultPrevented, true);
    }
    assert.equal(bubbled, 3);
    const outsideEvent = new Event("contextmenu", { cancelable: true });
    assert.equal(body.dispatchEvent(outsideEvent), true);
    assert.equal(outsideEvent.defaultPrevented, false);
});
