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
        Hooks.on("canvasInit", this._onCanvasInit.bind(this));
        Hooks.on('hoverToken', this._onHoverToken.bind(this));
        Hooks.on('updateJournalEntry', this._onUpdateJournal.bind(this));
        Hooks.on('deleteJournalEntry', this._onUpdateJournal.bind(this));
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
        if (!journal) return;
        this._journalId = journal.id;
        const triggerLines = journal.data.content.split("</p>");
        for (const line of triggerLines) {
            const entityMatchRgx = `@(${CONST.ENTITY_LINK_TYPES.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`;
            const rgx = new RegExp(entityMatchRgx, 'g');
            let trigger = null;
            const effects = []
            for (let match of line.matchAll(rgx)) {
                if (!trigger && match[1] !== "Actor" && match[1] !== "Scene") break;
                const config = CONFIG[match[1]]
                if (!config) continue;
                const link = config.entityClass.collection.get(match[2])
                if (!trigger && !link) break;
                if (!trigger) {
                    trigger = link;
                    continue;
                }
                if (!link) continue;
                effects.push(link)
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
                } else {
                    await effect.sheet.render(true);
                }
            }
        }
    }

    _onHoverToken(token, hovered) {
        token.off('click');
        if (!hovered) return;
        token.on('click', ev => {
            const triggers = this.triggers.filter(trigger => trigger.trigger.entity === "Actor" && trigger.trigger.id === token.data.actorId);
            this._executeTriggers(triggers);
        });
    }

    _onCanvasInit(canvas) {
        const triggers = this.triggers.filter(trigger => trigger.trigger.entity === "Scene" && trigger.trigger.id === canvas.scene.id);
        this._executeTriggers(triggers);
    }

    _onUpdateJournal(journal) {
        if (journal.id === this._journalId || journal.name === this.journalName)
            this._parseJournal();
    }
}

Hooks.on('init', () => game.triggers = new TriggerHappy())
