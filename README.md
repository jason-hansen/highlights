![highlights](/images/icon-128x128-h.png)

# HIGHLIGHTS
**A Chrome Extension to persist a user's highlights for web articles**

*by Jason Hansen*

&nbsp;

## HOW TO INSTALL
1. Download or clone the repo
2. Go to [chrome://extensions/](chrome://extensions/) and switch into "Developer mode" in the top right
3. Click the `Load unpacked` button in the top left and navigate to the downloaded folder
4. Find the extension in the list of extensions in the browser

## TODOs (for version 1)
- add unit tests somehow? https://stackoverflow.com/questions/14798528/testing-browser-extensions/17370531#17370531
  - expandSelectionToWhitespace() bugs?
    - text doesn't work on something like: 'letter "Z"' bc it expands to 'letter "Z" have'
    - do something with indexes
  - tests for getHtmlForHighlight()
  - tests for getHtmlEndIndex()
- adding a new highlight doesn't play well with existing span stuff </>
- why do the highlights disappear sometimes?
- edit manifest to allow all sites
  - selecting text within an input box triggers the extension... maybe something with selection type RANGE/CONTROL/INPUT?
- how come the on/off 'defaults' to on and then slides to off if it's false? it should probably just 'default' to false...

## ROADMAP (for version 2)
- expand info in highlight data: text, color, location, note, highlight type (underline, regular)
    - unique colors based on picker
    - ability to add notes to highlights
    - get the actual location and not just use the regex everywhere
- output/summary file like Grant suggested
- popup highlight list: add an 'x' to remove a specific highlight
- add other storage options like google account, google drive, dropbox or something so it can persist across devices
- keep track of highlights in a stack to undo/redo highlights
    - maybe this just comes with pushing to the array?
- hotkey to toggle on/off switch

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