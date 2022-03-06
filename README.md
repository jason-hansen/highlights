## HIGHLIGHTS
&nbsp;
## ABOUT
___
A Chrome Extension to persist a user's highlights for web articles.

&nbsp;
## TODOs (for version 1)
___
- double clicking in a text input triggers the extension...
    - maybe something with selection type RANGE/CONTROL/INPUT?
    - turn on/off from the popup?
    - some sort of confirmation dialog or something?
- make popup.html the settings page (like DarkReader)
    - color picker
- coloring
    - add some margin to the highlight color
    - add some color opacity to the highlight color?
- work on deleting if the highlight is the same
- consolidate logging into the backend? Or at least don't just let them die in the popup.js?
- beef up readme with how-to, style, icon attribution, etc

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