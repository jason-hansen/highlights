## HIGHLIGHTS
&nbsp;
## ABOUT
___
A Chrome Extension to persist a user's highlights for web articles.

&nbsp;
## TODOs (for version 1)
___
// TODO hey jason!!!
    - brand new site has the switch as 'on'
        - is highlighting on/off for the whole world?... yes. bc 'isHighlighting' in storage is general and not for each specific url
    - on/off toggling works in the UI and in the storage
        - sometimes it renders as 'on' even though it's off in the storage?
    - don't do 'sending to popup' code at all... make an if tabs.length > 1 around the whole thing
    - clear up hacky if statements about if it's boolean/null/undefined
    - remove 'highlighting is currently off for this url' print statements
    - preferred/newer js function() { } or just () => { }
    - no need to have popup.js listen to "updated-highlight-list"
    - are the chrome.tabs.reload(tabId); in popup.js necessary?
    - what about the one in background.js?
        - this is probably overkill?
- make popup.html the settings page
    - on/off toggling
        - toggle on a per url basis
            - store boolean TRUE when switch is flipped
            - check for boolean in content.js in mouseup listener and just return out early
        - default to off
        - for if highlighting works on that page or not
        - for visibly displaying the highlights at all?
    - color picker functionality to actually persist the chosen color (or default)
    - iterate over that page's highlights
        - add 'x' to remove a specific highlight
        - scrolling
- selecting text within an input box triggers the extension...
    - maybe something with selection type RANGE/CONTROL/INPUT?
    - turn on/off from the popup?
    - some sort of confirmation dialog or something?
- expanding regex wrong?
    - text doesn't work on something like: 'letter "Z"' bc it expands to 'letter "Z" have'
- fix html injection for highlights
    - injecting when the string is found just wraps the existing highlight (if there is one) with another span
    - injecting a span doesn't work if the highlight is across multiple html tags
- delete highlight if user re-highlights the same thing
- consolidate logging into the backend? Or at least don't just let them die in the popup.js?
- beef up readme with how-to "load unpacked, how-to use it, style, icon attribution, etc
- add text binding to toggle extension for that site

&nbsp;
## ROADMAP (for version 2)
___
- JSON of highlight: text, color, location, note
    - unique colors based on picker
    - ability to add notes to highlights
    - get the actual location and not just use the regex everywhere
- output/summary file like Grant suggested
- add other storage options like google account, google drive, dropbox or something so it can persist across devices
- keep track of highlights in a stack to undo/redo highlights