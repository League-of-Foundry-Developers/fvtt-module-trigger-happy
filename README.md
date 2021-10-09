![Trigger Happy](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FLeague-of-Foundry-Developers%2Fleague-repo-status%2Fshields-endpoint%2Ffvtt-module-trigger-happy.json)

# Trigger Happy

`Trigger Happy` is an FVTT module which adds a powerful yet simple system for creating triggers and automating things within a world.

This was created as a way of creating the interactive FVTT Tutorial on [The Forge](https://forgevtt.com/game/demo)

# Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:

`https://raw.githubusercontent.com/League-of-Foundry-Developers/fvtt-module-trigger-happy/master/module.json`

4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

### If your triggers mysteriously stop working check that you have not disabled them by mistake.

![HUD](https://user-images.githubusercontent.com/4486143/136141666-b681c6f9-e1f6-4d76-977b-241f987d4f0c.png) 

The laughing/crying face needs to be enabled or you can disable the face from the config settings.

# Video and Step by Step instructions

before we get into the details of how to use Trigger Happy, I think these links might be easier for people to get started quickly with using this module. Don't forget to come back and read the full README file to understand the full extent of how you can use Trigger Happy.

Here is a "Introduction to Trigger Happy" video tutorial by ['D&D Population Me'](https://patreon.com/dndpopulationme) : [https://www.youtube.com/watch?v=okTWYO4oEMA](https://www.youtube.com/watch?v=okTWYO4oEMA)

['D&D Population Me'](https://patreon.com/dndpopulationme) has also made two useful step by step guides for the most common use cases for using Trigger Happy :
- Token teleportation tutorial : [https://forums.forge-vtt.com/t/trigger-happy-teleportation-tutorial/2117/6](https://forums.forge-vtt.com/t/trigger-happy-teleportation-tutorial/2117/6)
- Scene Trap tutorial : [https://forums.forge-vtt.com/t/trigger-happy-traps/3448/4](https://forums.forge-vtt.com/t/trigger-happy-traps/3448/4)

Trigger Happy also comes with journal entries in its compendiums that gives useful examples of trigger scenarios you can use.

# How to use

To create triggers for a scene, it's very easy, create a journal entry with the title "Trigger Happy" (configurable in module settings) in which you will drag & drop actors, journals, macros, and anything else you want to trigger.

You can also create a Folder with the same "Trigger Happy" name and any journal entry inside that folder or in any of its own subfolders will be considered a trigger journal, so you can organize your trigger journals any way you want, when things start to get complex.

One line in the journal entry represents one trigger as long as the first link it contains is an Actor, a Token or a Scene. Any lines that do not have an actor or scene as their first link will be ignored, so feel free to organize your triggers however you see fit.

When a token that represents a trigger actor is clicked by a player, then any other links within that same line will be triggered. Macros will be executed, Scenes will be viewed, Roll tables will be rolled, Journal entries will be displayed and Tokens will be selected.

As an example, you can put this into your entry : 
```
# Traps in Dungeon Room 37
@Actor[Transparent actor above trap #1] @JournalEntry[You have triggered a trap]
@Actor[Transparent actor above trap #2] @JournalEntry[You have triggered a trap]

# Teleport the PC if they touch the magic circle, I warned them not to approach that room anyway, so it's their fault if they do
@Actor[Magical Circle] @Scene[Prison Cell] @JournalEntry[You are teleported] @RollTable[Magical side effect from teleportation] @Macro[Spawn token at position 100,200]

# Move the players to the next scene when they open the door to the basement
@Actor[Transparent token on door tile] @Scene[The basement]

# Display a dialog with the latest rumors the PCs hear when they enter the tavern, and show them the lcoal prices
@Scene[Tavern] @Macro[Display Dialog about rumors] @JournalEntry[Tavern room prices]

# The next 100 lines could create a complex sequence of triggers that automate the entire game so the DM's job is obsolete
```

The above example used the `@Actor[name]` format for simplicity, but when drag&dropping actors, they would appear in the journal entry as `@Actor[id]{name}`.

You can also use some non-official 'links' by using the same format : 
- `@Token[token name]` : If used as a trigger, this will cause the triggers to activate on any token with the specified name (you cannot set a token id in this case). As a trigger effect, it will cause the player to select the first token matching that name.
- `@ChatMessage[message contents]` : As an effect, this will send the specified message contents as a chat message
- `@Trigger[option1 option2 option3]` : This applies modifiers on the trigger line, keep reading for more information about available options.
- `@Drawing[label]` : This will trigger the effects when the player clicks/moves a token within the area of a drawing which has its text set to the `label` specified. Works best with rectangles.
- `@Door[coordinates]` : This will trigger the effects when a player opens or closes a door (based on options). The coordinates can be copy/pasted from the wall configuration sheet (excluding the `[` and `]`).
- `@Compendium[id]{name}` only useable as an effect will display the compendium entry.
- `@JournalEntry[token name]` If used as a trigger, this will cause the triggers to activate on any journal with the specified name (you cannot set a token id in this case). As a trigger effect

By using a `Token` trigger, you can have a single actor for your triggers (a door, a button or a transparent image) but setting a different and unique name for your tokens would allow you to use them as different triggers, without duplicating actors all over your actors directory.

By using the `ChatMessage` effect, you can send any message to chat. When used in combination with [Advanced Macros](https://github.com/League-of-Foundry-Developers/fvtt-advanced-macros), you can use it to trigger macros with arguments specific to your trigger. Previously The Furnace was suggested, but that is now out of data and Advanced Macros provides the identical functionality.

You can also use the format `@ChatMessage[message contents]{speaker name alias}`

As an example : 

```
@Token[unique token name] @ChatMessage[Stop right there!]{Guard} @ChatMessage[/pan 1500 1500 0.3]

@Scene[World Map] @Token[Party Marker]
```

You can create and organize actors that would be used specifically for triggers, and drop them anywhere you want on the map. Using a transparent token has the best effect, and the players don't need to have any permissions for the token (or scene or journal to display) for the trigger to work.
The triggers on actors and tokens will work only if they click on the token in the case of visible tokens, and if the token is hidden (GM layer), then it will activate the trigger when the player moves their token within the trigger token. Note that they can always do a long move and jump over the token which would not trigger the effects.
Don't forget that you can also use token avatars as buttons, or change their width and height to fit your need.

If multiple trigger effects are in the same line, then they will be executed in sequence, waiting for the previous effect to finish before starting the next one.

## Advanced options

You can customize the behavior a little using the `@Trigger` pseudo link which allows you to set options.
The following options are available : 
- `ooc`: Will send any chat messages in that trigger as an out of character message
- `emote`: Will send any chat messages in that trigger as an emote
- `whisper`: Will send any chat messages in that trigger as a whisper to the GM
- `selfWhisper`: Will send any chat messages in that trigger as a whisper to the player who activates the trigger
- `preload`: Will cause any scene on the trigger line to be preloaded instead of switching the view to it
- `click`: Will cause the trigger token to activate on a click
- `move`: Will cause the trigger token to activate on a token move over it
- `stopMovement`: Will prevent any tokens from moving on top of the trigger token
- `capture`: Will cause the trigger token to capture any player moment that crosses it
- `doorClose`: Will cause a `@Door` trigger to trigger when the door is closed instead of the default when it opens.
- `doorOpen`: Will cause a `@Door` trigger to trigger when the door is open. This is the default, but it can be used along with `doorClose` option to have it trigger on both open and close

If a token is hidden (GM layer), then it is automatically considered a 'move' trigger, otherwise it's a 'click' trigger. You can override it with the `@Trigger[click]` or `@Trigger[move]` options, or you can specify both options to make a token trigger on both clicks and moves.

Contrarily to the `@Trigger[move]` triggers, which only activate when a token ends its movement on their, the `@Trigger[capture]` will trigger when a token crosses its path, which can be very useful to setting up a trap that the players cannot jump over. When a `capture` trigger is activated, the token movement will be stoped and the token will be moved to the center of the trigger. The token can only be moved out of the `capture` trigger if its starting position is the center of the trigger.

Here's an example of how these trigger options can be used together :

```
# When the player enters the scene, preload the next one

@Scene[Dungeon level 1] @Scene[Dungeon level 2] @Trigger[preload]

# When they click on the stairs, move them to the preloaded scene and select a token

@Token[Lvl 1 bottom stairs] @Scene[Dungeon level 2] @Token[a specific token they can control]

# Prevent the player from jumping into the bonfire like a moron

@Token[Bonfire] @ChatMessage[Your friends stop you from jumping into the fire, that can be dangerous]{GM} @Trigger[move stopMovement ooc]

# But let them touch it

@Token[Bonfire] @Trigger[click] @ChatMessage[You burn your hand slightly]{GM}

# If they click or try to move through the chasm, say something, but let them jump over it

@Token[hole in bridge over the chasm] @ChatMessage[The drop looks like 1000 feet]{Chasm} @Trigger[move click stopMovement ooc]

@Token[hole in bridge over the chasm] @ChatMessage[is scared] @Trigger[emote]

# When they click on the journal, a chat message in rendered

@JournalEntry[TEST] @Trigger[click] @ChatMessage[You burn your hand slightly]

# When they click on the journal, open another journal instead ??

@JournalEntry[TEST] @Trigger[click] @JournalEntry[TEST 2]

# New Forien Quest Log support with the new 0.7.7 version and rhe ID Quest mechanism
# here the video on the exact minute: https://youtu.be/lfSYJXVQAcE?t=586

@JournalEntry[TEST] @Trigger[click] @Quest[xXj5KZlMvGn3pTX8]{New Quest}

```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/League-of-Foundry-Developers/fvtt-module-trigger-happy/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

This Foundry VTT module, writen by KaKaRoTo, is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
