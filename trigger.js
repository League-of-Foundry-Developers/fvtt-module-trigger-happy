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

  game.settings.register(TRIGGER_HAPPY_MODULE_NAME, 'journalName', {
    name: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.journalName.name`),
    hint: i18n(`${TRIGGER_HAPPY_MODULE_NAME}.settings.journalName.hint`),
    scope: 'world',
    config: true,
    default: 'Trigger Happy',
    type: String,
    onChange: () => {
      // replace with hook 'renderSettingsConfig' on TriggerHappy constructor
      //this._parseJournals.bind(this);
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
      // replace with hook 'renderSettingsConfig' on TriggerHappy constructor
      // this._parseJournals.bind(this);
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
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  game.triggers = new TriggerHappy();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', () => {
  Hooks.on('getSceneControlButtons', TriggerHappy.getSceneControlButtons);
});

// Add any additional hooks if necessary

export const TRIGGERS = {
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

export const TRIGGER_ENTITY_TYPES = {
  ACTOR: 'Actor',
  TOKEN: 'Token',
  SCENE: 'Scene',
  DRAWING: 'Drawing',
  DOOR: 'Door',
};

export const TRIGGER_ENTITY_LINK_TYPES = {
  CHAT_MESSAGE: 'ChatMessage',
  TOKEN: 'Token',
  TRIGGER: 'Trigger',
  DRAWING: 'Drawing',
  DOOR: 'Door',
  COMPENDIUM: 'Compendium'
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
    Hooks.on('renderSettingsConfig', this._parseJournals.bind(this));

    this.triggers = [];
  }

  get journalName() {
    return game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'journalName') || 'Trigger Happy';
  }
  get journals() {
    const folders = game.folders.contents.filter((f) => f.type === 'JournalEntry' && f.name === this.journalName);
    const journals = game.journal.contents.filter((j) => j.name === this.journalName);
    // Make sure there are no duplicates (journal name is within a folder with the trigger name)
    return Array.from(new Set(this._getFoldersContentsRecursive(folders, journals)));
  }

  _getFoldersContentsRecursive(folders, contents) {
    return folders.reduce((contents, folder) => {
      // Cannot use folder.content and folder.children because they are set on populate and only show what the user can see
      const content = game.journal.contents.filter((j) => j.data.folder === folder.id);
      const children = game.folders.contents.filter((f) => f.type === 'JournalEntry' && f.data.parent === folder.id);
      contents.push(...content);
      return this._getFoldersContentsRecursive(children, contents);
    }, contents);
  }

  _parseJournals() {
    this.triggers = [];
    if (game.user.isGM && !game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers')) return;
    this.journals.forEach((journal) => this._parseJournal(journal));
  }
  _parseJournal(journal) {
    const triggerLines = journal.data.content
      .replace(/(<p>|<div>|<br *\/?>)/gm, '\n')
      .replace(/&nbsp;/gm, ' ')
      .split('\n');
    for (const line of triggerLines) {
      const entityLinks = CONST.ENTITY_LINK_TYPES.concat([
        TRIGGER_ENTITY_LINK_TYPES.CHAT_MESSAGE,
        TRIGGER_ENTITY_LINK_TYPES.TOKEN,
        TRIGGER_ENTITY_LINK_TYPES.TRIGGER,
        TRIGGER_ENTITY_LINK_TYPES.DRAWING,
        TRIGGER_ENTITY_LINK_TYPES.DOOR,
        TRIGGER_ENTITY_LINK_TYPES.COMPENDIUM
      ]);
      const entityMatchRgx = `@(${entityLinks.join('|')})\\[([^\\]]+)\\](?:{([^}]+)})?`;
      const rgx = new RegExp(entityMatchRgx, 'g');
      let trigger = null;
      let options = [];
      const effects = [];
      for (let match of line.matchAll(rgx)) {
        const [string, entity, id, label] = match;
        if (entity === TRIGGER_ENTITY_LINK_TYPES.TRIGGER) {
          options = id.split(' ');
          continue;
        }
        if (
          !trigger &&
          ![
            TRIGGER_ENTITY_TYPES.ACTOR,
            TRIGGER_ENTITY_TYPES.TOKEN,
            TRIGGER_ENTITY_TYPES.SCENE,
            TRIGGER_ENTITY_TYPES.DRAWING,
            TRIGGER_ENTITY_TYPES.DOOR,
          ].includes(entity)
        )
          break;
        let effect = null;
        if (entity === TRIGGER_ENTITY_LINK_TYPES.CHAT_MESSAGE) {
          effect = new ChatMessage({ content: id, speaker: { alias: label } }, {});
        } else if (entity === TRIGGER_ENTITY_LINK_TYPES.TOKEN) {
          effect = new TokenDocument({ name: id }, {});
        } else if (!trigger && entity === TRIGGER_ENTITY_LINK_TYPES.DRAWING) {
          effect = new DrawingDocument({ type: 'r', text: id }, {});
        } else if (!trigger && entity === TRIGGER_ENTITY_LINK_TYPES.DOOR) {
          const coords = id.split(',').map((c) => Number(c));
          effect = new WallDocument({ door: 1, c: coords }, {});
        } else if (trigger && entity === TRIGGER_ENTITY_LINK_TYPES.COMPENDIUM) {
          // compendium links can only be effects not triggers
          const parts = id.split(".");
          if (parts.length !== 3) continue;
          effect = new CompendiumLink(parts.slice(0,2).join("."), parts[2], label)
        } else {
          const config = CONFIG[entity];
          if (!config) continue;
          effect = config.collection.instance.get(id);
          if (!effect) effect = config.collection.instance.getName(id);
        }
        if (!trigger && !effect) break;
        if (!trigger) {
          trigger = effect;
          continue;
        }
        if (!effect) continue;
        effects.push(effect);
      }
      if (trigger) this.triggers.push({ trigger, effects, options });
    }
  }

  async _executeTriggers(triggers) {
    if (!triggers.length) return;
    for (const trigger of triggers) {
      for (let effect of trigger.effects) {
        if (effect.documentName === 'Scene') {
          if (trigger.options.includes(TRIGGERS.PRELOAD)) await game.scenes.preload(effect.id);
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
          if (trigger.options.includes(TRIGGERS.OOC)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.OOC;
          } else if (trigger.options.includes(TRIGGERS.EMOTE)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.EMOTE;
          } else if (trigger.options.includes(TRIGGERS.WHISPER)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
            chatData.whisper = ChatMessage.getWhisperRecipients('GM');
          } else if (trigger.options.includes(TRIGGERS.SELF_WHISPER)) {
            chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
            chatData.whisper = [game.user.id];
          }
          await ChatMessage.create(chatData);
        } else if (effect instanceof TokenDocument) {
          const token = canvas.tokens.placeables.find((t) => t.name === effect.name || t.id === effect.id);
          if (token) await token.control();
        } else if (effect instanceof CompendiumLink) {
          const pack = game.packs.get(effect.packId);
          if ( !pack.index.length ) await pack.getIndex();
          const entity = await pack.getDocument(effect.id);
          if (entity) entity.sheet.render(true);
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
      (trigger.trigger instanceof TokenDocument &&
        (trigger.trigger.data.name === token.data.name ||
          trigger.trigger.data.id === token.id ||
          trigger.trigger.data.name === token.id));
    if (!isTrigger) return false;
    if (type === TRIGGERS.CLICK)
      return (
        trigger.options.includes(TRIGGERS.CLICK) || (!trigger.options.includes(TRIGGERS.MOVE) && !token.data.hidden)
      );
    if (type === TRIGGERS.MOVE)
      return (
        trigger.options.includes(TRIGGERS.MOVE) || (!trigger.options.includes(TRIGGERS.CLICK) && token.data.hidden)
      );
    if (type === TRIGGERS.CAPTURE) return trigger.options.includes(TRIGGERS.CAPTURE);
    return true;
  }
  _isDrawingTrigger(drawing, trigger, type) {
    const isTrigger = trigger.trigger instanceof DrawingDocument && trigger.trigger.data.text === drawing.data.text;
    if (!isTrigger) return false;
    if (type === TRIGGERS.CLICK)
      return (
        trigger.options.includes(TRIGGERS.CLICK) || (!trigger.options.includes(TRIGGERS.MOVE) && !drawing.data.hidden)
      );
    if (type === TRIGGERS.MOVE)
      return (
        trigger.options.includes(TRIGGERS.MOVE) || (!trigger.options.includes(TRIGGERS.CLICK) && drawing.data.hidden)
      );
    if (type === TRIGGERS.CAPTURE) return trigger.options.includes(TRIGGERS.CAPTURE);
    return true;
  }
  _isSceneTrigger(scene, trigger) {
    return trigger.trigger instanceof Scene && trigger.trigger.id === scene.id;
  }

  _placeableContains(placeable, position) {
    // Tokens have getter (since width/height is in grid increments) but drawings use data.width/height directly
    const w = placeable.w || placeable.data.width;
    const h = placeable.h || placeable.data.height;
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

  // return all triggers for the set of tokens
  _getTriggersFromTokens(triggers, tokens, type) {
    return triggers.filter((trigger) => tokens.some((token) => this._isTokenTrigger(token, trigger, type)));
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
    const clickTokens = this._getPlaceablesAt(canvas.tokens.placeables, position);
    const clickDrawings = this._getPlaceablesAt(canvas.drawings.placeables, position);
    if (clickTokens.length === 0 && clickDrawings.length == 0) return;
    const downTriggers = this._getTriggersFromTokens(this.triggers, clickTokens, TRIGGERS.CLICK);
    downTriggers.push(...this._getTriggersFromDrawings(this.triggers, clickDrawings, TRIGGERS.CLICK));
    if (downTriggers.length === 0) return;
    canvas.stage.once('mouseup', (ev) => this._onMouseUp(ev, clickTokens, clickDrawings, downTriggers));
  }

  _onMouseUp(event, tokens, drawings, downTriggers) {
    const position = this._getMousePosition(event);
    const upTokens = this._getPlaceablesAt(tokens, position);
    const upDrawings = this._getPlaceablesAt(drawings, position);
    if (upTokens.length === 0 && upDrawings.length === 0) return;
    const triggers = this._getTriggersFromTokens(this.triggers, upTokens, TRIGGERS.CLICK);
    triggers.push(...this._getTriggersFromDrawings(this.triggers, upDrawings, TRIGGERS.CLICK));
    this._executeTriggers(triggers);
  }

  _onControlToken(token, controlled) {
    if (!controlled) return;
    const tokens = [token];
    const triggers = this._getTriggersFromTokens(this.triggers, tokens, TRIGGERS.CLICK);
    if (triggers.length === 0) return;
    token.once('click', (ev) => this._onMouseUp(ev, tokens, [], triggers));
  }

  _doMoveTriggers(tokenDocument, scene, update) {
    const token = tokenDocument.object;
    const position = {
      x: (update.x || token.x) + (token.data.width * scene.data.grid) / 2,
      y: (update.y || token.y) + (token.data.height * scene.data.grid) / 2,
    };
    const movementTokens = canvas.tokens.placeables.filter((tok) => tok.data._id !== token.id);
    const tokens = this._getPlaceablesAt(movementTokens, position);
    const drawings = this._getPlaceablesAt(canvas.drawings.placeables, position);
    if (tokens.length === 0 && drawings.length === 0) return true;
    const triggers = this._getTriggersFromTokens(this.triggers, tokens, TRIGGERS.MOVE);
    triggers.push(...this._getTriggersFromDrawings(this.triggers, drawings, TRIGGERS.MOVE));

    if (triggers.length === 0) return true;
    if (triggers.some((trigger) => trigger.options.includes(TRIGGERS.STOP_MOVEMENT))) {
      this._executeTriggers(triggers);
      return false;
    }
    Hooks.once('updateToken', () => this._executeTriggers(triggers));
    return true;
  }

  _doCaptureTriggers(tokenDocument, scene, update) {
    // Get all trigger tokens in scene
    const token = tokenDocument.object;
    let targets = this._getTokensFromTriggers(canvas.tokens.placeables, this.triggers, TRIGGERS.CAPTURE);
    targets.push(...this._getDrawingsFromTriggers(canvas.drawings.placeables, this.triggers, TRIGGERS.CAPTURE));
    if (targets.length === 0) return;

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
    if (game.settings.get(TRIGGER_HAPPY_MODULE_NAME, 'edgeCollision'))
      stop = this._doCaptureTriggersEdge(tokenDocument, tokenDocument.object.scene, update);
    else stop = this._doCaptureTriggers(tokenDocument, tokenDocument.object.scene, update);
    if (stop === false) return false;
    return this._doMoveTriggers(tokenDocument, tokenDocument.object.scene, update);
  }
  _onPreUpdateWall(wallDocument, update, options, userId) {
    // Only trigger on door state changes
    if (wallDocument.data.door === 0 || update.ds === undefined) return;
    const triggers = this.triggers.filter((trigger) => {
      if (!(trigger.trigger instanceof WallDocument)) return false;
      if (wallDocument.data.c.toString() !== trigger.trigger.data.c.toString()) return false;
      const onClose = trigger.options.includes(TRIGGERS.DOOR_CLOSE);
      const onOpen = !trigger.options.includes(TRIGGERS.DOOR_CLOSE) || trigger.options.includes(TRIGGERS.DOOR_OPEN);
      return (update.ds === 1 && onOpen) || (update.ds === 0 && onClose && wallDocument.data.ds === 1);
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
        onClick: (value) => game.settings.set(TRIGGER_HAPPY_MODULE_NAME, 'enableTriggers', value),
      });
    }
  }
  _doCaptureTriggersEdge(tokenDocument, scene, update) {
    const token = tokenDocument.object;
    // Get all trigger tokens in scene
    let targets = this._getTokensFromTriggers(canvas.tokens.placeables, this.triggers, TRIGGERS.CAPTURE);
    targets.push(...this._getDrawingsFromTriggers(canvas.drawings.placeables, this.triggers, TRIGGERS.CAPTURE));

    if (!targets) return;

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
}
