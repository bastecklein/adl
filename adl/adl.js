import "./FluentSystemIcons-Resizable.ttf";
import "./adl.css";
import { createClassedElement, distBetweenPoints, rgbToHex, hexToRGB } from "common-helpers";
import icons from "./FluentSystemIcons-Resizable.json";

const GP_HILIGHT_PADDING = 12;
const emojiRegex = /\p{Emoji_Presentation}/u;

const DEFAULT_COLORPICKER_OPTIONS = [
    [ "#ef9a9a","#FFCC80","#FFF59D","#A5D6A7","#90CAF9","#B39DDB","#F48FB1","#BCAAA4","#ffffff" ],
    [ "#f44336","#FF9800","#FFEB3B","#4CAF50","#2196F3","#9C27B0","#E91E63","#795548","#9E9E9E" ],
    [ "#b71c1c","#E65100","#F9A825","#1B5E20","#0D47A1","#4A148C","#880E4F","#3E2723","#000000" ]
];

export const COMMON_FLUENT_ICONS = {
    home: "ic_fluent_home_20_regular",
    privacy: "ic_fluent_incognito_20_regular",
    letter: "ic_fluent_mail_20_regular",
    letter_edit: "ic_fluent_mail_edit_20_regular",
    user: "ic_fluent_person_20_regular",
    question: "ic_fluent_question_circle_20_regular",
    save: "ic_fluent_save_20_regular",
    save_as: "ic_fluent_save_edit_20_regular",
    settings: "ic_fluent_settings_20_regular",
    like: "ic_fluent_thumb_like_20_regular",
    rate: "ic_fluent_thumb_like_dislike_20_regular",
    dislike: "ic_fluent_thumb_dislike_20_regular",
    trophy: "ic_fluent_trophy_20_regular",
    warning: "ic_fluent_warning_20_regular",
    tools: "ic_fluent_wrench_screwdriver_20_regular",
    controller: "ic_fluent_xbox_controller_20_regular",
    apps: "ic_fluent_app_folder_20_regular",
    package: "ic_fluent_box_20_regular",
    camera: "ic_fluent_camera_20_regular",
    cloud: "ic_fluent_cloud_20_regular",
    cloud_download: "ic_fluent_cloud_arrow_down_20_regular",
    cloud_upload: "ic_fluent_cloud_arrow_up_20_regular",
    cloud_sync: "ic_fluent_cloud_sync_20_regular",
    color: "ic_fluent_color_20_regular",
    exit: "ic_fluent_sign_out_20_regular",
    new: "ic_fluent_document_20_regular",
    open: "ic_fluent_folder_20_regular",
    open_folder: "ic_fluent_folder_open_20_regular",
    gift: "ic_fluent_gift_20_regular",
    image: "ic_fluent_image_20_regular",
    info: "ic_fluent_info_20_regular",
    friends: "ic_fluent_people_community_20_regular",
    print: "ic_fluent_print_20_regular",
    award: "ic_fluent_ribbon_20_regular",
    sound_on: "ic_fluent_speaker_2_20_regular",
    sound_off: "ic_fluent_speaker_off_20_regular",
    purchase: "ic_fluent_shopping_bag_20_regular",
    purchase_check: "ic_fluent_shopping_bag_checkmark_20_regular",
    delete: "ic_fluent_delete_20_regular",
    translate: "ic_fluent_translate_auto_20_regular"
};

let adlTheme = "#1565C0";
let forceTheme = null;
let adlDialog = null;
let currentADLDialog = null;
let currentDialogInput = null;
let currentDialogSlider = null;
let currentDialogProgress = null;
let adlIsInit = false;
let adlDynamicStyle = null;
let toastHolder = null;
let pendingDialogs = [];
let usingMica = false;

window.addEventListener("focus", function() {
    setTheme(adlTheme, forceTheme);
});

if(window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
    window.chrome.webview.addEventListener("message", function(e){
        if(e && e.data && e.data.type) {
            const data = e.data;
            const type = data.type;

            if(type == "getSupportsMicaResponse") {
                if(data && data.data && data.data == "1") {
                    usingMica = true;
                    setTheme(adlTheme, forceTheme);
                }
            }
        }
    });

    window.chrome.webview.postMessage({
        type: "getSupportsMica",
        data: ""
    });
}

/**
 * @deprecated
 */
function addIonicons() {
    console.warn("ADL Ion Icon support depreciated");
}

export function setTheme(color = "#1565C0", forceThemeLightOrDark = null) {

    if(!adlIsInit) {
        initADL();
    }

    adlTheme = color;
    forceTheme = forceThemeLightOrDark;

    setupDynamicStyles();

    if(getOverallThemeLight()) {
        document.body.classList.remove("adlDark");
    } else {
        document.body.classList.add("adlDark");
    }
}

function setupDynamicStyles() {

    if(!adlDynamicStyle) {
        adlDynamicStyle = document.createElement("style");
        document.getElementsByTagName("head")[0].appendChild(adlDynamicStyle);
    }
    
    let styleFG = "#000000";

    if(isHexColorDark(adlTheme)) {
        styleFG = "#FFFFFF";
    }

    let tintColor = adlTheme;
    let tintColorAlt = adlTheme;
    let tintFG = "#000000";

    const rgb = hexToRGB(adlTheme);

    tintColor = {
        r: 0,
        g: 0,
        b: 0
    };

    tintColorAlt = {
        r: 0,
        g: 0,
        b: 0
    };

    if(getOverallThemeLight()) {
        const blendAmt = 0.96;

        tintColor.r = normalizeBlend(rgb.r, blendAmt);
        tintColor.g = normalizeBlend(rgb.g, blendAmt);
        tintColor.b = normalizeBlend(rgb.b, blendAmt);

        const blendAmtAlt = 0.86;

        tintColorAlt.r = normalizeBlend(rgb.r, blendAmtAlt);
        tintColorAlt.g = normalizeBlend(rgb.g, blendAmtAlt);
        tintColorAlt.b = normalizeBlend(rgb.b, blendAmtAlt);
    } else {
        tintColor.r = normalizeOffset(weighColors(rgb.r, 19, 0.05, 0.8), 10);
        tintColor.g = normalizeOffset(weighColors(rgb.g, 20, 0.05, 0.8), 10);
        tintColor.b = normalizeOffset(weighColors(rgb.b, 21, 0.05, 0.8), 10);

        tintColorAlt.r = normalizeOffset(weighColors(rgb.r, 19, 0.1, 0.7), 15);
        tintColorAlt.g = normalizeOffset(weighColors(rgb.g, 20, 0.1, 0.7), 15);
        tintColorAlt.b = normalizeOffset(weighColors(rgb.b, 21, 0.1, 0.7), 15);

        tintFG = "#ffffff";
    }

    const tintHex = rgbToHex(tintColor.r, tintColor.g, tintColor.b);
    const altHex = rgbToHex(tintColorAlt.r, tintColorAlt.g, tintColorAlt.b);

    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    
    const backdrop = usingBackdrop();

    if(backdrop && metaThemeColor) {
        if(window.matchMedia('(display-mode: tabbed)').matches) {
            const offset = -25;
            const nRGB = hexToOffset(tintHex, offset);
            const hex = rgbToHex(nRGB.r, nRGB.g, nRGB.b);
            metaThemeColor.setAttribute("content", hex);
        } else {
            metaThemeColor.setAttribute("content", tintHex);
        }
    }

    let dynStyle = "* { accent-color: " + adlTheme + "; } ";

    if(backdrop && metaThemeColor) {
        if(window.matchMedia('(display-mode: tabbed)').matches) {
            dynStyle += " body { background-color: " + tintHex + "; } ";
        }
    }

    if(backdrop) {
        dynStyle += " body { height: 100%; width: 100%; margin: 0px; padding: 0px; overflow: hidden; } ";
    }

    let transparentWindow = usingMica;

    if(window.wacUtils2) {
        window.wacUtils2.ipcInvoke("supportsTransparency", null).then(function(supports) {
            if(supports) {
                transparentWindow = true;
            }
        });
    }

    if(window.Android && window.Android.supportsTransparency) {
        transparentWindow = window.Android.supportsTransparency();
    }

    if(transparentWindow) {
        dynStyle += " html, body { background-color: transparent !important; background: transparent !important; } ";
    }

    dynStyle += " a { color: " + adlTheme + "; }";
    dynStyle += " .adl-toast, input.adl[type=number], input.adl[type=password], input.adl[type=text], textarea.adl { border-bottom: 2px solid " + adlTheme + "; } ";
    dynStyle += " .adlGamepadSelected { outline: 2px solid " + adlTheme +  "; background-color: rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.2); } ";
    dynStyle += " .adl-menu-item:hover .adl-icon, .adl-list-item:hover .adl-icon, .adl-toolbar-button:hover .adl-icon, .adl-sidebar-item:hover .adl-icon, .adl-toast-action { color: " + adlTheme + "; } ";

    if(transparentWindow) {
        dynStyle += " .adl-backdrop, .adl-tint { background-color: transparent !important; color: " + tintFG + "; background: transparent !important; } ";
    } else {
        dynStyle += " .adl-backdrop, .adl-tint { background-color: " + tintHex + "; color: " + tintFG + "; background: linear-gradient(180deg, " + tintHex + ", " + altHex + "); } ";
    }

    dynStyle += " .adl-codeblock { background-color: " + adlTheme + "; color: " + styleFG + "; } ";

    adlDynamicStyle.innerHTML = dynStyle;
}

function usingBackdrop() {
    if(document.querySelector(".adl-backdrop")) {
        return true;
    }

    if(document.querySelector(".adl-tint")) {
        return true;
    }

    return false;
}

export function addToolbar(options) {
    if(!adlIsInit) {
        initADL();
    }

    if(!options || !options.element) {
        return;
    }

    options.element.innerHTML = "";

    const toolbar = createClassedElement("div", "adl-toolbar");

    let gridCols = "";

    for(let i = 0; i < options.items.length; i++) {
        const item = options.items[i];

        const ele = createToolbarElement(item);

        if(ele) {
            toolbar.appendChild(ele);

            if(item.type == "spacer" || item.type == "title") {
                gridCols += " 1fr";
            } else {
                gridCols += " auto";
            }
        }
    }

    toolbar.style.gridTemplateColumns = gridCols.trim();

    if(options.background) {
        setElementBgFg(toolbar, options.background);
    }

    if(options.foreground) {
        toolbar.style.color = options.foreground;
    }

    options.element.appendChild(toolbar);
}

function createToolbarElement(item) {
    if(!item) {
        return null;
    }

    if(item.type == "seperator" || item.type == "separator") {
        return createClassedElement("div", "adl-toolbar-seperator");
    }

    const element = createClassedElement("div", "adl-toolbar-item");

    if(item.type == "button") {
        element.classList.add("adl-toolbar-button");

        if(!item.func && !item.menu && !item.customPopup) {
            element.classList.add("adl-toolbar-button-noaction");
        }
    }

    if(item.title) {
        element.title = item.title;
    }

    if(item.func || item.menu || item.customPopup) {
        element.onclick = function(e) {
            const elemRect = this.getBoundingClientRect();

            const retData = {
                x: e.clientX,
                y: elemRect.bottom + 4,
                toolbarRect: elemRect
            };

            if(item.tag) {
                retData.tag = item.tag;
            }

            if(item.func) {
                item.func(retData);
            }
            
            if(item.menu) {
                spawnMenu(item.menu, retData.x, retData.y);
            }
        };
    }

    if(item.icon) {
        const icon = createClassedElement("div", "adl-toolbar-icon");
        const glyph = getItemIcon(item.icon, item.iconColor);

        if(item.iconWeight) {
            glyph.style.fontWeight = item.iconWeight;
        }

        icon.appendChild(glyph);
        element.appendChild(icon);
    }

    if(item.label) {
        const label = createClassedElement("div", "adl-toolbar-label", item.label);

        if(item.type == "title") {

            label.classList.add("adl-toolbar-title");

            if(item.centered) {
                label.classList.add("adl-toolbar-title-centered");
            }
            
        }

        element.appendChild(label); 
    }

    if(item.icon && item.label) {
        element.classList.add("adl-toolbar-item-icon-and-label");

        
    }

    return element;
}

export function pickColor(options) {
    if(!adlIsInit) {
        initADL();
    }

    let pendingColorChoice = null;

    let colors = options.colors || null;

    pendingColorChoice = options.default || null;

    const pickerHolder = createColorSwatches(function(color) {

        let shouldDismiss = false;

        if(!options.element) {
            if(!options.withInput) {
                shouldDismiss = true;
            }
        }

        if(shouldDismiss) {
            dismissDialogWindow(null);
            options.callback(color);
        } else {
            pendingColorChoice = color;

            if(options.element) {
                options.callback(color);
            }
        }
            
            
    }, colors, options.withInput, options.default);

    const pickerButtons = [];

    if(!options.element) {
        pickerButtons.push({
            text: "Cancel"
        });
    }

    if(options.withInput) {
        pickerButtons.push({
            text: "Pick",
            func: function(){
                options.callback(pendingColorChoice);
            }
        });
    }

    const opts = {
        title: "Pick Color",
        customElement: pickerHolder,
        buttons: pickerButtons
    };

    if(options.element) {
        opts.holder = options.element;
    }

    showDialog(opts);
}

function createColorSwatches(callback, colors, withInput, defColor) {

    if(!colors) {
        colors = DEFAULT_COLORPICKER_OPTIONS;
    }

    let colorsPerRow = 0;

    for(let i = 0; i < colors.length; i++) {
        let row = colors[i];

        if(row.length > colorsPerRow) {
            colorsPerRow = row.length;
        }
    }

    let pickerHolder = document.createElement("div");
    pickerHolder.className = "adlColorPicker";

    let colTemp = "";

    for(let n = 0; n < colorsPerRow; n++) {
        colTemp += "1fr ";
    }

    pickerHolder.style.gridTemplateColumns = colTemp.trim();

    const allSwatches = [];

    for(let i = 0; i < colors.length; i++) {
        const row = colors[i];

        for(let j = 0; j < row.length; j++) {
            const color = row[j];

            const swatch = document.createElement("div");
            swatch.className = "adlColorPickerSwatch adlGamepadSelectable";
            swatch.colorRef = color;
            swatch.callbackRef = callback;
            swatch.onclick = onSwatchSelected;
            swatch.style.backgroundColor = color;

            pickerHolder.appendChild(swatch);
            allSwatches.push(swatch);
        }

    }

    if(withInput) {
        const inputRow = document.createElement("div");
        inputRow.style.gridColumn = "1 / span " + colorsPerRow;
        inputRow.className = "adlColorPickerInputHolder";

        const inputHexHeader = document.createElement("div");
        inputHexHeader.className = "adlColorPickerHexHeader";
        inputHexHeader.innerHTML = "Hex";
        inputRow.appendChild(inputHexHeader);

        const inputHexTextInput = document.createElement("input");
        inputHexTextInput.type = "text";
        inputHexTextInput.className = "adl";
        inputHexTextInput.placeholder = "Hex";

        if(defColor) {
            inputHexTextInput.value = defColor;
        }

        inputRow.appendChild(inputHexTextInput);

        const inputInput = document.createElement("input");
        inputInput.type = "color";

        if(defColor) {
            inputInput.value = defColor;
        }

        inputInput.oninput = function(){
            callback(this.value);
            inputHexTextInput.value = this.value;
        };

        inputHexTextInput.oninput = function(){
            const val = this.value.trim();

            if(val.length == 7 && val.indexOf("#") == 0) {
                callback(val);
                inputInput.value = val;
            }
        };

        inputRow.appendChild(inputInput);

        pickerHolder.appendChild(inputRow);

        for(let i = 0; i < allSwatches.length; i++) {
            const sr = allSwatches[i];
            sr.textInputRef = inputHexTextInput;
            sr.colorInputRef = inputInput;
        }
    }

    return pickerHolder;
}

function onSwatchSelected() {
    const color = this.colorRef;
    const callback = this.callbackRef;

    callback(color);

    if(this.textInputRef) {
        this.textInputRef.value = color;
    }

    if(this.colorInputRef) {
        this.colorInputRef.value = color;
    }
}

export function showList(options) {

    if(!options || !options.options) {
        return;
    }

    if(!adlIsInit) {
        initADL();
    }

    for(let i = 0; i < options.options.length; i++) {
        const item = options.options[i];
        formatNativeListOptionForADL(item, options);
    }

    const dialogOpts = {
        list: options.options,
        title: options.title || null,
        flyout: options.flyout || undefined,
        holder: options.element || undefined
    };

    if(dialogOpts.cancelText || (!options.flyout && !options.element)) {
        dialogOpts.buttons = [
            {
                text: options.cancelText || "Dismiss",
                func: function() {
                    dismissDialogWindow();
                }
            }
        ];
    }

    showDialog(dialogOpts);
}

function formatNativeListOptionForADL(item, options) {
    if(item.func || !item.tag || !options.onSelection) {
        return;
    }

    item.func = function() {
        options.onSelection(item.tag);
    };
}

/**
 * @deprecated
 */
function getADLVersion() {
    console.warn("getADLVersion depreciated");
    return null;
}

/**
 * @deprecated
 */
function getIoniconVersion() {
    console.warn("getIoniconVersion depreciated");
    return null;
}

/**
 * @deprecated
 */
function showVRMenu() {
    console.warn("showVRMenu depreciated");
}

/**
 * @deprecated
 */
function createCanvasMenu() {
    console.warn("createCanvasMenu depreciated");
}

export function showAlert(message) {
    if(!adlIsInit) {
        initADL();
    }

    showDialog({
        message: message
    });
}

export function showAlertWithTitle(message, title) {
    if(!adlIsInit) {
        initADL();
    }

    showDialog({
        message: message,
        title: title
    });
}

export function showChoice(message, choice1, choice2, callback1, callback2) {
    if(!adlIsInit) {
        initADL();
    }
    
    showDialog({
        message: message,
        buttons: [
            {
                text: choice1,
                func: callback1
            },
            {
                text: choice2,
                func: callback2
            }
        ]
    });
}

export function showDialog(options) {

    if(currentADLDialog) {
        pendingDialogs.push(options);
        return;
    }

    if(!adlIsInit) {
        initADL();
    }

    let canDismiss = false;
    let showGenericCancelButton = false;
    let gridRows = "";

    currentDialogInput = null;
    currentDialogSlider = null;
    currentDialogProgress = null;

    if(!options.buttons || options.buttons.length == 0) {
        if(!options.progress) {
            canDismiss = true;

            if(!options.flyout && !options.holder) {
                showGenericCancelButton = true;
            }
        }
    }

    if(!adlDialog && !options.holder) {
        adlDialog = createClassedElement("dialog", "adl adl-dialog adlPadZone");
        document.body.appendChild(adlDialog);
    }

    let dialogTarget = adlDialog;

    if(options.holder) {
        dialogTarget = options.holder;
        dialogTarget.classList.add("adl-embedded-dialog");
        dialogTarget.classList.add("adl");
    } else {
        adlDialog.className = "adl adl-dialog adlPadZone";

        if(canDismiss) {
            adlDialog.setAttribute("closedby", "any");
        } else {
            adlDialog.setAttribute("closedby", "none");
        }
    }
    

    dialogTarget.innerHTML = "";

    const gridInner = createClassedElement("div", "adl-dialog-inner");
    dialogTarget.appendChild(gridInner);

    if(options.title) {
        gridRows += " auto";
        gridInner.appendChild(createClassedElement("div", "adl-dialog-title", options.title));
    }

    if(options.message || options.icon) {
        
        gridRows += " auto";

        const iconMessageLine = createClassedElement("div", "adl-dialog-icon-message-line");
        let messageLineCols = "";

        if(options.icon) {
            const icon = createClassedElement("div", "adl-dialog-icon");
            const glyph = getItemIcon(options.icon, options.iconColor);

            if(options.iconWeight) {
                glyph.style.fontWeight = options.iconWeight;
            }

            icon.appendChild(glyph);
            iconMessageLine.appendChild(icon);

            messageLineCols += " auto";
        }

        if(options.message) {
            messageLineCols += " 1fr";
            iconMessageLine.appendChild(createClassedElement("div", "adl-dialog-message", options.message));
        }

        iconMessageLine.style.gridTemplateColumns = messageLineCols.trim();

        gridInner.appendChild(iconMessageLine);
    }

    if(options.input) {
        gridRows += " auto";

        let inEle = null;

        if(options.input.multiline) {
            inEle = createClassedElement("textarea", "adl adl-dialog-input");
        } else {
            inEle = createClassedElement("input", "adl adl-dialog-input");

            if(options.input.password) {
                inEle.type = "password";
            } else {
                inEle.type = "text";
            }
        }

        inEle.value = options.input.value || "";

        if(options.input.placeholder) {
            inEle.placeholder = options.input.placeholder;
        }

        inEle.oninput = function() {
            currentDialogInput = inEle.value;
        };

        gridInner.appendChild(inEle);
    }

    if(options.list && options.list.length > 0) {
        gridRows += " 1fr";

        const listHolder = createClassedElement("div", "adl-dialog-list-holder");

        for(let i = 0; i < options.list.length; i++) {
            const item = options.list[i];
            const ele = createListOption(item);

            if(ele) {
                listHolder.appendChild(ele);
            }
        }

        gridInner.appendChild(listHolder);
    }

    if(options.slider) {
        currentDialogSlider = createClassedElement("input", "adl adl-dialog-slider");
        currentDialogSlider.type = "range";

        currentDialogSlider.min = options.slider.min || 0;
        currentDialogSlider.max = options.slider.max || 100;
        currentDialogSlider.value = options.slider.value || 0;

        gridInner.appendChild(currentDialogSlider);

        const sliderStatus = createClassedElement("div", "adl-dialog-slider-status");
        sliderStatus.innerHTML = options.slider.status || options.slider.value || "0";
        gridInner.appendChild(sliderStatus);

        if(options.slider.onChange) {
            currentDialogSlider.oninput = function() {
                options.slider.onChange(currentDialogSlider.value, function(val) {
                    sliderStatus.innerHTML = val;
                });
            };
        }
        
    }

    if(options.progress) {

        currentDialogProgress = createClassedElement("progress", "adl adl-dialog-progress");

        if(options.progress.indeterminate) {
            currentDialogProgress.indeterminate = true;
        } else {
            currentDialogProgress.indeterminate = false;
            currentDialogProgress.value = options.progress.percent || 0;
            currentDialogProgress.max = 100;
        }
        
        gridInner.appendChild(currentDialogProgress);
    }

    if(options.customElement) {
        if(options.flyout) {
            gridRows += " 1fr";
        } else {
            gridRows += " auto";
        }
        
        gridInner.appendChild(options.customElement);
    }
    
    if(showGenericCancelButton) {
        if(!options.buttons) {
            options.buttons = [];
        }

        options.buttons.push({
            text: "Dismiss"
        });
    }

    if(options.flyout && !options.list && !options.customElement) {
        gridInner.appendChild(createClassedElement("div", "adl-dialog-flyout-spacer"));
        gridRows += " 1fr";
    }

    let addedButtons = 0;

    if(options.buttons && options.buttons.length > 0) {

        

        gridRows += " auto";



        const buttonArea = createClassedElement("div", "adl-dialog-buttons");

        for(let i = 0; i < options.buttons.length; i++) {
            const button = options.buttons[i];
            const btn = createDialogButton(button);

            if(btn) {
                buttonArea.appendChild(btn);
                addedButtons++;
            }
        }

        gridInner.appendChild(buttonArea);
    }

    if(options.flyout && options.flyout.position) {
        dialogTarget.classList.add("dialogFlyout" + options.flyout.position);
    } else {
        if(!options.holder) {
            dialogTarget.classList.add("dialogPopup");
        }
        
    }
    
    gridInner.style.gridTemplateRows = gridRows.trim();

    if(options.backgroundColor) {
        setElementBgFg(dialogTarget, options.backgroundColor);
    } else {
        dialogTarget.style.backgroundColor = null;
        dialogTarget.style.color = null;
    }

    if(dialogTarget == adlDialog) {
        if(addedButtons > 0) {
            adlDialog.showModal();
            adlDialog.isModalDialog = true;
        } else {
            adlDialog.show();
            adlDialog.isModalDialog = false;
        }
        
        currentADLDialog = options;
    }
    
}

function setElementBgFg(element, bg) {
    element.style.backgroundColor = bg;

    const bgDark = isHexColorDark(bg);

    if(bgDark) {
        element.style.color = "#ffffff";
    } else {
        element.style.color = "#000000";
    }
}

function createDialogButton(options) {
    const button = createClassedElement("button", "adl adl-dialog-button adlGamepadSelectable", options.text, null, function() {
        
        dismissDialogWindow();
        
        if(options.func) {

            let val = undefined;

            if(options.inputResult) {
                val = currentDialogInput;
            }

            if(options.sliderResult) {
                val = currentDialogSlider.value;
            }

            options.func(val);
        }

        
    });

    if(options.color) {
        button.classList.add("coloredButton");
        setElementBgFg(button, options.color);
    }

    return button;

}

export function dismissDialogWindow(callback) {

    currentADLDialog = null;

    if(callback) {
        callback();
    }

    let wasOpen = false;

    if(adlDialog) {
        adlDialog.close();
        adlDialog.innerHTML = "";
        wasOpen = true;
    }

    if(pendingDialogs.length > 0) {
        const dialog = pendingDialogs.shift();
        showDialog(dialog);
        return true;
    }

    return wasOpen;
}

/**
 * @deprecated
 */
export function getDistance(x1, y1, x2, y2) {
    console.warn("adl getDistance depreciated, use distBetweenPoints from common-helpers");
    return distBetweenPoints(x1, y1, x2, y2);
}

/**
 * @deprecated
 */
export function hexToColor(hex) {
    console.warn("adl hexToColor depreciated, use hexToRGB from common-helpers");

    const color = hexToRGB(hex);
    color.a = 255;
    return color;
}

export function isHexColorDark(hex) {
    const color = hexToRGB(hex);
    const colorValue = color.r + color.g + color.b;

    if (colorValue > 382) {
        return false;
    } else {
        return true;
    }
}

function hexToInvertedRGB(hex) {
    const color = hexToRGB(hex);

    color.r = 255 - color.r;
    color.g = 255 - color.g;
    color.b = 255 - color.b;

    if(color.r < 0) {
        color.r = 0;
    }

    if(color.g < 0) {
        color.g = 0;
    }

    if(color.b < 0) {
        color.b = 0;
    }

    return color;
}

/**
 * @depreciated
 */
function getScriptURL() {
    console.warn("adl getScriptURL depreciated");
    return null;
}

/**
 * @depreciated
 */
function addADLStyle() {
    console.warn("adl addADLStyle depreciated");
}

function initADL() {
    if(adlIsInit) {
        return;
    }

    window.addEventListener("pointerdown", onPointerDown, true);

    document.body.classList.add("adl");

    adlIsInit = true;

    const fontIcons = document.querySelectorAll(".adl-font-icon");

    for(let i = 0; i < fontIcons.length; i++) {
        const icn = fontIcons[i];

        const value = icn.innerHTML.trim();

        const glyph = cleanFontIcon(value);

        icn.innerHTML = glyph;
    }
}

function onPointerDown(e) {

    if(adlDialog && !adlDialog.isModalDialog && adlDialog.open) {
        if(!isElementInsideDialog(e.target)) {
            e.preventDefault();
            e.stopPropagation();
            dismissDialogWindow(null);
            return;
        }
    }

    if(!isElementInsideAMenu(e.target)) {
        const openMenus = document.querySelectorAll(".adl-menu");

        if(openMenus.length > 0) {
            closeAllPopupMenus();
            e.preventDefault();
            e.stopPropagation();

            return;
        }
    }
}

export function closeAllPopupMenus() {

    let closed = false;

    const openMenus = document.querySelectorAll(".adl-menu");

    if(openMenus.length > 0) {
        for(let i = 0; i < openMenus.length; i++) {
            const menu = openMenus[i];
            menu.remove();
            closed = true;
        }
    }

    return closed;
}

function isElementInsideDialog(element) {

    if(element == adlDialog) {
        return true;
    }

    if(adlDialog) {
        return adlDialog.contains(element);
    }
    return false;
}

function isElementInsideAMenu(element) {

    if(element.classList.contains("adl-menu")) {
        return true;
    }

    if(element.parentElement) {
        return isElementInsideAMenu(element.parentElement);
    }

    return false;
}

export function getOverallThemeLight() {
    let overallThemeLight = true;

    if(forceTheme) {
        if(forceTheme == "dark") {
            overallThemeLight = false;
        }
    } else {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            overallThemeLight = false;
        }
    }

    return overallThemeLight;
}

export function gamepadXYCheck(direction,compareElement,useParent) {

    let nextElement = null;

    if(!useParent) {
        useParent = null;
    }

    const elements = getGamepadSelectableElements(useParent);

    if(elements.length == 0) {
        return nextElement;
    }

    if(!compareElement || elements.indexOf(compareElement) == -1) {
        compareElement = elements[0];
        return compareElement;
    }

    nextElement = elements[0];

    const checkBounds = compareElement.getBoundingClientRect();
    let closestElement = 999999;

    for(let i = 0; i < elements.length; i++) {
        const element = elements[i];

        if(element == compareElement) {
            continue;
        }

        const bounds = element.getBoundingClientRect();

        let doCheck = false;

        if(direction == "right") {
            if(bounds.left >= checkBounds.right - GP_HILIGHT_PADDING) {
                doCheck = true;
            }
        }

        if(direction == "left") {
            if(bounds.right <= checkBounds.left + GP_HILIGHT_PADDING) {
                doCheck = true;
            }
        }

        if(direction == "up") {
            if(bounds.bottom <= checkBounds.top + GP_HILIGHT_PADDING) {
                doCheck = true;
            }
        }

        if(direction == "down") {
            if(bounds.top >= checkBounds.bottom - GP_HILIGHT_PADDING) {
                doCheck = true;
            }
        }

        if(doCheck) {
            const dist = getDistance(checkBounds.left, checkBounds.top, bounds.left, bounds.top);

            if(dist < closestElement) {
                nextElement = element;
                closestElement = dist;
            }
        }
    }

    return nextElement;
}

function isDialogShowing() {
    if(adlDialog) {

        const style = adlDialog.getComputedStyle();

        if(style && style.display != "none") {
            return true;
        }

        
    }

    return false;
}

function getGamepadSelectableElements(useParent) {

    let checkEle = document;

    if(!useParent) {
        useParent = null;
    }

    if(isDialogShowing()) {
        checkEle = adlDialog;
    }

    if(useParent) {
        checkEle = useParent;
    }

    const allEles = checkEle.querySelectorAll(".adlGamepadSelectable");
    const selectableEles = [];

    for(let i = 0; i < allEles.length; i++) {
        const element = allEles[i];

        let visible = true;
        let parent = element;

        while(parent && visible) {
            if(parent.style.display == "none") {
                visible = false;
            }

            parent = parent.parentElement;
        }

        if(visible) {
            selectableEles.push(element);
        }
    }

    return selectableEles;
}

export function isThisAnImage(url) {

    const imageURL = url.toLowerCase();

    if(
        imageURL.indexOf(".png") == -1 && 
        imageURL.indexOf(".jpg") == -1 && 
        imageURL.indexOf(".gif") == -1 &&
        imageURL.indexOf(".jpeg") == -1 &&
        imageURL.indexOf(".bmp") == -1 &&
        imageURL.indexOf(".tiff") == -1 &&
        imageURL.indexOf(".webp") == -1 && 
        imageURL.indexOf(".svg") == -1 && 
        imageURL.indexOf("data:image") == -1 && 
        imageURL.indexOf("gettoken.php") == -1 && 
        imageURL.indexOf("getavatar.php") == -1 && 
        imageURL.indexOf("geticon.php") == -1
    ) {
        return false;
    }

    return true;
}

export function canElementBeGamepadSelected(element) {
    if(element) {
        const elements = getGamepadSelectableElements();

        if(elements.length > 0) {
            if(elements.indexOf(element) > -1) {
                return true;
            }
        }
    }
        
    return false;
}

function hexToOffset(hex, offset) {
    const color = hexToRGB(hex);

    color.r += offset;
    color.g += offset;
    color.b += offset;

    if (offset > 0) {
        if (color.r > 255) {
            color.r = 255;
        }

        if (color.g > 255) {
            color.g = 255;
        }

        if (color.b > 255) {
            color.b = 255;
        }
    } else {
        if (color.r < 0) {
            color.r = 0;
        }

        if (color.g < 0) {
            color.g = 0;
        }

        if (color.b < 0) {
            color.b = 0;
        }
    }

    return color;
}

export function normalizeBlend(color, amt) {
    return parseInt(color) + Math.floor((255 - parseInt(color)) * amt);
}

export function normalizeOffset(color, offset) {
    let ret = parseInt(color) + offset;

    if(ret > 255) {
        ret = 255;
    }

    if(ret < 0) {
        ret = 0;
    }

    return ret;
}

export function weighColors(c1, c2, w1, w2) {
    let raw = ((w1 * c1) + (w2 * c2)) / (w1 + w2);

    if(raw > 255) {
        return 255;
    }

    return raw;
}

export function getTheme() {
    return adlTheme;
}

export function inputBox(options) {
    if(!adlIsInit) {
        initADL();
    }

    showDialog({
        title: options.title,
        message: options.message,
        input: {
            multiline: options.multiline,
            password: options.password,
            placeholder: options.placeholder,
            value: options.value
        },
        buttons: [
            {
                text: "Cancel"
            },
            {
                text: "Ok",
                func: options.func,
                inputResult: true,
                color: adlTheme
            }
        ]
    });
}

export function popupMenu(options, x, y) {
    if(!adlIsInit) {
        initADL();
    }

    spawnMenu(options, x, y);
}

export function showToast(options) {

    if(!options) {
        return;
    }

    if(!adlIsInit) {
        initADL();
    }

    let timeout = 3000;

    if(options.seconds) {
        timeout = options.seconds * 1000;
    }

    if(!toastHolder) {
        toastHolder = createClassedElement("div", "adl-toast-holder");
        document.body.appendChild(toastHolder);
    }

    let gridCols = "";

    const toast = createClassedElement("div", "adl-toast");

    if(options.icon) {
        const icon = createClassedElement("div", "adl-toast-icon");
        const glyph = getItemIcon(options.icon, options.iconColor);
        icon.appendChild(glyph);
        toast.appendChild(icon);
        gridCols += " auto";
    }

    if(options.message) {
        const message = createClassedElement("div", "adl-toast-message", options.message);
        toast.appendChild(message);
        gridCols += " 1fr";
    }

    if(options.background) {
        setElementBgFg(toast, options.background);
    }

    if(options.action) {
        const toastAction = createClassedElement("div", "adl-toast-action", options.action.text, options.action.color, function() {
            if(options.action.func) {
                toastHolder.removeChild(toast);
                options.action.func();
            }
            
        });

        toast.appendChild(toastAction);

        gridCols += " auto";
    }

    if(!options.action || !options.action.func) {
        toast.onclick = function() {
            toastHolder.removeChild(toast);
        };
    }

    toast.style.gridTemplateColumns = gridCols.trim();

    toastHolder.appendChild(toast);

    setTimeout(() => {
        try {
            toastHolder.removeChild(toast);
        } catch(ex) {
            console.warn("ADL Toast already removed", ex);
        }
        
    }, timeout);
}

export function showProgress(options) {
    if(!adlIsInit) {
        initADL();
    }

    showDialog({
        title: options.title || null,
        progress: {
            indeterminate: options.indeterminate || false,
            progress: options.percent || 0
        }
    });
}

export function updateProgress(options) {

    if(!adlDialog) {
        return;
    }

    if(!adlIsInit) {
        initADL();
    }

    if(options.title) {
        const title = adlDialog.querySelector(".adl-dialog-title");

        if(title) {
            title.textContent = options.title;
        }
    }

    if(currentDialogProgress) {
        if(options.indeterminate) {
            currentDialogProgress.indeterminate = true;
        } else {
            if(options.percent != undefined) {
                currentDialogProgress.value = options.percent;
            }
        }
    }
}

export function dismissProgress() {
    dismissDialogWindow(null);
}

export function setLowQualityMode(mode) {
    if(!adlIsInit) {
        initADL();
    }

    if(mode) {
        document.body.classList.add("adlLowQ");
    } else {
        document.body.classList.remove("adlLowQ");
    }
}

export function getInsets() {
    const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sait").replace("px",""));
    const right = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sair").replace("px",""));
    const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--saib").replace("px",""));
    const left = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sail").replace("px",""));

    return {
        top: top,
        right: right,
        bottom: bottom,
        left: left
    };
}

export function notifyBackPress() {
    if(isDialogShowing()) {
        if(!currentADLDialog.buttons || currentADLDialog.buttons.length < 2) {
            dismissDialogWindow(null);
            return true;
        }

        if(currentADLDialog.buttons && currentADLDialog.buttons.length >= 2) {
            // block back, dont dismiss
            return true;
        }
            
        if(currentADLDialog.input) {
            dismissDialogWindow(null);
            return true;
        }
    }

    // finally, check for popup menus
    return dismissPopupMenus();
}

function dismissPopupMenus() {
    console.log("DISMISS POPUP MENUS ADL");
}

function getItemIcon(icon, color = null) {
    const adlIcon = createClassedElement("div", "adl-icon");

    if(isThisAnImage(icon)) {
        adlIcon.classList.add("adl-image-icon");
        adlIcon.style.backgroundImage = `url(${icon})`;
    } else {
        adlIcon.innerHTML = cleanFontIcon(icon);
        if(emojiRegex.test(icon)) {
            adlIcon.classList.add("adl-emoji-icon");
        } else {
            adlIcon.classList.add("adl-font-icon");
        }
    }

    if(color) {
        adlIcon.style.color = color;
    }

    return adlIcon;
}

function cleanFontIcon(icon) {
    icon = icon.replace("fluent.", "");
    icon = icon.replace("fluent2.", "");
    icon = icon.replace("matnew.", "");
    icon = icon.replace("winicon.", "");
    icon = icon.replace("material.", "");

    if(icon.indexOf("&#x") == 0) {
        return icon;
    }

    const iconId = icons[icon];

    if(!iconId || isNaN(iconId)) {
        return icon;
    }

    const hex = decimalToHex(iconId);

    icon = "&#x" + hex + ";";

    return icon;
}

function iconNameToHex(iconName) {
    const iconId = icons[iconName];
    const hex = decimalToHex(iconId);
    const icon = "&#x" + hex + ";";

    return icon;
}

function decimalToHex(d) {
    let hex = Number(d).toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex;
}

function spawnMenu(menu, x, y) {

    if(!menu || !menu.items || menu.items.length == 0) {
        return;
    }

    const element = createClassedElement("div", "adl-menu adlPadZone");

    if(menu.title) {
        element.appendChild(createClassedElement("div", "adl-menu-title", menu.title, menu.titleColor));
    }

    let added = 0;

    for(let i = 0; i < menu.items.length; i++) {
        const opt = menu.items[i];
        const optEle = createMenuItem(opt, menu);

        if(optEle) {
            element.appendChild(optEle);
            added++;
        }
    }

    if(added < 1) {
        return;
    }

    document.body.appendChild(element);

    const rect = element.getBoundingClientRect();

    const w = rect.width;
    const h = rect.height;

    if(x + w > window.innerWidth) {
        x = window.innerWidth - w;
    }

    if(y + h > window.innerHeight) {
        y = window.innerHeight - h;
    }

    element.style.left = x + "px";
    element.style.top = y + "px";

    return element;
}

function createMenuIconRow(item) {

    if(!item.options || item.options.length == 0) {
        return null;
    }

    const element = createClassedElement("div", "adl-menu-icon-row");

    let gridCols = "";

    for(let i = 0; i < item.options.length; i++) {
        const opt = item.options[i];
        const optEle = createMenuIconRowItem(opt);

        if(optEle) {
            element.appendChild(optEle);
            gridCols += "1fr ";
        }
    }

    element.style.gridTemplateColumns = gridCols;

    return element;
}

function createMenuIconRowItem(item) {
    if(!item) {
        return null;
    }

    const element = createClassedElement("div", "adl-menu-icon-row-item", null, null, function() {
        closeAllPopupMenus();

        if(item.func) {
            item.func();
        }
    });

    if(item.icon) {
        const icon = createClassedElement("div", "adl-menu-icon-row-item-icon");
        const glyph = getItemIcon(item.icon, item.iconColor);
        icon.appendChild(glyph);
        element.appendChild(icon);
    }

    return element;
}

function createMenuItem(item, menu) {

    if(item.type) {
        if(item.type == "iconRow") {
            return createMenuIconRow(item);
        }

        if(item.type == "seperator" || item.type == "separator") {
            return createClassedElement("div", "adl-menu-separator");
        }
    }

    if(item.special && (item.special == "seperator" || item.special == "separator")) {
        return createClassedElement("div", "adl-menu-separator");
    }

    const element = createClassedElement("div", "adl-menu-item adlGamepadSelectable", null, null, function(e) {
        
        if(item.menu) {

            if(menu.currentSubmenu) {
                menu.currentSubmenu.remove();
            }

            const x = e.clientX;
            const y = e.clientY;

            menu.currentSubmenu = spawnMenu(item.menu, x, y);

            return;
        }
        
        closeAllPopupMenus();

        if(item.func) {
            item.func();
        }
    });

    if(item.icon) {
        const icon = createClassedElement("div", "adl-menu-item-icon");
        const glyph = getItemIcon(item.icon, item.iconColor);
        icon.appendChild(glyph);
        element.appendChild(icon);
    }

    if(item.title) {
        const title = createClassedElement("div", "adl-menu-item-title", item.title, item.color);
        element.appendChild(title);
    }

    if(item.menu) {
        const ind = createClassedElement("div", "adl-menu-item-menu-ind", iconNameToHex("ic_fluent_chevron_right_20_regular"));
        element.appendChild(ind);

        element.onpointerenter = function(e) {
            if(menu.currentSubmenu) {
                menu.currentSubmenu.remove();
            }

            const boundingBox = element.getBoundingClientRect();

            const x = boundingBox.right + 4;
            const y = e.clientY;

            menu.currentSubmenu = spawnMenu(item.menu, x, y);
        };
    } else {
        if(item.accelerator) {
            const accelerator = createClassedElement("div", "adl-menu-item-accelerator", item.accelerator);
            element.appendChild(accelerator);
        }

        element.onpointerenter = function() {
            if(menu.currentSubmenu) {
                menu.currentSubmenu.remove();
            }
        };
    }

    return element;
}

function createListOption(item) {

    if(!item) {
        return null;
    }

    if(item.special) {
        if(item.special == "separator" || item.special == "seperator") {
            return createClassedElement("div", "adl-list-seperator");
        }
    }

    const element = createClassedElement("div", "adl-list-item adlGamepadSelectable");

    if(item.icon || item.title) {
        let topRowClass = "adl-list-top-row-single";

        if(item.icon && item.title) {
            topRowClass = "adl-list-top-row-double";
        }

        const topRow = createClassedElement("div", topRowClass);

        if(item.icon) {
            const icon = createClassedElement("div", "adl-list-item-icon");
            const glyph = getItemIcon(item.icon, item.iconColor);
            icon.appendChild(glyph);
            topRow.appendChild(icon);
        }

        if(item.title) {
            topRow.appendChild(createClassedElement("div", "adl-list-item-title", item.title, item.titleColor));
        }

        element.appendChild(topRow);
    }

    if(item.description) {
        element.appendChild(createClassedElement("div", "adl-list-item-description", item.description));
    }

    if(item.status) {
        element.appendChild(createClassedElement("div", "adl-list-item-status", item.status, item.statusColor));
    }

    if(item.progress) {
        const progress = createClassedElement("progress", "adl");
        progress.value = item.progress || 0;
        progress.max = 100;
        element.appendChild(progress);
    }

    if(item.overflow && item.overflow.length > 0) {
        for(let i = 0; i < item.overflow.length; i++) {
            const overflowItem = item.overflow[i];
            element.appendChild(createListOverflowItem(overflowItem));
        }
    }

    element.onclick = function() {
        dismissDialogWindow();

        if(item.func) {
            item.func();
        }
    };

    return element;
}

function createListOverflowItem(item) {
    const element = createClassedElement("div", "adl-list-overflow-item");

    let overflowColumns = "";

    if(item.pre) {
        overflowColumns += " auto";
        element.appendChild(createClassedElement("div", "adl-list-overflow-item-pre", item.pre, item.color));
    }

    if(item.icon) {
        overflowColumns += " auto";

        const icon = createClassedElement("div", "adl-list-overflow-item-icon");
        const glyph = getItemIcon(item.icon, item.iconColor);

        if(item.iconWeight) {
            glyph.style.fontWeight = item.iconWeight;
        }

        icon.appendChild(glyph);
        element.appendChild(icon);
    }

    if(item.post) {
        overflowColumns += " auto";
        element.appendChild(createClassedElement("div", "adl-list-overflow-item-pre", item.post, item.color));
    }

    element.appendChild(createClassedElement("div"));
    overflowColumns += " 1fr";

    element.style.gridTemplateColumns = overflowColumns;

    return element;
}

export function isDialogOpen() {
    if(currentADLDialog) {
        return true;
    }

    return false;
}

function getIconNames() {
    return icons;
}

export default {
    COMMON_FLUENT_ICONS,
    addIonicons,
    setTheme,
    addToolbar,
    pickColor,
    getADLVersion,
    getIoniconVersion,
    showDialog,
    showAlert,
    showAlertWithTitle,
    showChoice,
    isHexColorDark,
    hexToColor,
    hexToInvertedRGB,
    getScriptURL,
    addADLStyle,
    initADL,
    getOverallThemeLight,
    gamepadXYCheck,
    canElementBeGamepadSelected,
    getDistance,
    hexToOffset,
    rgbToHex,
    normalizeBlend,
    normalizeOffset,
    weighColors,
    getTheme,
    inputBox,
    showList,
    popupMenu,
    showToast,
    dismissDialogWindow,
    showProgress,
    updateProgress,
    dismissProgress,
    setLowQualityMode,
    getInsets,
    showVRMenu,
    createCanvasMenu,
    notifyBackPress,
    isThisAnImage,
    closeAllPopupMenus,
    isDialogOpen,
    getIconNames,
    iconNameToHex
};