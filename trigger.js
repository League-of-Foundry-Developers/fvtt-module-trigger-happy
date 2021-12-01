export const TRIGGER_HAPPY_MODULE_NAME = 'trigger-happy';

export const log = (...args) => console.log(`${TRIGGER_HAPPY_MODULE_NAME} | `, ...args);
export const warn = (...args) => {
  console.warn(`${TRIGGER_HAPPY_MODULE_NAME} | `, ...args);
};
export const error = (...args) => console.error(`${TRIGGER_HAPPY_MODULE_NAME} | `, ...args);
export const timelog = (...args) => warn(`${TRIGGER_HAPPY_MODULE_NAME} | `, Date.now(), ...args);

export const i18n = (key) => {
  return game.i18n.localize(key);
};
export const i18nFormat = (key, data = {}) => {
  return game.i18n.format(key, data);
};

export const uiwarn = (text) => {
  ui.notifications?.warn(`${TRIGGER_HAPPY_MODULE_NAME} | ${text}`);
}


class CompendiumLink {
  packId;
  id;
  label;
  constructor(packId, id, label) {
    this.packId = packId;
    this.id = id;
    this.label = label;
  }
}

class SoundLink {
  playlistName;
  soundName;
  label;
  constructor(playlistName, soundName, label) {
    this.playlistName = playlistName;
    this.soundName = soundName;
    this.label = label;
  }
}

class ChatLink {
  chatMessage;
  type;
  whisper;
  constructor(chatMessage, type , whisper){
    this.chatMessage = chatMessage;
    this.type = type;
    this.whisper = whisper;
  }
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async () => {
  log(`Initializing ${TRIGGER_HAPPY_MODULE_NAME}`);

  // Register settings

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'folderJournalName', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.folderJournalName.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.folderJournalName.hint`),
    scope: 'world',
    config: true,
    default: 'Trigger Happy',
    type: String,
    onChange: () => {
      if (game.triggers){
        game.triggers._parseJournals.bind(game.triggers)();
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'journalName', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.journalName.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.journalName.hint`),
    scope: 'world',
    config: true,
    default: 'Trigger Happy',
    type: String,
    onChange: () => {
      if (game.triggers){
        game.triggers._parseJournals.bind(game.triggers)();
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTriggers.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTriggers.hint`),
    scope: 'client',
    config: false,
    default: true,
    type: Boolean,
    onChange: () => {
      if (game.triggers){
        game.triggers._parseJournals.bind(game.triggers)();
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'edgeCollision', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.edgeCollision.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.edgeCollision.hint`),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggerButton', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTriggerButton.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTriggerButton.hint`),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => {
      if (!game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggerButton')) {
        game.settings.set(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers', true);
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableTaggerIntegration', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTaggerIntegration.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTaggerIntegration.hint`),
    scope: 'world',
    config: true,
    default: '',
    type: String,
    onChange: () => {
      if (game.triggers){
        game.triggers._parseJournals.bind(game.triggers)();
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableJournalForSceneIntegration', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableJournalForSceneIntegration.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableJournalForSceneIntegration.hint`),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
    onChange: () => {
      if (game.triggers){
        game.triggers._updateJournals.bind(game.triggers)();
        game.triggers._parseJournals.bind(game.triggers)();
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'onlyUseJournalForSceneIntegration', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.onlyUseJournalForSceneIntegration.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.onlyUseJournalForSceneIntegration.hint`),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
    onChange: () => {
      if (game.triggers){
        game.triggers._updateJournals.bind(game.triggers)();
        game.triggers._parseJournals.bind(game.triggers)();
      }
    },
  });

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableAvoidDeselectOnTriggerEvent', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableAvoidDeselectOnTriggerEvent.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableAvoidDeselectOnTriggerEvent.hint`),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  game.triggers = new TriggerHappy();
  Hooks.on('getSceneControlButtons', TriggerHappy.getSceneControlButtons);

});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', () => {
  // Do something
  Hooks.on('PreStairwayTeleport', (data) => {
    const { sourceSceneId, sourceData, selectedTokenIds, targetSceneId, targetData, userId } = data;
    // const event = {
    //   x: sourceData.x,
    //   y: sourceData.y,
    //   sceneId: sourceSceneId,
    //   id: sourceData.name,
    //   name: sourceData.label
    // };
    try{
      // const position = (event.x && event.y) ? {x:event.x, y:event.y} : game.triggers._getMousePosition(event);
      const upStairways = [];
      if(sourceSceneId){
        let clickStairway = game.triggers._retrieveFromIdOrName(game.triggers._getStairways(sourceSceneId), sourceData.name);
        if(!clickStairway) game.triggers._retrieveFromIdOrName(game.triggers._getStairways(sourceSceneId), sourceData.label);
        upStairways.push(clickStairway);
      }
      if (upStairways.length === 0){
        return;
      }
      const triggers = game.triggers._getTriggersFromStairways(game.triggers.triggers, upStairways, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
      game.triggers._executeTriggers(triggers);
    }finally{
      if(game.triggers.enableRelease){
        // Needed this for module compatibility and the release on click left option active
        game.settings.set('core', 'leftClickRelease', game.triggers.release);
      }
    }
  });
});

// Add any additional hooks if necessary

export const TRIGGER_ENTITY_TYPES = {
  TRIGGER: 'trigger',
  CHAT_MESSAGE: 'chatmessage',
  ACTOR: 'actor',
  TOKEN: 'token',
  SCENE: 'scene',
  DRAWING: 'drawing',
  DOOR: 'door',
  COMPENDIUM: 'compendium',
  JOURNAL_ENTRY: 'journalentry',
  STAIRWAY: 'stairway',
  SOUND_LINK: 'sound', // not the ambient sound the one from the sound link module
  PLAYLIST: 'playlist',
  // New support key ????
  WHISPER: 'whisper',
};

export const EVENT_TRIGGER_ENTITY_TYPES = {
  OOC: `ooc`,
  EMOTE: `emote`,
  WHISPER: `whisper`,
  SELF_WHISPER: `selfwhisper`,
  PRELOAD: `preload`,
  CLICK: `click`,
  MOVE: `move`,
  STOP_MOVEMENT: `stopmovement`,
  CAPTURE: `capture`,
  DOOR_CLOSE: `doorclose`,
  DOOR_OPEN: `dooropen`,
};

export class TriggerHappy {
  constructor() {
    Hooks.on('ready', this._parseJournals.bind(this));
    Hooks.on('canvasReady', this._onCanvasReady.bind(this));
    Hooks.on('controlToken', this._onControlToken.bind(this));
    Hooks.on('createJournalEntry', this._parseJournals.bind(this));
    Hooks.on('updateJournalEntry', this._parseJournals.bind(this));
    Hooks.on('deleteJournalEntry', this._parseJournals.bind(this));
    Hooks.on('preUpdateToken', this._onPreUpdateToken.bind(this));
    Hooks.on('preUpdateWall', this._onPreUpdateWall.bind(this));
    Hooks.on('renderSettingsConfig', this._parseJournals.bind(this)); // TODO maybe we don't need this anymore ???
    Hooks.on('preUpdateNote', this._onPreUpdateNote.bind(this));
    Hooks.on('getSceneNavigationContext', this._parseJournals.bind(this)); // parse again the journal when change scene

    this.triggers = [];
    this.taggerModuleActive = game.modules.get('tagger')?.active
    this.release = game.settings.get('core', 'leftClickRelease');
    this.enableRelease = game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableAvoidDeselectOnTriggerEvent');

    this.arrayTriggers = Object.values(TRIGGER_ENTITY_TYPES);
    this.arrayEvents = Object.values(EVENT_TRIGGER_ENTITY_TYPES);
    this.arrayPlaceableObjects = [
      TRIGGER_ENTITY_TYPES.TOKEN,
      TRIGGER_ENTITY_TYPES.DRAWING,
      TRIGGER_ENTITY_TYPES.DOOR,
      TRIGGER_ENTITY_TYPES.JOURNAL_ENTRY,
      TRIGGER_ENTITY_TYPES.STAIRWAY,
    ];
    this.arrayNoPlaceableObjects = [
      TRIGGER_ENTITY_TYPES.ACTOR,
      TRIGGER_ENTITY_TYPES.CHAT_MESSAGE,
      TRIGGER_ENTITY_TYPES.COMPENDIUM,
      TRIGGER_ENTITY_TYPES.SCENE,
      TRIGGER_ENTITY_TYPES.SOUND_LINK,
      TRIGGER_ENTITY_TYPES.PLAYLIST
    ]
    this.journals = [];
  }

  get folderJournalName() {
    return game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'folderJournalName') || 'Trigger Happy';
  }

  get journalName() {
    return game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'journalName') || 'Trigger Happy';
  }

  _updateJournals(){
    const folders = game.folders.contents.filter((f) => f.type === 'JournalEntry' && f.name === this.folderJournalName);
    const journals = game.journal.contents.filter((j) => j.name === this.journalName);
    // Make sure there are no duplicates (journal name is within a folder with the trigger name)
    this.journals = Array.from(new Set(this._getFoldersContentsRecursive(folders, journals)));
  }

  _getFoldersContentsRecursive(folders, contents) {

    const currentScene = game.scenes.current;
    const enableJournalForScene = game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableJournalForSceneIntegration');
    const onlyUseJournalForScene = game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'onlyUseJournalForSceneIntegration');

    return folders.reduce((contents, folder) => {
      // Cannot use folder.content and folder.children because they are set on populate and only show what the user can see
      let content = game.journal.contents.filter((j) => j.data.folder === folder.id) || []; // This is the array of journalEntry under the current folder
      if(enableJournalForScene){
        const contentTmp = [];
        content.forEach((journalEntry) => {
          if(currentScene && (journalEntry.data.name.startsWith(currentScene.name) || journalEntry.id.startsWith(currentScene.id))){
            contentTmp.push(journalEntry);
          }else{
            if(!onlyUseJournalForScene){
              contentTmp.push(journalEntry); // standard
            }
          }
        });
        content = contentTmp;
      }
      if(content && content.length > 0) contents.push(...content);
      const children = game.folders.contents.filter((f) => f.type === 'JournalEntry' && f.data.parent === folder.id);
      return this._getFoldersContentsRecursive(children, contents);
    }, contents);
  }

  async _parseJournals() {
    this.triggers = [];
    if (game.user.isGM && !game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers')){
      return;
    }
    this._updateJournals();
    this.journals.forEach((journal) => this._parseJournal(journal));
  }

  async _parseJournal(journal) {
    const triggerLines = journal.data.content
      .replace(/(<p>|<div>|<br *\/?>)/gm, '\n')
      .replace(/&nbsp;/gm, ' ')
      .split('\n');

    // Remove empty/undefined/non valid lines before loop more easy to debug
    const filteredTriggerLines = triggerLines.filter(function (el) {
      return el != null && el != undefined && el != '' && el.includes('@');
    });

    const entityLinks = Object.keys(CONFIG).concat(this.arrayTriggers);

    for (const line of filteredTriggerLines) {
      // We check this anyway with module tagger active or no
      const entityMatchRgxTagger = `@(Tag)\\[([^\\]]+)\\]`;
      const rgxTagger = new RegExp(entityMatchRgxTagger, 'ig');
      const matchAllTags = line.matchAll(rgxTagger) || [];
      let filterTags = [];
      let lineTmp = line;
      for (let matchTag of matchAllTags) {
        if(matchTag){
          let [triggerJournal, entity, id, label] = matchTag;
          lineTmp = lineTmp.replace(rgxTagger, '');
          // Remove prefix '@Tag[' and suffix ']'
          filterTags.push(...triggerJournal.substring(5, triggerJournal.length-1).split(','));
        }
      }

      const entityMatchRgx = `@(${entityLinks.join('|')})\\[([^\\]]+)\\](?:{([^}]+)})?`;
      const rgx = new RegExp(entityMatchRgx, 'ig');
      let options = [];
      let triggers = [];
      let effects = [];

      let matchs = lineTmp.matchAll(rgx);
      let index = 0;
      for (let match of matchs) {
        let [triggerJournal, entity, id, label] = match;
        entity = entity.toLowerCase(); // force lowercase for avoid miss typing from the user
        if(index === 0){
          // Special case '*'
          if(id === '*'){
            const triggersTmp = this._retrieveAllFromEntity(entity) ?? [];
            for(let trigger of triggersTmp){
              if(trigger != null && trigger != undefined){
                trigger = this._checkTagsOnTrigger(entity, trigger, filterTags);
                if(trigger){
                  if(trigger instanceof String){
                    trigger = trigger.toLowerCase(); // force lowercase for avoid miss typing from the user
                  }
                  triggers.push(trigger);
                }
              }
            }
          }else{
            let trigger = this._manageTriggerEvent(triggerJournal, entity, id, label, filterTags);
            if(!trigger){
              break;
            }
            trigger = this._checkTagsOnTrigger(entity, trigger, filterTags);
            if(!trigger){
              break;
            }
            if(trigger){
              if(trigger instanceof String){
                trigger = trigger.toLowerCase(); // force lowercase for avoid miss typing from the user
              }
            }
            if(trigger){
              triggers.push(trigger);
            }
          }
        } else if(entity === TRIGGER_ENTITY_TYPES.TRIGGER){
          let ids = id.split(" ");
          for (let id1 of ids) {
            let eventLink = this._manageTriggerEvent(triggerJournal, entity, id1, label, filterTags);
            if(eventLink){
              if(eventLink instanceof String){
                eventLink = eventLink.toLowerCase(); // force lowercase for avoid miss typing from the user
              }
              options.push(eventLink);
            }
          }
        } else {
          let effect = this._manageTriggerEvent(triggerJournal, entity, id, label, filterTags);
          if(!effect){
            continue;
          }
          if(effect instanceof String){
            eventLink = effect.toLowerCase(); // force lowercase for avoid miss typing from the user
          }
          if(effect){
            effects.push(effect);
          }
        }
        index++;
      }

      if (triggers.length > 0 && effects.length > 0){
        triggers.forEach((trigger) => {
          this.triggers.push({ trigger, effects, options });
        });
      }
    }
  }

  _checkTagsOnTrigger(entity, trigger, filterTags){
    // If is a placeable object
    if(
      this.arrayPlaceableObjects.find((el) => {
        return el.toLowerCase() === entity.toLowerCase();
      })
    ){
      if(trigger instanceof DoorControl){
        trigger = trigger.wall;
      }
      if (trigger && trigger instanceof PlaceableObject) {
        // Before do anything check the tagger feature module settings (only for placeable object)
        if(this.taggerModuleActive && window.Tagger && filterTags){
          // Check if the current placeable object has the specific tags from the global module settings
          // const tagsFromPlaceableObject = Tagger.getTags(trigger) || [];
          const tagsFromSetting =
            game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTaggerIntegration')?.split(',') || [];
          const filteredTagsFromSetting = tagsFromSetting.filter(function (el) {
            return el != null && el != undefined && el != '';
          });
          if (filteredTagsFromSetting.length > 0) {
            // Check if every tags on settings is included on the current placeableObject tag list
            const isValid = Tagger.hasTags(trigger, filteredTagsFromSetting,
              { caseInsensitive: true, sceneId: game.scenes.current.id });
            if(!isValid){
              trigger = null;
            }
          }
          // Check if the current placeable object has the specific tags from the specific placeable object settings
          if(trigger && filterTags && filterTags.length > 0){
            // Check if the current placeable object has the specific tag from the @TAG[label] annotation
            const isValid = Tagger.hasTags(trigger, filterTags,
              { caseInsensitive: true, sceneId: game.scenes.current.id });
            if(!isValid){
              trigger = null;
            }
          }
        }
      }
      if(!trigger){
        trigger = null;
      }
    }
    return trigger;
  }

  _manageTriggerEvent(triggerJournal, entity, id, label){
    let trigger;
    if(!id && !label){
      warn( `Can't manage the empty trigger '${entity}' on '${triggerJournal}'`);
      return;
    }
    // If is a trigger event (special case)
    if (entity === TRIGGER_ENTITY_TYPES.TRIGGER) {
      const found = this.arrayEvents.find((el) => {
        return el.toLowerCase() === id?.toLowerCase() || el.toLowerCase() === label?.toLowerCase() ;
      });
      if (!found){
        warn( `Can't manage the event '${entity}' on '${triggerJournal}'`);
        return;
      }
      if(id){
        trigger = id;
      }
      if(label){
        trigger = label;
      }
    }
    // If is a placeable object
    else if(
      this.arrayPlaceableObjects.find((el) => {
        return el.toLowerCase() === entity.toLowerCase();
      })
    ){

      let relevantDocument = this._retrieveFromEntity(entity, id, label);
      if(!relevantDocument && label){
        relevantDocument = this._retrieveFromEntity(entity, label, label);
      }
      trigger = relevantDocument;
      // const placeableObjectId = relevantDocument.id;
      // Filter your triggers only for the current scene
      // const placeableObjects = this._getObjectsFromScene(game.scenes.current);
      // const placeableObjectTrigger = placeableObjects.filter((obj) => obj.id === placeableObjectId)[0];
      // const placeableObjectTrigger = relevantDocument;
      // trigger = placeableObjectTrigger;
    }
    // If is not a placeable object
    else if(this.arrayNoPlaceableObjects.find((el) => {
      return el.toLowerCase() === entity.toLowerCase();
    })){
      let relevantDocument = this._retrieveFromEntity(entity, id, label);
      if(!relevantDocument && label){
        relevantDocument = this._retrieveFromEntity(entity, label, label);
      }
      trigger = relevantDocument;
    }
    // Generic last standing try to find a configuration for the key
    if(!trigger){
      let configKey;
      for (let key of Object.keys(CONFIG)) {
        if(key.toLowerCase() === entity){
          configKey = key;
          break;
        }
      }
      const config = CONFIG[configKey];
      if (!config){
        warn( `Can't manage the config with entity '${entity}' and key '${configKey}' on '${triggerJournal}'`);
        return;
      }
      if (!config.collection){
        warn( `Can't manage the config collection with entity '${entity}' and key '${configKey}' on '${triggerJournal}'`);
        return;
      }
      trigger = config.collection.instance.get(id);
      if (!trigger && id){
        trigger = config.collection.instance.getName(id);
      }
      if (!trigger && label){
        trigger = config.collection.instance.get(label);
      }
      if (!trigger && label){
        trigger = config.collection.instance.getName(label);
      }
    }
    return trigger;
  }

  async _executeTriggers(triggers) {
    if (!triggers.length) return;
    for (const trigger of triggers) {
      for (let effect of trigger.effects) {
        if (effect.documentName === 'Scene') {
          if (trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.PRELOAD)){
            await game.scenes.preload(effect.id);
          }
          else {
            const scene = game.scenes.get(effect.id);
            await scene.view();
          }
        } else if (effect instanceof Macro) {
          await effect.execute();
        } else if (effect instanceof RollTable) {
          await effect.draw();
        } else if (effect instanceof ChatMessage) {
          const chatData = duplicate(effect.data);
          if (trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.OOC)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.OOC;
          } else if (trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.EMOTE)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.EMOTE;
          } else if (trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.WHISPER)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
            chatData.whisper = ChatMessage.getWhisperRecipients('GM');
          } else if (trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.SELF_WHISPER)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
            chatData.whisper = [game.user.id];
          }
          await ChatMessage.create(chatData);
        } else if (effect instanceof ChatLink) {
          const chatData = duplicate(effect.chatMessage.data);
          if (effect.type === EVENT_TRIGGER_ENTITY_TYPES.OOC) {
            chatData.type = effect.type;
          } else if (effect.type === EVENT_TRIGGER_ENTITY_TYPES.EMOTE) {
            chatData.type = effect.type;
          } else if (effect.type === EVENT_TRIGGER_ENTITY_TYPES.WHISPER) {
            chatData.type = effect.type;
            chatData.whisper = ChatMessage.getWhisperRecipients('GM');
          } else if (effect.type === EVENT_TRIGGER_ENTITY_TYPES.SELF_WHISPER) {
            chatData.type = effect.type;
            chatData.whisper = [game.user.id];
          }
          await ChatMessage.create(chatData);
        } else if (effect instanceof Token || effect instanceof TokenDocument) {
          const placeablesToken = this._getTokens();
          const token = placeablesToken.find((t) => t.name === effect.name || t.id === effect.id);
          if (token) await token.control();
        } else if (effect instanceof CompendiumLink) {
          const pack = game.packs.get(effect.packId);
          if ( !pack.index.length ) await pack.getIndex();
          const compendium = await pack.getDocument(effect.id);
          if (compendium) await compendium.sheet.render(true);
        } else if (effect instanceof SoundLink) {
          let startsWith = '';
          let playlistName = effect.playlistName;
          let soundName = effect.soundName;
          const playlist = game.playlists.contents.find((p) =>
            startsWith ? p.name.startsWith(playlistName) : p.name === playlistName,
          )
          if (!playlist){
            return;
          }
          const sound = playlist.sounds.find((s) =>
            startsWith ? s.name.startsWith(soundName) : s.name === soundName,
          )
          if (sound){
            playlist.updateEmbeddedDocuments('PlaylistSound', [
              { _id: sound.id, playing: !sound.playing },
            ])
          }
        } else if (effect instanceof Playlist) {
          const sounds = (effect.sounds && effect.sounds.contents) ?? [];
          if(sounds && sounds.length > 0){
            const sound = sounds[Math.floor(Math.random()*sounds.length)];
            if (sound){
              effect.updateEmbeddedDocuments('PlaylistSound', [
                { _id: sound.id, playing: !sound.playing },
              ])
            }
          }
        } else if (effect instanceof Note || effect instanceof NoteDocument) {
          const placeablesToken = this._getNotes();
          const note = placeablesToken.find((t) => t.name === effect.name || t.id === effect.id);
          if(note) await note.sheet.render(true);
        } else if (effect.documentName === 'JournalEntry') {
          const placeablesJournal = this._getJournals();
          const journal = placeablesJournal.find((t) => t.name === effect.name || t.id === effect.id);
          if(journal) await journal.sheet.render(true);
        } else if(effect instanceof WallDocument){
          const state = effect.data.ds;
          const states = CONST.WALL_DOOR_STATES;
          // Determine whether the player can control the door at this time
          if ( !game.user.can("WALL_DOORS") ) return;
          if ( game.paused && !game.user.isGM ) {
            ui.notifications.warn("GAME.PausedWarning", {localize: true});
            return;
          }
          // Play an audio cue for locked doors
          if ( state === states.LOCKED ) {
            AudioHelper.play({src: CONFIG.sounds.lock});
            return;
          }
          // Toggle between OPEN and CLOSED states
          effect.document.update({ds: state === states.CLOSED ? states.OPEN : states.CLOSED});
        }
        else {
          await effect.sheet.render(true);
        }
      }
    }
  }

  _isTokenTrigger(token, trigger, type) {
    const isTrigger =
      (trigger.trigger instanceof Actor && trigger.trigger.id === token.data.actorId) ||
      (trigger.trigger instanceof TokenDocument && trigger.trigger.id === token.id) ||
      (trigger.trigger instanceof Token && trigger.trigger.id === token.id);
    if (!isTrigger) return false;
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CLICK)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) && !token.data.hidden)
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.MOVE)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) && token.data.hidden)
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CAPTURE) return trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    return true;
  }

  _isNoteTrigger(note, trigger, type) {
      const isTrigger =
        (trigger.trigger instanceof Note && trigger.trigger.id === note.id) ||
        (trigger.trigger instanceof NoteDocument && trigger.trigger.id === note.id) ||
        (trigger.trigger.documentName === 'JournalEntry' && trigger.trigger.sceneNote?.id === note.id);
      if (!isTrigger) return false;
      if (type === EVENT_TRIGGER_ENTITY_TYPES.CLICK)
        return (
          trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE))
        );
      if (type === EVENT_TRIGGER_ENTITY_TYPES.MOVE)
        return (
          trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK))
        );
      if (type === EVENT_TRIGGER_ENTITY_TYPES.CAPTURE) return trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
      return true;
  }

  _isJournalTrigger(journal, trigger, type) {
    const isTrigger =
      (trigger.trigger.documentName === 'JournalEntry' && trigger.trigger.id === journal.id);
    if (!isTrigger) return false;
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CLICK)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE))
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.MOVE)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK))
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CAPTURE) return trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    return true;
  }

  _isStairwayTrigger(stairway, trigger, type) {
    // const isTrigger =
    //   (trigger.trigger instanceof Stairway && trigger.trigger.id === stairway.id) ||
    //   (trigger.trigger instanceof StairwayDocument && trigger.trigger.id === stairway.id);
    const isTrigger =
      (trigger.trigger?.document?.documentName === 'Stairway' && trigger.trigger.id === stairway.id) ||
      (trigger.trigger?.documentName  === 'Stairway' && trigger.trigger.id === stairway.id);
    if (!isTrigger) return false;
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CLICK)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE))
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.MOVE)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK))
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CAPTURE) return trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    return true;
  }

  _isDrawingTrigger(drawing, trigger, type) {
    const isTrigger =
      (trigger.trigger instanceof Drawing && trigger.trigger.id === drawing.id) ||
      (trigger.trigger instanceof DrawingDocument && trigger.trigger.id === drawing.id);
    if (!isTrigger) return false;
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CLICK)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) && !drawing.data.hidden)
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.MOVE)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) && drawing.data.hidden)
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CAPTURE) return trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    return true;
  }

  _isSceneTrigger(scene, trigger) {
    return trigger.trigger instanceof Scene && trigger.trigger.id === scene.id;
  }

  _isWallTrigger(wall, trigger, type) {
    const isTrigger =
      (trigger.trigger instanceof Wall && trigger.trigger.id === wall.id) ||
      (trigger.trigger instanceof WallDocument && trigger.trigger.id === wall.id) ||
      (trigger.trigger instanceof DoorControl && trigger.trigger.doorControl?.id === wall.id);
    if (!isTrigger) return false;
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CLICK)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE))
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.MOVE)
      return (
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.MOVE) || (!trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CLICK))
      );
    if (type === EVENT_TRIGGER_ENTITY_TYPES.CAPTURE) return trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    return true;
  }

  _placeableContains(placeable, position) {
    // Tokens have getter (since width/height is in grid increments) but drawings use data.width/height directly
    const w = placeable.w || placeable.data.width || placeable.width;
    const h = placeable.h || placeable.data.height || placeable.height;
    return (
      Number.between(position.x, placeable.data.x, placeable.data.x + w) &&
      Number.between(position.y, placeable.data.y, placeable.data.y + h)
    );
    // TODO FIND A BETTER METHOD FOR THIS IF I SCALE A PLACEABLE OBJECT IS
    // WORK ONLY ON THE ORIGINAL SCALE COORDINATES
    // const coords = this.getPlaceableObjectCenter(placeable);
    // return (
    //   Number.between(position.x, coords.x, coords.x + w) &&
    //   Number.between(position.y, coords.y, coords.y + h)
    // );
  }

  _getPlaceablesAt(placeables, position) {
    return placeables.filter((placeable) => this._placeableContains(placeable, position));
  }

  // return all tokens which have a token trigger
  _getTokensFromTriggers(tokens, triggers, type) {
    return tokens.filter((token) => triggers.some((trigger) => this._isTokenTrigger(token, trigger, type)));
  }

  _getDrawingsFromTriggers(drawings, triggers, type) {
    return drawings.filter((drawing) => triggers.some((trigger) => this._isDrawingTrigger(drawing, trigger, type)));
  }

  _getNotesFromTriggers(notes, triggers, type) {
    return notes.filter((note) => triggers.some((trigger) => this._isNoteTrigger(note, trigger, type)));
  }

  _getJournalsFromTriggers(journals, triggers, type) {
    return journals.filter((journal) => triggers.some((trigger) => this._isJournalTrigger(journal, trigger, type)));
  }

  _getStairwaysFromTriggers(stairways, triggers, type) {
    return stairways.filter((stairway) => triggers.some((trigger) => this._isStairwayTrigger(stairway, trigger, type)));
  }

  // return all triggers for the set of tokens
  _getTriggersFromTokens(triggers, tokens, type) {
    return triggers.filter((trigger) => tokens.some((token) => this._isTokenTrigger(token, trigger, type)));
  }

  _getTriggersFromNotes(triggers, notes, type) {
    // Don't trigger on notes while on the note layer.
    if (canvas.activeLayer === canvas.notes) return [];
    return triggers.filter((trigger) => notes.some((note) => this._isNoteTrigger(note, trigger, type)));
  }

  _getTriggersFromJournals(triggers, journals, type) {
    // Don't trigger on notes while on the note layer.
    if (canvas.activeLayer === canvas.notes) return [];
    return triggers.filter((trigger) => journals.some((journal) => this._isJournalTrigger(journal, trigger, type)));
  }

  _getTriggersFromStairways(triggers, stairways, type) {
    // Don't trigger on stairways while on the stairway layer.
    if (canvas.activeLayer === canvas.stairways) return [];
    return triggers.filter((trigger) => stairways.some((stairway) => this._isStairwayTrigger(stairway, trigger, type)));
  }

  _getTriggersFromDrawings(triggers, drawings, type) {
    // Don't trigger on drawings while on the drawing layer.
    if (canvas.activeLayer === canvas.drawings) return [];
    return triggers.filter((trigger) => drawings.some((drawing) => this._isDrawingTrigger(drawing, trigger, type)));
  }

  _onCanvasReady(canvas) {
    const triggers = this.triggers.filter((trigger) => this._isSceneTrigger(canvas.scene, trigger));
    this._executeTriggers(triggers);
    canvas.stage.on('mousedown', (ev) => this._onMouseDown(ev));
  }

  _getMousePosition(event) {
    let transform = canvas.tokens.worldTransform;
    return {
      x: (event.data.global.x - transform.tx) / canvas.stage.scale.x,
      y: (event.data.global.y - transform.ty) / canvas.stage.scale.y,
    };
  }

  _onMouseDown(event) {
    const position = this._getMousePosition(event);
    const clickTokens = this._getPlaceablesAt(this._getTokens(), position);
    const clickDrawings = this._getPlaceablesAt(this._getDrawings(), position);
    const clickNotes = this._getPlaceablesAt(this._getNotes(), position);
    const clickJournals = this._getPlaceablesAt(this._getJournals(), position);
    // TODO this not work find a better solution this work only because when click on canvas there can be only one stairways at the time
    const clickStairways = this._getPlaceablesAt(this._getStairways(event.sceneId), position);

    if (clickTokens.length === 0 && clickDrawings.length == 0 &&
      clickNotes.length == 0 && clickStairways.length == 0 &&
      clickJournals == 0){
      return;
    }
    const downTriggers = this._getTriggersFromTokens(this.triggers, clickTokens, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
    downTriggers.push(...this._getTriggersFromDrawings(this.triggers, clickDrawings, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    downTriggers.push(...this._getTriggersFromNotes(this.triggers, clickNotes, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    downTriggers.push(...this._getTriggersFromJournals(this.triggers, clickJournals, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    downTriggers.push(...this._getTriggersFromStairways(this.triggers, clickStairways, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    if (downTriggers.length === 0){
      return;
    }
    // Needed this for module compatibility and the release on click left option active
    if(this.release && this.enableRelease) {
      game.settings.set('core', 'leftClickRelease', false);
    }
    canvas.stage.once('mouseup', (ev) => this._onMouseUp(ev, downTriggers, clickTokens, clickDrawings, clickNotes, clickJournals, clickStairways));
  }

  _onMouseUp(event, downTriggers, tokens, drawings, notes, journals, stairways) {
    try{
      const position = this._getMousePosition(event);
      const upTokens = this._getPlaceablesAt(tokens, position);
      const upDrawings = this._getPlaceablesAt(drawings, position);
      const upNotes = this._getPlaceablesAt(notes, position);
      const upJournals = this._getPlaceablesAt(journals, position);
      // TODO this not work find a better solution this work only because when click on canvas there can be only one stairways at the time
      const upStairways = this._getPlaceablesAt(stairways, position);
      if (upTokens.length === 0 && upDrawings.length === 0 &&
        upNotes.length === 0 && upStairways.length === 0 && upJournals.length === 0){
        return;
      }
      const triggers = this._getTriggersFromTokens(this.triggers, upTokens, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
      triggers.push(...this._getTriggersFromDrawings(this.triggers, upDrawings, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      triggers.push(...this._getTriggersFromNotes(this.triggers, upNotes, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      triggers.push(...this._getTriggersFromJournals(this.triggers, upJournals, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      triggers.push(...this._getTriggersFromStairways(this.triggers, upStairways, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      this._executeTriggers(triggers);
    }finally{
      if(this.enableRelease){
        // Needed this for module compatibility and the release on click left option active
        game.settings.set('core', 'leftClickRelease', this.release);
      }
    }
  }

  _onControlToken(token, controlled) {
    if (!controlled) return;
    const tokens = [token];
    const triggers = this._getTriggersFromTokens(this.triggers, tokens, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
    if (triggers.length === 0) return;
    // Needed this for module compatibility and the release on click left option active
    if(this.release && this.enableRelease){
      game.settings.set('core', 'leftClickRelease', false);
    }
    token.once('click', (ev) => this._onMouseUp(ev, triggers, tokens, [], [], [], []));
  }

  _doMoveTriggers(tokenDocument, scene, update) {
    const token = tokenDocument.object;
    const position = {
      x: (update.x || token.x) + (token.data.width * scene.data.grid) / 2,
      y: (update.y || token.y) + (token.data.height * scene.data.grid) / 2,
    };
    const movementTokens = this._getTokens().filter((tok) => tok.data._id !== token.id);
    const tokens = this._getPlaceablesAt(movementTokens, position);
    const drawings = this._getPlaceablesAt(this._getDrawings(), position);
    const notes = this._getPlaceablesAt(this._getNotes(), position);
    const journals = this._getPlaceablesAt(this._getJournals(), position);
    const stairways = this._getPlaceablesAt(this._getStairways(), position);
    if (tokens.length === 0 && drawings.length === 0 &&
      notes.length === 0 && journals.length === 0){
      return true;
    }
    const triggers = this._getTriggersFromTokens(this.triggers, tokens, EVENT_TRIGGER_ENTITY_TYPES.MOVE);
    triggers.push(...this._getTriggersFromDrawings(this.triggers, drawings, EVENT_TRIGGER_ENTITY_TYPES.MOVE));
    triggers.push(...this._getTriggersFromNotes(this.triggers, notes, EVENT_TRIGGER_ENTITY_TYPES.MOVE));
    triggers.push(...this._getTriggersFromJournals(this.triggers, journals, EVENT_TRIGGER_ENTITY_TYPES.MOVE));
    triggers.push(...this._getTriggersFromStairways(this.triggers, stairways, EVENT_TRIGGER_ENTITY_TYPES.MOVE));

    if (triggers.length === 0) return true;
    if (triggers.some((trigger) => trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.STOP_MOVEMENT))) {
      this._executeTriggers(triggers);
      return false;
    }
    Hooks.once('updateToken', () => this._executeTriggers(triggers));
    return true;
  }

  _doCaptureTriggers(tokenDocument, scene, update) {
    // Get all trigger tokens in scene
    const token = tokenDocument.object;
    let targets = this._getTokensFromTriggers(this._getTokens(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    targets.push(...this._getDrawingsFromTriggers(this._getDrawings(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));
    targets.push(...this._getNotesFromTriggers(this._getNotes(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));
    targets.push(...this._getJournalsFromTriggers(this._getJournals(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));
    targets.push(...this._getStairwaysFromTriggers(this._getStairways(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));

    if (targets.length === 0){
      return;
    }

    const finalX = update.x || token.x;
    const finalY = update.y || token.y;
    // need to calculate this by hand since token is just token data
    const tokenWidth = (token.data.width * canvas.scene.data.grid) / 2;
    const tokenHeight = (token.data.height * canvas.scene.data.grid) / 2;

    const motion = new Ray(
      { x: token.x + tokenWidth, y: token.y + tokenHeight },
      { x: finalX + tokenWidth, y: finalY + tokenHeight },
    );

    // don't consider targets if the token's start position is inside the target
    targets = targets.filter(
      (target) => !this._placeableContains(target, { x: token.x + tokenWidth, y: token.y + tokenHeight }),
    );

    // sort targets by distance from the token's start position
    targets.sort((a, b) =>
      targets.sort((a, b) => Math.hypot(token.x - a.x, token.y - a.y) - Math.hypot(token.x - b.x, token.y - b.y)),
    );

    for (let target of targets) {
      const tx = target.data.x;
      const ty = target.data.y;
      const tw = target.w || target.data.width;
      const th = target.h || target.data.height;

      let intersects;
      // test motion vs token diagonals
      if (tw > canvas.grid.w && th > canvas.grid.w && tw * th > 4 * canvas.grid.w * canvas.grid.w) {
        // big token so do boundary lines
        intersects =
          motion.intersectSegment([tx, ty, tx + tw, ty]) ||
          motion.intersectSegment([tx + tw, ty, tx + tw, ty + th]) ||
          motion.intersectSegment([tx + tw, ty + th, tx, ty + th]) ||
          motion.intersectSegment([tx, ty + th, tx, ty]);
      } else {
        // just check the diagonals
        intersects =
          motion.intersectSegment([tx, ty, tx + tw, ty + th]) || motion.intersectSegment([tx, ty + th, tx + tw, ty]);
      }
      if (intersects) {
        update.x = target.center.x - tokenWidth;
        update.y = target.center.y - tokenHeight;
        return true;
      }
    }
    return true;
  }

  // Arguments match the new prototype of FVTT 0.8.x
  _onPreUpdateToken(tokenDocument, update, options, userId) {
    if (!tokenDocument.object?.scene?.isView) return true;
    if (update.x === undefined && update.y === undefined) return true;
    let stop;
    if (game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'edgeCollision')){
      stop = this._doCaptureTriggersEdge(tokenDocument, tokenDocument.object.scene, update);
    }
    else {
      stop = this._doCaptureTriggers(tokenDocument, tokenDocument.object.scene, update);
    }
    if (stop === false) return false;
    return this._doMoveTriggers(tokenDocument, tokenDocument.object.scene, update);
  }

  _onPreUpdateWall(wallDocument, update, options, userId) {
    // Only trigger on door state changes
    if (wallDocument.data.door === 0 || update.ds === undefined) return;
    const triggers = this.triggers.filter((trigger) => {
      //if (!(trigger.trigger instanceof WallDocument)) return false;
      if (!(
        (trigger.trigger instanceof Wall) ||
        (trigger.trigger instanceof WallDocument) ||
        (trigger.trigger instanceof DoorControl)
        )
      ){
        return false;
      }
      if (wallDocument.data.c.toString() !== trigger.trigger.data.c.toString()) {
        return false;
      }
      const onClose = trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.DOOR_CLOSE);
      const onOpen = !trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.DOOR_CLOSE) ||
        trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.DOOR_OPEN);
      return (update.ds === 1 && onOpen) || (update.ds === 0 && onClose && wallDocument.data.ds === 1);
    });
    this._executeTriggers(triggers);
  }

  _onPreUpdateNote(noteDocument, update, options, userId) {
    const triggers = this.triggers.filter((trigger) => {
      if (!(trigger.trigger instanceof NoteDocument)) return false;
    });
    this._executeTriggers(triggers);
  }

  static getSceneControlButtons(buttons) {
    let tokenButton = buttons.find((b) => b.name == 'token');

    if (tokenButton && game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggerButton')) {
      tokenButton.tools.push({
        name: 'triggers',
        title: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.labels.button.layer.enableTriggerHappy`),
        icon: 'fas fa-grin-squint-tears',
        toggle: true,
        active: game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers'),
        visible: game.user.isGM,
        onClick: (value) => {
          game.settings.set(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers', value);
          if (game.triggers) game.triggers._parseJournals.bind(game.triggers)();
        },
      });
    }
  }

  _doCaptureTriggersEdge(tokenDocument, scene, update) {
    const token = tokenDocument.object;
    // Get all trigger tokens in scene
    let targets = this._getTokensFromTriggers(this._getTokens(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE);
    targets.push(...this._getDrawingsFromTriggers(this._getDrawings(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));
    targets.push(...this._getNotesFromTriggers(this._getNotes(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));
    targets.push(...this._getJournalsFromTriggers(this._getJournals(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));
    targets.push(...this._getStairwaysFromTriggers(this._getStairways(), this.triggers, EVENT_TRIGGER_ENTITY_TYPES.CAPTURE));

    if (!targets){
      return;
    }
    const finalX = update.x || token.x;
    const finalY = update.y || token.y;
    // need to calculate this by hand since token is just token data
    const tokenWidth = (token.data.width * canvas.scene.data.grid) / 2;
    const tokenHeight = (token.data.height * canvas.scene.data.grid) / 2;

    const motion = new Ray(
      { x: token.x + tokenWidth, y: token.y + tokenHeight },
      { x: finalX + tokenWidth, y: finalY + tokenHeight },
    );

    // don't trigger on tokens that are already captured
    targets = targets.filter(
      (target) => !this._placeableContains(target, { x: token.x + tokenWidth, y: token.y + tokenHeight }),
    );

    // sort list by distance from start token position
    targets.sort((a, b) =>
      targets.sort((a, b) => Math.hypot(token.x - a.x, token.y - a.y) - Math.hypot(token.x - b.x, token.y - b.y)),
    );
    const gridSize = canvas.grid.size;

    for (let target of targets) {
      const tx = target.x;
      const ty = target.y;
      const tw = target.w || target.data.width;
      const th = target.h || target.data.height;
      const tgw = Math.ceil(target.data.width / gridSize); // target token width in grid units
      const tgh = Math.ceil(target.data.height / gridSize); // target token height in grid units

      let intersects;
      // test motion vs token diagonals
      if (tgw > 1 && tgh > 1 && tgw * tgh > 4) {
        // big token so do boundary lines
        intersects =
          motion.intersectSegment([tx, ty, tx + tw, ty]) ||
          motion.intersectSegment([tx + tw, ty, tx + tw, ty + th]) ||
          motion.intersectSegment([tx + tw, ty + th, tx, ty + th]) ||
          motion.intersectSegment([tx, ty + th, tx, ty]);
      } else {
        // just check the diagonals
        intersects =
          motion.intersectSegment([tx, ty, tx + tw, ty + th]) || motion.intersectSegment([tx, ty + th, tx + tw, ty]);
      }
      if (intersects) {
        if (tgw === 1 && tgh === 1) {
          // simple case size 1 target, return straight away.
          update.x = target.center.x - tokenWidth;
          update.y = target.center.y - tokenHeight;
          return true;
        }
        // Create a grid of the squares covered by the target token
        let corners = Array(tgw)
          .fill(Array(tgh).fill(0))
          .map((v, i) =>
            v.map((_, j) => {
              return { x: target.data.x + i * gridSize, y: target.data.y + j * gridSize };
            }),
          )
          .flat();

        // Find the closest square to the token start position that intersets the motion
        const closest = corners.sort(
          (a, b) =>
            Math.hypot(token.x + tokenWidth - (a.x + gridSize / 2), token.y + tokenHeight - (a.y + gridSize / 2)) -
            Math.hypot(token.x + tokenWidth - (b.x + gridSize / 2), token.y + tokenHeight - (b.y + gridSize / 2)),
        );
        for (let corner of closest) {
          if (
            motion.intersectSegment([corner.x, corner.y, corner.x + gridSize, corner.y + gridSize]) ||
            motion.intersectSegment([corner.x, corner.y + gridSize, corner.x + gridSize, corner.y])
          ) {
            update.x = corner.x;
            update.y = corner.y;
            return true;
          }
        }
        warn('Help me the universe is non-euclidean');
      }
    }
    return true;
  }

  _getObjectsFromScene(scene) {
    return [
      ...Array.from(scene.tokens),
      ...Array.from(scene.lights),
      ...Array.from(scene.sounds),
      ...Array.from(scene.templates),
      ...Array.from(scene.tiles),
      ...Array.from(scene.walls),
      ...Array.from(scene.drawings),
      ...Array.from(scene.stairways) // Add module stairways...
    ]
      .deepFlatten()
      .filter(Boolean);
  }

  _retrieveFromEntity(entity, idOrName, label){
    if(!entity) return null;
    entity = entity.toLowerCase();
    if(entity == TRIGGER_ENTITY_TYPES.TRIGGER){
      return idOrName; // Should be always the label like 'Click'
    }
    else if(entity == TRIGGER_ENTITY_TYPES.CHAT_MESSAGE){
      // chat messages can only be effects not triggers
      let chatMessage = new ChatMessage({ content: idOrName, speaker: { alias: label } }, {});
      return chatMessage;
    }
    else if(entity == TRIGGER_ENTITY_TYPES.WHISPER){
      // chat link can only be effects not triggers
      let chatMessage = new ChatMessage({ content: idOrName, speaker: { alias: label } }, {});
      let chatLink = new ChatLink(chatMessage, TRIGGER_ENTITY_TYPES.WHISPER, null);
      return chatLink;
    }
    else if(entity == TRIGGER_ENTITY_TYPES.COMPENDIUM){
      // compendium links can only be effects not triggers
      // e.g. @Compendium[SupersHomebrewPack.classes.AH3dUnrFxZHDvY2o]{Bard}
      const parts = idOrName.split(".");
      if (parts.length !== 3){
        return null;
      }
      let compendiumLink = new CompendiumLink(parts.slice(0,2).join("."), parts[2], label);
      return compendiumLink;
    }
    else if(entity == TRIGGER_ENTITY_TYPES.SOUND_LINK){
      // sound links can only be effects not triggers
      // e.g. @Sound[Test|Medieval_Fantasy City Under Attack audio atmosphere]{Attack}
      const [playlistName, soundName] = idOrName.split('|')
      let soundLink = new SoundLink(playlistName, soundName, label);
      return soundLink;
    }
    else if(entity == TRIGGER_ENTITY_TYPES.PLAYLIST){
      // playlist can only be effects not triggers
      const playlistTarget = this._retrieveFromIdOrName(this._getPlaylists(), idOrName);
      return playlistTarget;
    }
    else if (entity == TRIGGER_ENTITY_TYPES.TOKEN) {
      const tokenTarget = this._retrieveFromIdOrName(this._getTokens(), idOrName);
      return tokenTarget;
    } else if (entity == TRIGGER_ENTITY_TYPES.ACTOR) {
      const actorTarget = this._retrieveFromIdOrName(this._getActors(), idOrName);
      return actorTarget;
    // TODO ADD AMBIENT LIGHT INTEGRATION
    // } else if (relevantDocument instanceof AmbientLightDocument) {
    //   const ambientLightTarget = this._retrieveFromIdOrName(this._getAmbientLights(), idOrName);
    //   return ambientLightTarget;
    // TODO ADD AMBIENT SOUND INTEGRATION
    // } else if (relevantDocument instanceof AmbientSoundDocument) {
    //   const ambientSoundTarget = this._retrieveFromIdOrName(this._getAmbientSounds(), idOrName);
    //   return ambientSoundTarget;
    // TODO ADD TILE INTEGRATION
    // } else if (relevantDocument instanceof TileDocument) {
    //   const tileTarget = this._retrieveFromIdOrName(this._getTiles(), idOrName);
    //   return tileTarget;
    } else if (entity == TRIGGER_ENTITY_TYPES.DOOR) {
      const doorControlTarget = this._retrieveFromIdOrName(this._getDoors(), idOrName);
      return doorControlTarget;
    } else if(entity == TRIGGER_ENTITY_TYPES.DRAWING) {
      const drawingTarget = this._retrieveFromIdOrName(this._getDrawings(), idOrName);
      return drawingTarget;
    } else if (entity == TRIGGER_ENTITY_TYPES.JOURNAL_ENTRY) {
      const noteTarget = this._retrieveFromIdOrName(this._getNotes(), idOrName);
      if(!noteTarget){
        const journalTarget = this._retrieveFromIdOrName(this._getJournals(), idOrName);
        if(journalTarget?.sceneNote){
          return journalTarget.sceneNote;
        }
        return journalTarget;
      }
      return noteTarget;
    } else if (entity == TRIGGER_ENTITY_TYPES.STAIRWAY) {
      const stairwayTarget = this._retrieveFromIdOrName(this._getStairways(), idOrName);
      return stairwayTarget;
    } else if (entity == TRIGGER_ENTITY_TYPES.SCENE) {
      const sceneTarget = this._retrieveFromIdOrName(this._getScenes(), idOrName);
      return sceneTarget;
    } else {
      return null;
    }
  }

  _retrieveFromIdOrName(placeables, IdOrName){
    let target;
    target = placeables?.find((x) => {
      return x && x.id?.toLowerCase() == IdOrName.toLowerCase();
    });
    if(!target){
      target = placeables?.find((x) => {
        return x && x.name?.toLowerCase() == IdOrName.toLowerCase();
      });
    }
    if(!target){
      target = placeables?.find((x) => {
        return x && x.data?.name?.toLowerCase() == IdOrName.toLowerCase();
      });
    }
    if(!target){
      target = placeables?.find((x) => {
        return x && x.data?.text?.toLowerCase() == IdOrName.toLowerCase();
      });
    }
    if(!target){
      target = placeables?.find((x) => {
        return x && x.data?.label?.toLowerCase() == IdOrName.toLowerCase();
      });
    }
    return target;
  }

  // getPlaceableObjectCenter(placeableObject) {
  //   const width = placeableObject.w || placeableObject.data.width || placeableObject.width;
  //   const height = placeableObject.h || placeableObject.data.height || placeableObject.height;
  //   const shapes = this.getPlaceableObjectShape(placeableObject, width, height);
  //   if (shapes && shapes.length > 0) {
  //     const shape0 = shapes[0];
  //     return { x: shape0.x, y: shape0.y };
  //   }
  //   const placeableObjectCenter = { x: placeableObject.x + width / 2, y: placeableObject.y + height / 2 };
  //   return placeableObjectCenter;
  // }

  // getPlaceableObjectShape(placeableObject, width, height) {
  //   if (game.scenes.current.data.gridType === CONST.GRID_TYPES.GRIDLESS) {
  //     return [{ x: 0, y: 0 }];
  //   } else if (game.scenes.current.data.gridType === CONST.GRID_TYPES.SQUARE) {
  //     const topOffset = -Math.floor(height / 2);
  //     const leftOffset = -Math.floor(width / 2);
  //     const shape = [];
  //     for (let y = 0; y < height; y++) {
  //       for (let x = 0; x < width; x++) {
  //         shape.push({ x: x + leftOffset, y: y + topOffset });
  //       }
  //     }
  //     return shape;
  //   } else {
  //     // Hex grids
  //     if (game.modules.get('hex-size-support')?.active && CONFIG.hexSizeSupport.getAltSnappingFlag(placeableObject)) {
  //       const borderSize = placeableObject.data.flags['hex-size-support'].borderSize;
  //       let shape = [{ x: 0, y: 0 }];
  //       if (borderSize >= 2)
  //         shape = shape.concat([
  //           { x: 0, y: -1 },
  //           { x: -1, y: -1 },
  //         ]);
  //       if (borderSize >= 3)
  //         shape = shape.concat([
  //           { x: 0, y: 1 },
  //           { x: -1, y: 1 },
  //           { x: -1, y: 0 },
  //           { x: 1, y: 0 },
  //         ]);
  //       if (borderSize >= 4)
  //         shape = shape.concat([
  //           { x: -2, y: -1 },
  //           { x: 1, y: -1 },
  //           { x: -1, y: -2 },
  //           { x: 0, y: -2 },
  //           { x: 1, y: -2 },
  //         ]);
  //       //@ts-ignore
  //       if (Boolean(CONFIG.hexSizeSupport.getAltOrientationFlag(placeableObject)) !== canvas.grid?.grid?.options.columns)
  //         shape.forEach((space) => (space.y *= -1));
  //       if (canvas.grid?.grid?.options.columns)
  //         shape = shape.map((space) => {
  //           return { x: space.y, y: space.x };
  //         });
  //       return shape;
  //     } else {
  //       return [{ x: 0, y: 0 }];
  //     }
  //   }
  // }

  _retrieveAllFromEntity(entity){
    if(!entity) return null;
    entity = entity.toLowerCase();
    if(entity == TRIGGER_ENTITY_TYPES.TRIGGER){
      return null;// NOT SUPPORTED
    } else if(entity == TRIGGER_ENTITY_TYPES.CHAT_MESSAGE){
      return null;// NOT SUPPORTED
    } else if(entity == TRIGGER_ENTITY_TYPES.WHISPER){
      return null;// NOT SUPPORTED
    } else if(entity == TRIGGER_ENTITY_TYPES.COMPENDIUM){
      return null;// NOT SUPPORTED
    } else if(entity == TRIGGER_ENTITY_TYPES.SOUND_LINK){
      return null;// NOT SUPPORTED
    } else if (entity == TRIGGER_ENTITY_TYPES.TOKEN) {
      return this._getTokens();
    } else if (entity == TRIGGER_ENTITY_TYPES.ACTOR) {
      return this._getActors();
    // TODO ADD AMBIENT LIGHT INTEGRATION
    // TODO ADD AMBIENT SOUND INTEGRATION
    // TODO ADD TILE INTEGRATION
    } else if (entity == TRIGGER_ENTITY_TYPES.DOOR) {
      return this._getDoors();
    } else if(entity == TRIGGER_ENTITY_TYPES.DRAWING) {
      return this._getDrawings();
    } else if (entity == TRIGGER_ENTITY_TYPES.JOURNAL_ENTRY) {
      const noteTargets = this._getNotes() ?? [];
      const journalTargets = this._getJournals() ?? [];
      for(let journalTarget of journalTargets){
        if(journalTarget?.sceneNote){
          noteTargets.push(journalTarget.sceneNote);
        }
      }
      return noteTargets;
    } else if (entity == TRIGGER_ENTITY_TYPES.STAIRWAY) {
      return this._getStairways();
    } else if (entity == TRIGGER_ENTITY_TYPES.SCENE) {
      return this._getScenes();
    } else {
      return null;
    }
  }

  _getTokens(){
    const placeablesToken =
      canvas.tokens?.placeables && canvas.tokens?.placeables.length > 0
      ? canvas.tokens?.placeables
      : game.scenes.current.tokens?.contents;
    return placeablesToken ?? [];
  }

  _getActors(){
    const placeablesActor = game.actors.contents;
    return placeablesActor ?? [];
  }

  _getDoors(){
    const placeablesDoors =
      canvas.controls?.doors?.children && canvas.controls?.doors?.children.length > 0
      ? canvas.controls?.doors?.children
      : game.scenes.current.walls?.contents.filter((wall) =>{
        return wall.data.door > 0;
      });
    return placeablesDoors ?? [];
  }

  _getDrawings(){
    const placeablesDrawings =
      canvas.drawings?.placeables && canvas.drawings?.placeables.length > 0
      ? canvas.drawings?.placeables
      : game.scenes.current.drawings?.contents;
    return placeablesDrawings ?? [];
  }

  _getNotes(){
    const placeablesNotes =
      canvas.notes?.placeables && canvas.notes?.placeables.length > 0
      ? canvas.notes?.placeables
      : game.scenes.current.notes?.contents;
    return placeablesNotes ?? [];
  }

  _getJournals(){
    const placeablesJournals = game.journal?.contents;
    return placeablesJournals ?? [];
  }

  _getStairways(sceneId){
    if(!sceneId){
      const placeablesStairways =
        canvas.stairways?.placeables && canvas.stairways?.placeables.length > 0
        ? canvas.stairways?.placeables
        : game.scenes.current.stairways?.contents;
      return placeablesStairways ?? [];
    }else{
      const currentScene = game.scenes.find((x) => {
        return x && x.id == sceneId;
      });
      const placeablesStairways = currentScene.stairways?.contents;
      return placeablesStairways ?? [];
    }
  }

  _getScenes(){
    const placeablesScenes = game.scenes.contents;
    return placeablesScenes ?? [];
  }

  _getCompendiums(){
    const placeablesCompendiums = game.packs.contents;
    return placeablesCompendiums ?? [];
  }

  _getAmbientLights(){
      const placeablesLightings =
        canvas.lighting?.placeables && canvas.lighting?.placeables.length > 0
        ? canvas.lighting?.placeables
        : game.scenes.current.lights.contents;
      return placeablesLightings ?? [];
  }

  _getAmbientSounds(){
      const placeablesSounds =
        canvas.sounds?.placeables && canvas.sounds?.placeables.length > 0
        ? canvas.sounds?.placeables
        : game.scenes.current.sounds.contents;
      return placeablesSounds ?? [];
  }

  _getTiles(){
      const placeablesTiles =
        canvas.foreground?.placeables && canvas.foreground?.placeables.length > 0
        ? canvas.foreground?.placeables
        : game.scenes.current.tiles.contents;
      return placeablesTiles ?? [];
  }

  _getTables(){
    const placeablesTables = game.tables?.contents;
    return placeablesTables ?? [];
  }

  _getPlaylistSounds(){
    // game.playlists.contents[0].data.sounds
    const placeablesSounds = [];
    game.playlists.contents.forEach((playlist, key) => {
      placeablesSounds.push(...Object.values(playlist.sounds));
    });
    return placeablesSounds ?? [];
  }

  _getPlaylists(){
    const placeablesPlaylists = [];
    game.playlists.contents.forEach((playlist, key) => {
      placeablesPlaylists.push(playlist);
    });
    return placeablesPlaylists ?? [];
  }

}
