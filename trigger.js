class TriggerHappy {
    constructor() {
        game.settings.register("trigger-happy", "journalName", {
            name: "Name of the Trigger Journal to use",
            hint: "The name of the journal entry to use for listing triggers. There can only be one. Refer to README file in module website for how to configure triggers.",
            scope: "world",
            config: true,
            default: "Trigger Happy",
            type: String,
            onChange: this._parseJournal.bind(this)
        });
        Hooks.on("ready", this._parseJournal.bind(this));
        Hooks.on("canvasReady", this._onCanvasReady.bind(this));
        Hooks.on('hoverToken', this._onHoverToken.bind(this));
        Hooks.on('updateJournalEntry', this._onUpdateJournal.bind(this));
        Hooks.on('deleteJournalEntry', this._onDeleteJournal.bind(this));
        Hooks.on("preUpdateToken", this._onPreUpdateToken.bind(this));

        this.triggers = [];
        this._journalId = null;
    }

    get journalName() {
        return game.settings.get("trigger-happy", "journalName") || "Trigger Happy";
    }
    get journal() {
        return game.journal.entities.find(j => j.name === this.journalName);
    }

    _parseJournal() {
        this.triggers = []
        const journal = this.journal;
        this._journalId = journal && journal.id;
        if (!journal) return;
        const triggerLines = journal.data.content.split("</p>");
        for (const line of triggerLines) {
            const entityLinks = CONST.ENTITY_LINK_TYPES.concat(["ChatMessage", "Token"])
            const entityMatchRgx = `@(${entityLinks.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`;
            const rgx = new RegExp(entityMatchRgx, 'g');
            let trigger = null;
            const effects = []
            for (let match of line.matchAll(rgx)) {
                const [string, entity, id] = match;
                if (!trigger && entity !== "Actor" && entity !== "Token" && entity !== "Scene") break;
                let effect = null;
                if (entity === "ChatMessage") {
                    effect = new ChatMessage({ content: id });
                } else if (entity === "Token") {
                    effect = new Token({ name: id });
                } else {
                    const config = CONFIG[entity];
                    if (!config) continue;
                    effect = config.entityClass.collection.get(id)
                    if (!effect)
                        effect = config.entityClass.collection.entities.find(e => e.name === id);
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
                this.triggers.push({ trigger, effects })
        }
    }

    async _executeTriggers(triggers) {
        if (!triggers.length) return;
        for (const trigger of triggers) {
            for (let effect of trigger.effects) {
                if (effect.entity === "Scene") {
                    await effect.view();
                } else if (effect.entity === "Macro") {
                    await effect.execute();
                } else if (effect.entity === "RollTable") {
                    await effect.draw();
                } else if (effect.entity === "ChatMessage") {
                    await ChatMessage.create(duplicate(effect.data));
                } else if (effect.constructor.name === "Token") {
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
     */
    _isTokenTrigger(token, trigger) {
        return (trigger.trigger.entity === "Actor" && trigger.trigger.id === token.data.actorId) ||
            (trigger.trigger.constructor.name === "Token" && trigger.trigger.data.name === token.data.name);
    }
    _isSceneTrigger(scene, trigger) {
        return trigger.trigger.entity === "Scene" && trigger.trigger.id === canvas.scene.id;
    }

    _onHoverToken(token, hovered) {
        token.off('click');
        if (!hovered) return;
        token.on('click', ev => {
            const triggers = this.triggers.filter(trigger => this._isTokenTrigger(token, trigger));
            this._executeTriggers(triggers);
        });
    }

    _onCanvasReady(canvas) {
        const triggers = this.triggers.filter(trigger => this._isSceneTrigger(canvas.scene, trigger));
        this._executeTriggers(triggers);
    }

    _onUpdateJournal(journal, update) {
        if (update._id === this._journalId || update.name === this.journalName)
            this._parseJournal();
    }
    _onDeleteJournal(journal, id) {
        if (id === this._journalId)
            this._parseJournal();
    }

    _onPreUpdateToken(scene, userId, update) {
        if (update.x === undefined && update.y === undefined) return true;
        const token = scene.data.tokens.find(t => t._id === update._id);
        if (token.hidden) return true; // hidden tokens don't trigger the trigger
        const centerX = (update.x || token.x) + token.width * scene.data.grid / 2;
        const centerY = (update.y || token.y) + token.height * scene.data.grid / 2;
        const triggers = this.triggers.filter(trigger => {
            // Find all tokens in the scene that act as a movement trigger
            const triggerTokens = canvas.tokens.placeables.filter(tok => {
                return tok.data._id !== token._id && tok.data.hidden && this._isTokenTrigger(tok, trigger)
            });
            // Check if the moved token fits inside at least one of ththe trigger tokens
            return triggerTokens.some(target => {
                return (target.data.x <= centerX) && (target.data.x + (target.data.width * scene.data.grid) >= centerX)
                    && (target.data.y <= centerY) && (target.data.y + (target.data.height * scene.data.grid) >= centerY);
            });
        });
        Hooks.once('updateToken', () => this._executeTriggers(triggers));
        return true;
    }
}

Hooks.on('init', () => game.triggers = new TriggerHappy())
