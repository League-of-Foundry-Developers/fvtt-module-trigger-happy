# Changelog

## 0.8.12

- Added `@Tag[list of tag separate from ',']` as a filter link to interact with a specific placeable object on the canvas.
- Add basic eslint
- Add gulp build file for more relaxing build of the source
- Add github action for generate release with 'module.zip' and 'module.json'
- Partial integration with Stairways mdule

## 0.8.11

- Added `@JournalEntry[id]{label}` as an effect link to interact with note on the canvas.

## 0.8.10
- Added `@Compendium[id]{label}` as an effect link to display compendium entries.
- Confirmed that @Quest entries work.

## 0.8.9 [2021-09-15]

- Add prettier
- Add internationalization
- Add more intuitive workflow for the hooks
- Integration of the ecmascript module mechanism
- Update README.md
- Allow tokens to be found by ID (from TheGiddyLimit fork)

## 0.8.8
- Fix so that unlocking a door does not triggere the door close trigger.

## 0.8.6
 - Added a config setting to disable/enable the trigger happy active/inactive button on the context menu.
 
## 0.8.5
- Foundry vtt 0.8 compatible.
- New config setting edge collision. If set tokens will be captured at the edge of a drawing/token rather than the center.
- fix the silly packaging error

## 0.8.3
- Foundry vtt 0.8 compatible.
- New config setting edge collision. If set tokens will be captured at the edge of a drawing/token rather than the center.

## v0.7

- Add support for labelled drawings as triggers

## v0.4.1

- Fix issue causing click triggers to fail for players not owning the trigger token

## v0.4

- Add support for capture triggers (@tposney)
- Add support for API changes in FVTT 0.5.4

## v0.3

- Add support for triggers when moving a token over a trigger token (@tposney)
- Fix a couple of bugs with regards to journal entries and chat messages (@tposney)
- Add the ability to trigger tokens by clicking on them even if they are hidden from the player
- Add support for `@Trigger[options]` links with options for move, click, stopMovement, ooc, emote, whisper, preload
- Add support for having multiple journals and journals within subfolders
- Fix new line detection when journal entry is written in preformatted text or div mode
- Add support for sending chat messages using an alias


## v0.2
- Add support for `@Actor[name]` links instead of only drag&dropped `@Actor[id]` links
- Add support for Token trigger
- Add support for sending chat messages as trigger effects (useful with advanced macros)
- Add support for setting a token as controlled as a trigger effect

## v0.1
- Initial release with support for Actor and Scene triggers
