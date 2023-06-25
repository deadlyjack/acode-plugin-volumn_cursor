const initKeyboardEventType = (function (event) {
  try {
    event.initKeyboardEvent(
      "keyup" // in DOMString typeArg
      , false // in boolean canBubbleArg
      , false // in boolean cancelableArg
      , window // in views::AbstractView viewArg
      , "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
      , 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
      , true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
      , false // [test]shift | alt
      , true // [test]shift | alt
      , false // meta
      , false // altGraphKey
    );

    return ((event["keyIdentifier"] || event["key"]) == "+" && (event["location"]) || event["keyLocation"] == 3) && (
      event.ctrlKey ?
        event.altKey ? // webkit
          1 :
          3 :
        event.shiftKey ?
          2 : // webkit
          4 // IE9
    ) || 9; // FireFox|w3c
  } catch (error) {
    initKeyboardEventType = 0
  }
})(document.createEvent("KeyboardEvent"));

const keyboardEventPropertiesDictionary = {
  "char": "",
  "key": "",
  "location": 0,
  "ctrlKey": false,
  "shiftKey": false,
  "altKey": false,
  "metaKey": false,
  "repeat": false,
  "locale": "",

  "detail": 0,
  "bubbles": false,
  "cancelable": false,

  //legacy properties
  "keyCode": 0,
  "charCode": 0,
  "which": 0
};

const own = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

const ObjectDefineProperty = Object.defineProperty || function (obj, prop, val) {
  if ("value" in val) {
    obj[prop] = val["value"];
  }
};

export default function KeyboardEvent(type, dict) {
  let event;
  if (initKeyboardEventType) {
    event = document.createEvent("KeyboardEvent");
  } else {
    event = document.createEvent("Event");
  }

  let propName;
  let localDict = {};

  for (propName in keyboardEventPropertiesDictionary)
    if (own(keyboardEventPropertiesDictionary, propName)) {
      localDict[propName] = (own(dict, propName) && dict || keyboardEventPropertiesDictionary)[propName];
    }

  const ctrlKey = localDict["ctrlKey"];
  const shiftKey = localDict["shiftKey"];
  const altKey = localDict["altKey"];
  const metaKey = localDict["metaKey"];
  const altGraphKey = localDict["altGraphKey"];

  const modifiersListArg = initKeyboardEventType > 3 ? (
    (ctrlKey ? "Control" : "") +
    (shiftKey ? " Shift" : "") +
    (altKey ? " Alt" : "") +
    (metaKey ? " Meta" : "") +
    (altGraphKey ? " AltGraph" : "")
  ).trim() : null

  const key = localDict["key"] + "";
  const char = localDict["char"] + "";
  const location = localDict["location"];
  const keyCode = localDict["keyCode"] || (localDict["keyCode"] = key && key.charCodeAt(0) || 0);
  const charCode = localDict["charCode"] || (localDict["charCode"] = char && char.charCodeAt(0) || 0);
  const bubbles = localDict["bubbles"];
  const cancelable = localDict["cancelable"];
  const repeat = localDict["repeat"];
  const locale = localDict["locale"];
  const view = window;

  localDict["which"] || (localDict["which"] = localDict["keyCode"]);

  if ("initKeyEvent" in event) { //FF
    //https://developer.mozilla.org/en/DOM/event.initKeyEvent
    event.initKeyEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
  } else if (initKeyboardEventType && "initKeyboardEvent" in event) { //https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
    if (initKeyboardEventType == 1) { // webkit
      //http://stackoverflow.com/a/8490774/1437207
      //https://bugs.webkit.org/show_bug.cgi?id=13368
      event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrlKey, shiftKey, altKey, metaKey, altGraphKey);
    } else if (initKeyboardEventType == 2) { // old webkit
      //http://code.google.com/p/chromium/issues/detail?id=52408
      event.initKeyboardEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
    } else if (initKeyboardEventType == 3) { // webkit
      event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrlKey, altKey, shiftKey, metaKey, altGraphKey);
    } else if (initKeyboardEventType == 4) { // IE9
      //http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
      event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, modifiersListArg, repeat, locale);
    } else { // FireFox|w3c
      //http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
      //https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
      event.initKeyboardEvent(type, bubbles, cancelable, view, char, key, location, modifiersListArg, repeat, locale);
    }
  } else {
    event.initEvent(type, bubbles, cancelable)
  }

  for (propName in keyboardEventPropertiesDictionary)
    if (own(keyboardEventPropertiesDictionary, propName)) {
      if (event[propName] != localDict[propName]) {
        try {
          delete event[propName];
          ObjectDefineProperty(event, propName, {
            writable: true,
            "value": localDict[propName]
          });
        } catch (error) {
          //Some properties is read-only
        }

      }
    }

  return event;
}
