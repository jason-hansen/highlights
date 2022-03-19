# HIGHLIGHTS by Jason Hansen

## ABOUT
A Chrome Extension to persist a user's highlights for web articles.

## DATA
```
{
    "highlights": [],
    "on": false,
    "url": "",
    "highlightColor": "",
    "highlightLabelColor": ""
}
```

## TODOs (for version 1)
- work on popup (basically the settings page)
    - color picker functionality to persist the chosen color (or default? in the ??= operator?)
    - better data practices with buttons
        - make them both use message calls
        - make 'clear page highlights' button just empty the list, not wipe all the data for that site
        - disable 'clear page highlights' if there aren't any to begin with?
    - organize popup.js code better
- clear up hacky if statements about if it's boolean/null/undefined?
- preferred/newer js function() { } or just () => { }
- edit manifest to allow all sites
- selecting text within an input box triggers the extension...
    - maybe something with selection type RANGE/CONTROL/INPUT?
    - turn on/off from the popup?
    - some sort of confirmation dialog or something?
- expanding regex wrong?
    - text doesn't work on something like: 'letter "Z"' bc it expands to 'letter "Z" have'
- injecting a span doesn't work if the highlight is across multiple html tags (p, em, etc.)
- consolidate logging into the backend? Or at least don't just let them die in the popup.js?
- beef up readme with how-to "load unpacked", how-to use it, style, icon attribution, etc
- code/file organization?
- add unit tests somehow?

## ROADMAP (for version 2)
- JSON of highlight: text, color, location, note
    - unique colors based on picker
    - ability to add notes to highlights
    - get the actual location and not just use the regex everywhere
- output/summary file like Grant suggested
- popup highlight list: add an 'x' to remove a specific highlight
- add other storage options like google account, google drive, dropbox or something so it can persist across devices
- keep track of highlights in a stack to undo/redo highlights
    - maybe this just comes with pushing to the array?
- hotkey to toggle on/off switch