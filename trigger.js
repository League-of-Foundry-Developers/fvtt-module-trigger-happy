class TriggerHappy {
  constructor() {
      game.settings.register("trigger-happy", "journalName", {
          name: "Name of the Trigger Journal to use",
          hint: "The name of the journal entry to use for listing triggers. There can only be one. Refer to README file in module website for how to configure triggers.",
          scope: "world",
          config: true,
          default: "Trigger Happy",
          type: String,
          onChange: this._parseJournals.bind(this)
      });
      game.settings.register("trigger-happy", "enableTriggers", {
          name: "Enable triggers when running as GM",
          scope: "client",
          config: false,
          default: true,
          type: Boolean,
          onChange: this._parseJournals.bind(this)
      });
      game.settings.register("trigger-happy", "edgeCollision", {
        name: "Capture at edge of drawing/token",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
      });
      game.settings.register("trigger-happy", "enableTriggerButton", {
        name: "Add enable/disable trigger happy button",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: () => {
          if (!game.settings.get("trigger-happy", "enableTriggerButton"))
            game.settings.set("trigger-happy", "enableTriggers", true)
        }
      });

      Hooks.on("ready", this._parseJournals.bind(this));
      Hooks.on("canvasReady", this._onCanvasReady.bind(this));
      Hooks.on('controlToken', this._onControlToken.bind(this));
      Hooks.on('createJournalEntry', this._parseJournals.bind(this));
      Hooks.on('updateJournalEntry', this._parseJournals.bind(this));
      Hooks.on('deleteJournalEntry', this._parseJournals.bind(this));
      Hooks.on("preUpdateToken", this._onPreUpdateToken.bind(this));
      Hooks.on("preUpdateWall", this._onPreUpdateWall.bind(this));

      this.triggers = [];
  }

  get journalName() {
      return game.settings.get("trigger-happy", "journalName") || "Trigger Happy";
  }
  get journals() {
      const folders = game.folders.contents.filter(f => f.type === "JournalEntry" && f.name === this.journalName);
      const journals = game.journal.contents.filter(j => j.name === this.journalName);
      // Make sure there are no duplicates (journal name is within a folder with the trigger name)
      return Array.from(new Set(this._getFoldersContentsRecursive(folders, journals)));
  }

  _getFoldersContentsRecursive(folders, contents) {
      return folders.reduce((contents, folder) => {
          // Cannot use folder.content and folder.children because they are set on populate and only show what the user can see
          const content = game.journal.contents.filter(j => j.data.folder === folder.id)
          const children = game.folders.contents.filter(f => f.type === "JournalEntry" && f.data.parent === folder.id)
          contents.push(...content)
          return this._getFoldersContentsRecursive(children, contents);
      }, contents);
  }

  _parseJournals() {
      this.triggers = []
      if (game.user.isGM && !game.settings.get("trigger-happy", "enableTriggers"))
          return;
      this.journals.forEach(journal => this._parseJournal(journal));
  }
  _parseJournal(journal) {
      const triggerLines = journal.data.content.replace(/(<p>|<div>|<br *\/?>)/gm, '\n').replace(/&nbsp;/gm, ' ').split("\n");
      for (const line of triggerLines) {
          const entityLinks = CONST.ENTITY_LINK_TYPES.concat(["ChatMessage", "Token", "Trigger", "Drawing", "Door"])
          const entityMatchRgx = `@(${entityLinks.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`;
          const rgx = new RegExp(entityMatchRgx, 'g');
          let trigger = null;
          let options = [];
          const effects = []
          for (let match of line.matchAll(rgx)) {
              const [string, entity, id, label] = match;
              if (entity === "Trigger") {
                  options = id.split(" ");
                  continue;
              }
              if (!trigger && !["Actor", "Token", "Scene", "Drawing", "Door"].includes(entity)) break;
              let effect = null;
              if (entity === "ChatMessage") {
                  effect = new ChatMessage({ content: id, speaker: {alias: label} }, {});
              } else if (entity === "Token") {
                  effect = new TokenDocument({ name: id }, {});
              } else if (!trigger && entity === "Drawing") {
                  effect = new DrawingDocument({ type: "r", text: id }, {});
              } else if (!trigger && entity === "Door") {
                  const coords = id.split(",").map(c => Number(c))
                  effect = new WallDocument({ door: 1, c: coords }, {});
              } else {
                  const config = CONFIG[entity];
                  if (!config) continue;
                  effect = config.collection.instance.get(id)
                  if (!effect)
                      effect = config.collection.instance.getName(id);
              }
              if (!trigger && !effect) break;
              if (!trigger) {
                  trigger = effect;
                  continue;
              }
              if (!effect) continue;
              effects.push(effect)
          }
          if (trigger)
              this.triggers.push({ trigger, effects, options })
      }
  }

  async _executeTriggers(triggers) {
      if (!triggers.length) return;
      for (const trigger of triggers) {
          for (let effect of trigger.effects) {
              if (effect.documentName === "Scene") {
                  if (trigger.options.includes("preload"))
                      await game.scenes.preload(effect.id);
                  else {
                      const scene = game.scenes.get(effect.id);
                      await scene.view();
                  }
              } else if (effect instanceof Macro) {
                  await effect.execute();
              } else if (effect instanceof RollTable) {
                  await effect.draw();
              } else if (effect instanceof ChatMessage) {
                  const chatData = duplicate(effect.data)
                  if (trigger.options.includes("ooc")) {
                      chatData.type = CONST.CHAT_MESSAGE_TYPES.OOC;
                  } else if (trigger.options.includes("emote")) {
                      chatData.type = CONST.CHAT_MESSAGE_TYPES.EMOTE;
                  } else if (trigger.options.includes("whisper")) {
                      chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
                      chatData.whisper = ChatMessage.getWhisperRecipients("GM");
                  } else if (trigger.options.includes("selfWhisper")) {
                      chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
                      chatData.whisper = [game.user.id];
                  }
                  await ChatMessage.create(chatData);
              } else if (effect instanceof TokenDocument) {
                  const token = canvas.tokens.placeables.find(t => t.name === effect.name)
                  if (token)
                      await token.control();
              } else {
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
      const isTrigger = ((trigger.trigger instanceof Actor && trigger.trigger.id === token.data.actorId) ||
          (trigger.trigger instanceof TokenDocument && trigger.trigger.data.name === token.data.name));
      if (!isTrigger) return false;
   if (type === "click")
          return trigger.options.includes('click') || (!trigger.options.includes('move') && !token.data.hidden);
      if (type === "move")
          return trigger.options.includes('move') || (!trigger.options.includes('click') && token.data.hidden);
      if (type === "capture")
          return trigger.options.includes("capture");
      return true;
  }
  _isDrawingTrigger(drawing, trigger, type) {
      const isTrigger = (trigger.trigger instanceof DrawingDocument && trigger.trigger.data.text === drawing.data.text);
      if (!isTrigger) return false;
      if (type === "click")
          return trigger.options.includes('click') || (!trigger.options.includes('move') && !drawing.data.hidden);
      if (type === "move")
          return trigger.options.includes('move') || (!trigger.options.includes('click') && drawing.data.hidden);
      if (type === "capture")
          return trigger.options.includes("capture");
      return true;
  }
  _isSceneTrigger(scene, trigger) {
      return trigger.trigger instanceof Scene && trigger.trigger.id === scene.id;
  }

  _placeableContains(placeable, position) {
      // Tokens have getter (since width/height is in grid increments) but drawings use data.width/height directly
      const w = placeable.w || placeable.data.width;
      const h = placeable.h || placeable.data.height;
      return  Number.between(position.x, placeable.data.x, placeable.data.x + w)
              && Number.between(position.y, placeable.data.y, placeable.data.y + h)
  }

  _getPlaceablesAt(placeables, position) {
      return placeables.filter(placeable => this._placeableContains(placeable, position));
  }

  // return all tokens which have a token trigger
  _getTokensFromTriggers(tokens, triggers, type) {
      return tokens.filter(token => triggers.some(trigger => this._isTokenTrigger(token, trigger, type)));
  }
  _getDrawingsFromTriggers(drawings, triggers, type) {
      return drawings.filter(drawing => triggers.some(trigger => this._isDrawingTrigger(drawing, trigger, type)));
  }

  // return all triggers for the set of tokens
  _getTriggersFromTokens(triggers, tokens, type) {
      return triggers.filter(trigger => tokens.some(token => this._isTokenTrigger(token, trigger, type)));
  }

  _getTriggersFromDrawings(triggers, drawings, type) {
      // Don't trigger on drawings while on the drawing layer.
      if (canvas.activeLayer === canvas.drawings) return [];
      return triggers.filter(trigger => drawings.some(drawing => this._isDrawingTrigger(drawing, trigger, type)));
  }
  _onCanvasReady(canvas) {
      const triggers = this.triggers.filter(trigger => this._isSceneTrigger(canvas.scene, trigger));
      this._executeTriggers(triggers);
      canvas.stage.on('mousedown', (ev) => this._onMouseDown(ev))
  }
  
  _getMousePosition(event) {
      let transform = canvas.tokens.worldTransform;
      return {
          x: (event.data.global.x - transform.tx) / canvas.stage.scale.x,
          y: (event.data.global.y - transform.ty) / canvas.stage.scale.y
      };
  }
  _onMouseDown(event) {
      const position = this._getMousePosition(event);
      const clickTokens = this._getPlaceablesAt(canvas.tokens.placeables, position);
      const clickDrawings = this._getPlaceablesAt(canvas.drawings.placeables, position);
      if (clickTokens.length === 0 && clickDrawings.length == 0) return;
      const downTriggers = this._getTriggersFromTokens(this.triggers, clickTokens, 'click');
      downTriggers.push(...this._getTriggersFromDrawings(this.triggers, clickDrawings, 'click'));
      if (downTriggers.length === 0) return;
      canvas.stage.once('mouseup', (ev) => this._onMouseUp(ev, clickTokens, clickDrawings, downTriggers));
  }

  _onMouseUp(event, tokens, drawings, downTriggers) {
      const position = this._getMousePosition(event);
      const upTokens = this._getPlaceablesAt(tokens, position);
      const upDrawings = this._getPlaceablesAt(drawings, position);
      if (upTokens.length === 0 && upDrawings.length === 0) return;
      const triggers = this._getTriggersFromTokens(this.triggers, upTokens, 'click');
      triggers.push(...this._getTriggersFromDrawings(this.triggers, upDrawings, 'click'));
      this._executeTriggers(triggers);
  }

  _onControlToken(token, controlled) {
      if (!controlled) return;
      const tokens = [token];
      const triggers = this._getTriggersFromTokens(this.triggers, tokens, 'click');
      if (triggers.length === 0) return;
      token.once('click', (ev) => this._onMouseUp(ev, tokens, [], triggers));
  }

  _doMoveTriggers(tokenDocument, scene, update) {
    const token = tokenDocument.object;
      const position = {
          x: (update.x || token.x) + token.data.width * scene.data.grid / 2,
          y: (update.y || token.y) + token.data.height * scene.data.grid / 2
      };
      const movementTokens = canvas.tokens.placeables.filter(tok => tok.data._id !== token.id);
      const tokens = this._getPlaceablesAt(movementTokens, position);
      const drawings = this._getPlaceablesAt(canvas.drawings.placeables, position);
      if (tokens.length === 0 && drawings.length === 0) return true;
      const triggers = this._getTriggersFromTokens(this.triggers, tokens, 'move');
      triggers.push(...this._getTriggersFromDrawings(this.triggers, drawings, 'move'));
      
      if (triggers.length === 0) return true;
      if (triggers.some(trigger => trigger.options.includes("stopMovement"))) {
          this._executeTriggers(triggers);
          return false;
      }
      Hooks.once('updateToken', () => this._executeTriggers(triggers));
      return true;
  }

  _doCaptureTriggers(tokenDocument, scene, update) {
      // Get all trigger tokens in scene
      const token = tokenDocument.object;
      let targets = this._getTokensFromTriggers(canvas.tokens.placeables, this.triggers, 'capture');
      targets.push(...this._getDrawingsFromTriggers(canvas.drawings.placeables, this.triggers, 'capture'));
      if (targets.length === 0) return;

      const finalX = update.x || token.x;
      const finalY = update.y || token.y;
      // need to calculate this by hand since token is just token data
      const tokenWidth = token.data.width * canvas.scene.data.grid / 2;
      const tokenHeight = token.data.height * canvas.scene.data.grid / 2;

      const motion = new Ray({x: token.x + tokenWidth, y: token.y  + tokenHeight}, {x: finalX + tokenWidth, y: finalY  + tokenHeight});

      // don't consider targets if the token's start position is inside the target
      targets = targets.filter(target =>  !this._placeableContains(target, {x: token.x + tokenWidth, y: token.y  + tokenHeight}));

      // sort targets by distance from the token's start position
      targets.sort((a , b) => targets.sort((a, b) => Math.hypot(token.x - a.x, token.y - a.y) - Math.hypot(token.x - b.x, token.y - b.y)))
      
      for (let target of targets) {
          const tx = target.data.x;
          const ty = target.data.y;
          const tw = target.w || target.data.width;
          const th = target.h || target.data.height;
          // test motion vs token diagonals
          if (tw > canvas.grid.w && th > canvas.grid.w && tw * th > 4 * canvas.grid.w * canvas.grid.w) {
              // big token so do boundary lines
              var intersects = ( motion.intersectSegment([tx,      ty,      tx + tw, ty     ])
                              || motion.intersectSegment([tx + tw, ty,      tx + tw, ty + th])
                              || motion.intersectSegment([tx + tw, ty + th, tx,      ty + th])
                              || motion.intersectSegment([tx,      ty + th, tx,      ty     ]))
          } else  {
              // just check the diagonals
              var intersects = (motion.intersectSegment([tx,       ty,      tx + tw, ty + th])
                             || motion.intersectSegment([tx,       ty + th, tx + tw, ty     ]));
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
      if (game.settings.get("trigger-happy", "edgeCollision"))
        stop = this._doCaptureTriggersEdge(tokenDocument, tokenDocument.object.scene, update);
      else
        stop = this._doCaptureTriggers(tokenDocument, tokenDocument.object.scene, update);
      if (stop === false) return false;
      return this._doMoveTriggers(tokenDocument, tokenDocument.object.scene, update);
  }
  _onPreUpdateWall(wallDocument, update, options, userId) {
      // Only trigger on door state changes
      if (wallDocument.data.door === 0 || update.ds === undefined) return;
      const triggers = this.triggers.filter(trigger => {
          if (!(trigger.trigger instanceof WallDocument)) return false;
          if (wallDocument.data.c.toString() !== trigger.trigger.data.c.toString()) return false;
          const onClose = trigger.options.includes("doorClose");
          const onOpen = !trigger.options.includes("doorClose") || trigger.options.includes("doorOpen");
          return (update.ds === 1 && onOpen) || (update.ds === 0 && onClose);
      });
      this._executeTriggers(triggers);
  }

  static getSceneControlButtons(buttons) {
      let tokenButton = buttons.find(b => b.name == "token")

      if (tokenButton && game.settings.get("trigger-happy", "enableTriggerButton")) {
          tokenButton.tools.push({
              name: "triggers",
              title: "Enable Trigger Happy triggers",
              icon: "fas fa-grin-squint-tears",
              toggle: true,
              active: game.settings.get("trigger-happy", "enableTriggers"),
              visible: game.user.isGM,
              onClick: (value) => game.settings.set("trigger-happy", "enableTriggers", value)
          });
      }
  }
  _doCaptureTriggersEdge (tokenDocument, scene, update) {
    const token = tokenDocument.object;
    // Get all trigger tokens in scene
    let targets = this._getTokensFromTriggers(canvas.tokens.placeables, this.triggers, 'capture');
    targets.push(...this._getDrawingsFromTriggers(canvas.drawings.placeables, this.triggers, 'capture'));
 
    if (!targets) return;

    const finalX = update.x || token.x;
    const finalY = update.y || token.y;
    // need to calculate this by hand since token is just token data
    const tokenWidth = token.data.width * canvas.scene.data.grid / 2;
    const tokenHeight = token.data.height * canvas.scene.data.grid / 2;

    const motion = new Ray({x: token.x + tokenWidth, y: token.y  + tokenHeight}, {x: finalX + tokenWidth, y: finalY  + tokenHeight});

    // don't trigger on tokens that are already captured
    targets = targets.filter(target =>  !this._placeableContains(target, {x: token.x + tokenWidth, y: token.y  + tokenHeight}));

    // sort list by distance from start token position
    targets.sort((a , b) => targets.sort((a, b) => Math.hypot(token.x - a.x, token.y - a.y) - Math.hypot(token.x - b.x, token.y - b.y)))
    const gridSize = canvas.grid.size;
    
    for (let target of targets) {
        const tx = target.x;
        const ty = target.y;
        const tw = target.w || target.data.width;
        const th = target.h || target.data.height;
        const tgw = Math.ceil(target.data.width / gridSize); // target token width in grid units
        const tgh = Math.ceil(target.data.height / gridSize); // target token height in grid units
        // test motion vs token diagonals
        if (tgw > 1 && tgh > 1 && tgw * tgh > 4) {
            // big token so do boundary lines
            var intersects = ( motion.intersectSegment([tx,      ty,      tx + tw, ty     ])
                            || motion.intersectSegment([tx + tw, ty,      tx + tw, ty + th])
                            || motion.intersectSegment([tx + tw, ty + th, tx,      ty + th])
                            || motion.intersectSegment([tx,      ty + th, tx,      ty     ]))
        } else  {
            // just check the diagonals
            var intersects = (motion.intersectSegment([tx, ty, tx + tw, ty + th])
                           || motion.intersectSegment([tx, ty + th, tx + tw, ty]));
        }
        if (intersects) {
          if (tgw === 1 && tgh === 1) { // simple case size 1 target, return straight away.
              update.x = target.center.x - tokenWidth;
              update.y = target.center.y - tokenHeight;
              return true;
          }
          // Create a grid of the squares covered by the target token
          let corners = Array(tgw).fill(Array(tgh).fill(0)).map((v,i) => v.map((_,j) => {return {x:target.data.x + i * gridSize, y: target.data.y + j * gridSize}})).flat();
    
          // Find the closest square to the token start position that intersets the motion
          const closest = corners.sort((a, b) => 
              Math.hypot(token.x + tokenWidth - (a.x + gridSize / 2), token.y  + tokenHeight - (a.y + gridSize / 2)) - Math.hypot(token.x + tokenWidth - (b.x + gridSize / 2), token.y  + tokenHeight - (b.y + gridSize / 2)));
          for (let corner of closest) {
              if (motion.intersectSegment([corner.x, corner.y, corner.x + gridSize, corner.y + gridSize])
              || motion.intersectSegment([corner.x, corner.y + gridSize, corner.x + gridSize, corner.y])) {
                  update.x = corner.x;
                  update.y = corner.y;;
                  return true;
              }
          };
          console.warn("Ttrigger Happy | Help me the universe is non-euclidean");
        }
      }
    return true;
  }

}


Hooks.on('setup', () => game.triggers = new TriggerHappy())
Hooks.on('getSceneControlButtons', TriggerHappy.getSceneControlButtons)
