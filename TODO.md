# TODO

## General
- Remove useless annotation in preview
- Update the /help ("guide et astuces"): give the stave keybinds (backspace, ctrl-backspace)
- Result popup: add download links ;

## Bugs
- svg are generated for each result and so process can break when viewing individual result on result page ;
- cle du caveau -> highlight matching broken ;

- Result popup: when the popup appears, it goes to the top of the behind page (this is because it set `overflow: hidden`), which is a problem when closing the popup: the user has to scroll down again to see the other results ;
- Paginated results: fix the csv button (get the code from the old frontend)
- collection choice is bound to collection page
- responsive nav not working

## New features
- query-by-humming/by-instrument
- remove multipage for results when using keyboard -> keep results preview for quick switch, put clicked result in place of the keyboard
- better listening capabilities for results 
- UI for contour expression
- migrating to Vue.js
