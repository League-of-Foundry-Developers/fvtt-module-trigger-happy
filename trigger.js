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
  constructor(packid, id, label) {
    this.packId = packid;
    this.id = id;
    this.label = label;
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
      if (game.triggers) game.triggers._parseJournals.bind(game.triggers)();
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
      if (game.triggers) game.triggers._parseJournals.bind(game.triggers)();
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
      if (game.triggers) game.triggers._parseJournals.bind(game.triggers)();
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

  // ========================================================
  // TAGGER SUPPORT
  // ========================================================

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableTaggerIntegration', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTaggerIntegration.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableTaggerIntegration.hint`),
    scope: 'world',
    config: true,
    default: '',
    type: String,
    onChange: () => {
      if (game.triggers) game.triggers._parseJournals.bind(game.triggers)();
    },
  });

  // ========================================================
  // JOURNAL FOR SCENE SUPPORT
  // ========================================================

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'enableJournalForSceneIntegration', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableJournalForSceneIntegration.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.enableJournalForSceneIntegration.hint`),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
    onChange: () => {
      if (game.triggers) game.triggers.journals.bind(game.triggers)();
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
      if (game.triggers) game.triggers.journals.bind(game.triggers)();
    },
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

});

// Add any additional hooks if necessary

export const TRIGGER_ENTITY_TYPES = {
  TRIGGER: 'Trigger',
  CHAT_MESSAGE: 'ChatMessage',
  ACTOR: 'Actor',
  TOKEN: 'Token',
  SCENE: 'Scene',
  DRAWING: 'Drawing',
  DOOR: 'Door',
  COMPENDIUM: 'Compendium',
  JOURNAL_ENTRY: 'JournalEntry',
  STAIRWAY: 'Stairway'
};

export const EVENT_TRIGGER_ENTITY_TYPES = {
  OOC: `ooc`,
  EMOTE: `emote`,
  WHISPER: `whisper`,
  SELF_WHISPER: `selfWhisper`,
  PRELOAD: `preload`,
  CLICK: `click`,
  MOVE: `move`,
  STOP_MOVEMENT: `stopMovement`,
  CAPTURE: `capture`,
  DOOR_CLOSE: `doorClose`,
  DOOR_OPEN: `doorOpen`,
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
    Hooks.on('renderSettingsConfig', this._parseJournals.bind(this)); // TODO maybe we don't need this ???
    Hooks.on('preUpdateNote', this._onPreUpdateNote.bind(this));
    Hooks.on('PreStairwayTeleport', this._parseJournals.bind(this));
    Hooks.on('getSceneNavigationContext', this._parseJournals.bind(this));

    this.triggers = [];
    this.taggerModuleActive = game.modules.get('tagger')?.active
    this.release = game.settings.get('core', 'leftClickRelease');
  }

  get folderJournalName() {
    return game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'folderJournalName') || 'Trigger Happy';
  }

  get journalName() {
    return game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'journalName') || 'Trigger Happy';
  }

  get journals() {
    const folders = game.folders.contents.filter((f) => f.type === 'JournalEntry' && f.name === this.folderJournalName);
    const journals = game.journal.contents.filter((j) => j.name === this.journalName);
    // Make sure there are no duplicates (journal name is within a folder with the trigger name)
    return Array.from(new Set(this._getFoldersContentsRecursive(folders, journals)));
  }

  _getFoldersContentsRecursive(folders, contents) {

    let currentScene;
    if(game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableJournalForSceneIntegration')){
      currentScene = game.scenes.current;
    }

    const onlyUseJournalForScene = game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'onlyUseJournalForSceneIntegration');

    return folders.reduce((contents, folder) => {
      let content;
      if(currentScene && (j.data.name.startsWith(currentScene.name) || j.id.startsWith(currentScene.id))){
        if(!onlyUseJournalForScene){
          // Cannot use folder.content and folder.children because they are set on populate and only show what the user can see
          content = game.journal.contents.filter((j) => j.data.folder === folder.id);
        }
      }else{
        // Cannot use folder.content and folder.children because they are set on populate and only show what the user can see
        content = game.journal.contents.filter((j) => j.data.folder === folder.id);
      }
      const children = game.folders.contents.filter((f) => f.type === 'JournalEntry' && f.data.parent === folder.id);
      if(content) contents.push(...content);
      return this._getFoldersContentsRecursive(children, contents);
    }, contents);
  }

  async _parseJournals() {
    this.triggers = [];
    if (game.user.isGM && !game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers')) return;
    this.journals.forEach((journal) => this._parseJournal(journal));
  }

  _parseJournal(journal) {
    const triggerLines = journal.data.content
      .replace(/(<p>|<div>|<br *\/?>)/gm, '\n')
      .replace(/&nbsp;/gm, ' ')
      .split('\n');

    // Remove empty/undefined lines before loop
    const filteredTriggerLines = triggerLines.filter(function (el) {
      return el != null && el != undefined && el != '' && el.includes('@');
    });

    const entityLinks = CONST.ENTITY_LINK_TYPES.concat(Object.values(TRIGGER_ENTITY_TYPES));

    for (const line of filteredTriggerLines) {
      // We check this anyway with module tagger active or no
      const entityMatchRgxTagger = `@(Tag)\\[([^\\]]+)\\]`;
      const rgxTagger = new RegExp(entityMatchRgxTagger, 'g');
      const matchAllTags = line.matchAll(rgxTagger) || [];
      const matchTag = matchAllTags[0];
      let filterTags = [];

      let lineTmp = line;
      if(matchTag){
        lineTmp = lineTmp.replace(rgxTagger, '');
        // Remove prefix '@Tag[' and suffix ']'
        filterTags = matchTag.substring(5, matchTag.length-1).split(',');
      }

      const entityMatchRgx = `@(${entityLinks.join('|')})\\[([^\\]]+)\\](?:{([^}]+)})?`;
      const rgx = new RegExp(entityMatchRgx, 'g');
      let options = [];
      let trigger;
      let effects = [];

      let matchs = lineTmp.matchAll(rgx);
      let index = 0;
      for (let match of matchs) {
        let [triggerJournal, entity, id, label] = match;
        if(index === 0){
          trigger = this._manageTriggerEvent(triggerJournal, entity, id, label, filterTags);
          if(!trigger){
            break;
          }
        } else if(index === 1 || entity === TRIGGER_ENTITY_TYPES.TRIGGER){
          const eventLink = this._manageTriggerEvent(triggerJournal, entity, id, label, filterTags);
          if(!eventLink){
            break;
          }
          options.push(eventLink);
        } else {
          const effect = this._manageTriggerEvent(triggerJournal, entity, id, label, filterTags);
          if(effect){
            effects.push(effect);
          }
        }
        index++;
      }

      if (trigger && effects.length > 0){
        this.triggers.push({ trigger, effects, options });
      }
    }
  }

  _manageTriggerEvent(triggerJournal, entity, id, label, filterTags){
    let trigger;
    if(!id){
      warn( `Can't manage the empty trigger '${entity}' on '${triggerJournal}'`);
      return;
    }
    // If is a trigger event
    if (entity === TRIGGER_ENTITY_TYPES.TRIGGER) {
      if (
        ![
          EVENT_TRIGGER_ENTITY_TYPES.OOC,
          EVENT_TRIGGER_ENTITY_TYPES.EMOTE,
          EVENT_TRIGGER_ENTITY_TYPES.WHISPER,
          EVENT_TRIGGER_ENTITY_TYPES.SELF_WHISPER,
          EVENT_TRIGGER_ENTITY_TYPES.PRELOAD,
          EVENT_TRIGGER_ENTITY_TYPES.CLICK,
          EVENT_TRIGGER_ENTITY_TYPES.MOVE,
          EVENT_TRIGGER_ENTITY_TYPES.STOP_MOVEMENT,
          EVENT_TRIGGER_ENTITY_TYPES.CAPTURE,
          EVENT_TRIGGER_ENTITY_TYPES.DOOR_CLOSE,
          EVENT_TRIGGER_ENTITY_TYPES.DOOR_OPEN
        ].includes(id)
      ){
        warn( `Can't manage the event '${entity}' on '${triggerJournal}'`);
        return;
      }
      if(!id){
        warn( `Can't manage the empty event '${entity}' on '${triggerJournal}'`);
        return;
      }
      trigger = id;
    }
    // If is a placeable object
    else if(
      [
        TRIGGER_ENTITY_TYPES.ACTOR,
        TRIGGER_ENTITY_TYPES.TOKEN,
        TRIGGER_ENTITY_TYPES.DRAWING,
        TRIGGER_ENTITY_TYPES.DOOR,
        TRIGGER_ENTITY_TYPES.JOURNAL_ENTRY,
        TRIGGER_ENTITY_TYPES.STAIRWAY,
      ].includes(entity)
    ){

      const relevantDocument = this._retrieveFromEntity(entity, id);
      if(!relevantDocument){
        return;
      }

      // const placeableObjectId = relevantDocument.id;
      // Filter your triggers only for the current scene
      // const placeableObjects = this._getObjectsFromScene(game.scenes.current);
      // const placeableObjectTrigger = placeableObjects.filter((obj) => obj.id === placeableObjectId)[0];

      const placeableObjectTrigger = relevantDocument;
      if (!placeableObjectTrigger) {
        return;
      }

      // Before do anything check the tagger feature module settings (only for placeable object)
      if(this.taggerModuleActive){
        // Check if the current placeable object has the specific tags from the global module settings
        const tagsFromPlaceableObject = Tagger.getTags(placeableObjectTrigger) || [];
        const tagsFromSetting = game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTaggerIntegration')?.split(',') || [];
        if (tagsFromSetting.length > 0) {
          // Check if every tags on settings is included on the current placeableObject tag list
          const isValid = tagsFromPlaceableObject.some((tagToCheck) => tagsFromSetting.includes(tagToCheck));
          if(!isValid){
            return;
          }
        }
        // Check if the current placeable object has the specific tags from the specific placeable object settings
        if(filterTags && filterTags.length > 0){
          // Check if the current placeable object has the specific tag from the @TAG[label] annotation
          const placeableObjectsByTag = Tagger.getByTag(filterTags, { caseInsensitive: true, sceneId: game.scenes.current.id }) || [];
          if (placeableObjectsByTag.length > 0) {
            // If at least one of the tags is present on the triggered placeableObject
            const isValid = placeableObjectsByTag.find((p) => p.id == placeableObjectTrigger.id);
            if(!isValid){
              return;
            }
          }
        }
      }

      trigger = placeableObjectTrigger;
    }else if(entity === TRIGGER_ENTITY_TYPES.SCENE){
      const scene = this._retrieveFromIdOrName(game.scenes, id);
      trigger = scene;
    }else{
      // Generic last standing
      const config = CONFIG[entity];
      if (!config){
        return;
      }
      trigger = config.collection.instance.get(id);
      if (!trigger){
        trigger = config.collection.instance.getName(id);
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
        } else if (effect instanceof Token || effect instanceof TokenDocument) {
          const placeablesToken = this._getTokens();
          const token = placeablesToken.find((t) => t.name === effect.name || t.id === effect.id);
          if (token) await token.control();
        } else if (effect instanceof CompendiumLink) {
          const pack = game.packs.get(effect.packId);
          if ( !pack.index.length ) await pack.getIndex();
          const entity = await pack.getDocument(effect.id);
          if (entity) await entity.sheet.render(true);
        } else if (effect instanceof Note || effect instanceof NoteDocument) {
          const placeablesToken = this._getNotes();
          const note = placeablesToken.find((t) => t.name === effect.name || t.id === effect.id);
          if(note) await note.sheet.render(true);
        }
        else {
          await effect.sheet.render(true);
        }
      }
    }
  }

  /**
   * Checks if a token is causing a trigger to be activated
   * @param {Token} token       The token to test
   * @param {Object} trigger    The trigger to test against
   * @param {String} type       Type of trigger, can be 'click' or 'move'
   */
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

  /**
   * Checks if a note is causing a trigger to be activated
   * @param {Note} note       The note to test
   * @param {Object} trigger    The trigger to test against
   * @param {String} type       Type of trigger, can be 'click' or 'move'
   */
  _isNoteTrigger(note, trigger, type) {
      const isTrigger =
        (trigger.trigger instanceof Note && trigger.trigger.id === note.id) ||
        (trigger.trigger instanceof NoteDocument && trigger.trigger.id === note.id);
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

  /**
   * Checks if a stairway is causing a trigger to be activated
   * @param {Stairway} stairway       The stairway to test
   * @param {Object} trigger    The trigger to test against
   * @param {String} type       Type of trigger, can be 'click' or 'move'
   */
  _isStairwayTrigger(stairway, trigger, type) {
    const isTrigger =
      (trigger.trigger instanceof Stairway && trigger.trigger.id === stairway.id) ||
      (trigger.trigger instanceof StairwayDocument && trigger.trigger.id === stairway.id);
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

  _placeableContains(placeable, position) {
    // Tokens have getter (since width/height is in grid increments) but drawings use data.width/height directly
    const w = placeable.w || placeable.data.width || placeable.width;
    const h = placeable.h || placeable.data.height || placeable.height;
    return (
      Number.between(position.x, placeable.data.x, placeable.data.x + w) &&
      Number.between(position.y, placeable.data.y, placeable.data.y + h)
    );
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
    const clickStairways = this._getPlaceablesAt(this._getStairways(), position);
    if (clickTokens.length === 0 && clickDrawings.length == 0 &&
      clickNotes.length == 0 && clickStairways.length == 0){
      return;
    }
    const downTriggers = this._getTriggersFromTokens(this.triggers, clickTokens, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
    downTriggers.push(...this._getTriggersFromDrawings(this.triggers, clickDrawings, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    downTriggers.push(...this._getTriggersFromNotes(this.triggers, clickNotes, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    downTriggers.push(...this._getTriggersFromStairways(this.triggers, clickStairways, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
    if (downTriggers.length === 0){
      return;
    }
    // Needed this for module compatibility and the release on click left option active
    if(this.release) {
      game.settings.set('core', 'leftClickRelease', false);
    }
    canvas.stage.once('mouseup', (ev) => this._onMouseUp(ev, clickTokens, clickDrawings, clickNotes, clickStairways, downTriggers));
  }

  _onMouseUp(event, tokens, drawings, notes, stairways, downTriggers) {
    try{
      const position = this._getMousePosition(event);
      const upTokens = this._getPlaceablesAt(tokens, position);
      const upDrawings = this._getPlaceablesAt(drawings, position);
      const upNotes = this._getPlaceablesAt(notes, position);
      const upStairways = this._getPlaceablesAt(stairways, position);
      if (upTokens.length === 0 && upDrawings.length === 0 && upNotes.length === 0) return;
      const triggers = this._getTriggersFromTokens(this.triggers, upTokens, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
      triggers.push(...this._getTriggersFromDrawings(this.triggers, upDrawings, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      triggers.push(...this._getTriggersFromNotes(this.triggers, upNotes, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      triggers.push(...this._getTriggersFromStairways(this.triggers, upStairways, EVENT_TRIGGER_ENTITY_TYPES.CLICK));
      this._executeTriggers(triggers);
    }finally{
      // Needed this for module compatibility and the release on click left option active
      game.settings.set('core', 'leftClickRelease', this.release);
    }
  }

  _onControlToken(token, controlled) {
    if (!controlled) return;
    const tokens = [token];
    const triggers = this._getTriggersFromTokens(this.triggers, tokens, EVENT_TRIGGER_ENTITY_TYPES.CLICK);
    if (triggers.length === 0) return;
    // Needed this for module compatibility and the release on click left option active
    if(this.release){
      game.settings.set('core', 'leftClickRelease', false);
    }
    token.once('click', (ev) => this._onMouseUp(ev, tokens, [], [], [], triggers));
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
    const stairways = this._getPlaceablesAt(this._getStairways(), position);
    if (tokens.length === 0 && drawings.length === 0 && notes.length === 0){
      return true;
    }
    const triggers = this._getTriggersFromTokens(this.triggers, tokens, EVENT_TRIGGER_ENTITY_TYPES.MOVE);
    triggers.push(...this._getTriggersFromDrawings(this.triggers, drawings, EVENT_TRIGGER_ENTITY_TYPES.MOVE));
    triggers.push(...this._getTriggersFromNotes(this.triggers, notes, EVENT_TRIGGER_ENTITY_TYPES.MOVE));
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
      if (!(trigger.trigger instanceof WallDocument)) return false;
      if (wallDocument.data.c.toString() !== trigger.trigger.data.c.toString()) return false;
      const onClose = trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.DOOR_CLOSE);
      const onOpen = !trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.DOOR_CLOSE) || trigger.options.includes(EVENT_TRIGGER_ENTITY_TYPES.DOOR_OPEN);
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

  _retrieveFromEntity(entity, idOrName){
    if(entity == TRIGGER_ENTITY_TYPES.CHAT_MESSAGE){
      // TODO always undefined i suppose
    }
    else if(entity == TRIGGER_ENTITY_TYPES.COMPENDIUM){
      const compendiumTarget = this._retrieveFromIdOrName(this._getCompendiums(), idOrName);
      return compendiumTarget;
    }
    else if (entity == TRIGGER_ENTITY_TYPES.TOKEN) {
      const tokenTarget = this._retrieveFromIdOrName(this._getTokens(), idOrName);
      return tokenTarget;
    } else if (entity == TRIGGER_ENTITY_TYPES.ACTOR) {
      const actorTarget = this._retrieveFromIdOrName(this._getActors(), idOrName);
      return actorTarget;
    // TODO ADD AMBIENT LIGHT INTEGRATION
    // } else if (relevantDocument instanceof AmbientLightDocument) {
    //   const ambientLightTarget = this._retrieveFromIdOrName(this._getLights(), idOrName);
    //   return ambientLightTarget;
    // TODO ADD AMBIENT SOUND INTEGRATION
    // } else if (relevantDocument instanceof AmbientSoundDocument) {
    //   const ambientSoundTarget = this._retrieveFromIdOrName(this._getSounds(), idOrName);
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
      return x.id == IdOrName;
    });
    if(!target){
      target = placeables?.find((x) => {
        return x.data.name == IdOrName;
      });
    }
    if(!target){
      target = placeables?.find((x) => {
        return x.data.text == IdOrName;
      });
    }
    if(!target){
      target = placeables?.find((x) => {
        return x.data.label == IdOrName;
      });
    }
    return target;
  }

  _getTokens(){
    const placeablesToken =
      canvas.tokens?.placeables && canvas.tokens?.placeables.length > 0
      ? canvas.tokens?.placeables
      : game.scenes.current.tokens?.placeables;
    return placeablesToken ?? [];
  }

  _getActors(){
    const placeablesActor = game.actors;
    return placeablesActor ?? [];
  }

  _getDoors(){
    const placeablesDoors =
      canvas.controls?.doors?.children && canvas.controls?.doors?.children.length > 0
      ? canvas.controls?.doors?.children
      : game.scenes.current.walls?.placeables;
    return placeablesDoors ?? [];
  }

  _getDrawings(){
    const placeablesDrawings =
      canvas.drawings?.placeables && canvas.drawings?.placeables.length > 0
      ? canvas.drawings?.placeables
      : game.scenes.current.drawings?.placeables;
    return placeablesDrawings ?? [];
  }

  _getNotes(){
    const placeablesNotes =
      canvas.notes?.placeables && canvas.notes?.placeables.length > 0
      ? canvas.notes?.placeables
      : game.scenes.current.notes?.placeables;
    return placeablesNotes ?? [];
  }

  _getStairways(){
    const placeablesStairways =
      canvas.stairways?.placeables && canvas.stairways?.placeables.length > 0
      ? canvas.stairways?.placeables
      : game.scenes.current.stairways?.placeables;
    return placeablesStairways ?? [];
  }

  _getScenes(){
    const placeablesScenes = game.scenes;
    return placeablesScenes ?? [];
  }

  _getCompendiums(){
    const placeablesCompendiums = game.packs;
    return placeablesCompendiums ?? [];
  }

  _getLights(){
      const placeablesLightings =
        canvas.lighting?.placeables && canvas.lighting?.placeables.length > 0
        ? canvas.lighting?.placeables
        : game.scenes.current.lights;
      return placeablesLightings ?? [];
  }

  _getSounds(){
      const placeablesSounds =
        canvas.sounds?.placeables && canvas.sounds?.placeables.length > 0
        ? canvas.sounds?.placeables
        : game.scenes.current.sounds;
      return placeablesSounds ?? [];
  }

  _getTiles(){
      const placeablesTiles =
        canvas.foreground?.placeables && canvas.foreground?.placeables.length > 0
        ? canvas.foreground?.placeables
        : game.scenes.current.tiles;
      return placeablesTiles ?? [];
  }

}
