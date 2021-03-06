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
- adding a new highlight doesn't play well with existing span stuff </>
  - only send a the diff in background.js that I've already calculated for 'highlight-data-updated'
- getHtmlForHighlight see TODO
- expandSelectionToWhitespace doesn't work on something like: 'letter "Z"' bc it expands to 'letter "Z" have'
  - make the regex just expand until it's not a char instead of is a white space?
  - do something with indexes?

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
- test suite https://stackoverflow.com/questions/14798528/testing-browser-extensions/17370531#17370531

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