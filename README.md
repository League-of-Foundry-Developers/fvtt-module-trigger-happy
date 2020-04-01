# Trigger Happy

`Trigger Happy` is an FVTT module which adds a rudimentary system for creating triggers and automating things within a world.

This was created as a way of creating the interactive FVTT Tutorial on [The Forge](https://forgevtt.com/game/demo)

# Installation

You can install this module by using the following manifest URL : `https://raw.githubusercontent.com/kakaroto/fvtt-module-trigger-happy/master/module.json`

As GM go to the `Manage Modules` options menu in your World Settings tab then enable the `Trigger Happy` module.

# How to use

To create triggers for a scene, it's very easy, create a journal entry with the title "Trigger Happy" in which you will drag & drop actors, journals, macros, and anything else you want to trigger.

One line in the journal entry represents one trigger as long as the first link it contains is an Actor or a Scene. Any lines that do not have an actor or scene as their first link will be ignored, so feel free to organize your triggers however you see fit.

When a token that represents an trigger actor is clicked by a player, then any other links within that same line will be triggered. Macros will be executed, Scenes will be viewed, Roll tables will be rolled, and Journal entries will be displayed.

As an example, you can put this into your  : 
```
# Traps in Dungeon Room 37
@Actor[Transparent actor above trap #1] @JournalEntry[You have triggered a trap]
@Actor[Transparent actor above trap #2] @JournalEntry[You have triggered a trap]

# Teleport the PC if they touch the magic circle, I warned them not to approach that room anyway, so it's their fault if they do
@Actor[Magical Circle] @Scene[Prison Cell] @JournalEntry[You are teleported] @RollTable[Magical side effect from teleportation] @Macro[Spawn token at position 100,200]

# Move the players to the next scene when they open the door to the basement
@Actor[Hidden transparent token on door tile] @Scene[The basement]

# Display a dialog with the latest rumors the PCs hear when they enter the 
@Scene[Tavern] @Macro[Display Dialog about rumors]

# The next 100 lines create a complex sequence of triggers that automate the entire game so the DM's job is obsolete
```

You can create and organize actors that would be used specifically for triggers, and drop them anywhere you want on the map. Using a transparent token has the best effect, and the players don't need to have any permissions for the token (or scene or journal to display) for the trigger to work.
The trigger only works if they click on the token, not if they move their token to that region. Don't forget that you can also use token avatars as buttons, or change their width and height to fit your need.

If multiple triggers are in the same line, then they will be executed in sequence.


# Support

If you like this module and would like to help support its development, you can subscribe to my [Patreon](https://www.patreon.com/kakaroto) or if you prefer, you can also send me some rations via [Ko-Fi](https://ko-fi.com/kakaroto)

# License
This Foundry VTT module, writen by KaKaRoTo, is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).