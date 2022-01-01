import { TRIGGER_ENTITY_TYPES } from '../trigger.js';

/**
 * @Door[id]{label}
 * @Tag[tags]
 * OR in the HMTL editor
 * <a class="sound_link" data-playlist="Music" data-sound="music" data-loop="0">Play Music/music</a>
 */
export class HTMLEnricherTriggers {
  static patchEnrich() {
    const originalEnrich = TextEditor.enrichHTML;
    TextEditor.enrichHTML = function (html, options) {
      html = originalEnrich.apply(this, [html, options]);
      html = HTMLEnricherTriggers.enrichAll(html);
      return html;
    };
    HTMLEnricherTriggers.fa = HTMLEnricherTriggers.icons();
  }

  static bindRichTextLinks(html) {
    const entityLinks = Object.keys(CONFIG).concat(game.triggers.arrayTriggers);
    for (entity of entityLinks) {
      const clazz = entity.replace('@', '').toLowerCase() + '_link';
      html.find(clazz).click((ev) => {
        let element = ev.currentTarget;
        // DO SOMETHING ON THE CLICK ????
      });
    }
  }

  /**
   * Replace the first @XXX link in the text with a rich link.
   * @param text
   */
  static enrich(text, id, label, entity, iconClass) {
    const sPos = text.toLowerCase().indexOf(entity); // '@XXX'
    let ePos = text.toLowerCase().indexOf('}', sPos);
    if (ePos === -1) {
      ePos = text.toLowerCase().indexOf(']', sPos);
    }
    const enrichMe = text.toLowerCase().slice(sPos, ePos + 1);
    const lBracket = enrichMe.indexOf('[');
    const rBracket = enrichMe.indexOf(']');
    const lCurly = enrichMe.indexOf('{');
    const rCurly = enrichMe.indexOf('}');
    // Required character is missing
    // if (lBracket === -1 || rBracket === -1 || lCurly === -1 || rCurly === -1) {
    //   throw new Error(game.i18n.localize('InvalidFormat for trigger'))
    // }
    let noId = false;
    if (lCurly === -1 || rCurly === -1) {
      noId = true;
    }
    if (lBracket === -1 || rBracket === -1) {
      throw new Error(game.i18n.localize('InvalidFormat for trigger'));
    }
    // Order is not correct
    if (lCurly != -1 && rCurly != -1) {
      if (rCurly < lCurly || lCurly < rBracket || rBracket < lBracket) {
        throw new Error(game.i18n.localize('InvalidFormat for trigger'));
      }
    }
    // const options = enrichMe.slice(lBracket + 1, rBracket);
    // if (options.indexOf('|') !== options.lastIndexOf('|')) {
    //   throw new Error(game.i18n.localize('InvalidFormat for trigger'))
    // }
    // let label = '';
    // if (lCurly != -1 && rCurly != -1) {
    //   label = enrichMe.slice(lCurly + 1, rCurly);
    // }
    // const id = options;
    // Empty names are not supported
    if (!label && !id) {
      throw new Error(game.i18n.localize('Empty Link Text'));
    }
    let finalLabel = '';
    if (noId) {
      if (label) {
        finalLabel = '[' + label + ']';
      } else {
        finalLabel = '[' + id + ']';
      }
    } else {
      finalLabel = '[' + id + ']{' + label + '}';
    }
    finalLabel = entity+finalLabel;
    if (!id && label) {
      id = label;
    }
    if (!label && id) {
      label = id;
    }
    let clazz = entity.replace('@', '').toLowerCase();
    const color = HTMLEnricherTriggers.stringToColor(entity.replace('@', '').toLowerCase());
    if (!iconClass) {
      const prefix = 'fa fa-';
      const currentClass = HTMLEnricherTriggers.fa.find((e) => {
        return e.toLowerCase().includes(clazz);
      });
      if (currentClass) {
        iconClass = prefix + currentClass;
      } else {
        const rnd = parseInt(Math.random() * HTMLEnricherTriggers.fa.length);
        iconClass = prefix + HTMLEnricherTriggers.fa[rnd];
      }
    }
    clazz = clazz + '_link';
    const result = `
        <a class="${clazz}" data-entity="${id}" 
        style="background: ${color};
            padding: 1px 4px;
            border: 1px solid #4b4a44;
            border-radius: 2px;white-space: nowrap;
            word-break: break-all;">
        <i class="${iconClass}"></i>${finalLabel}</a>`;
    return text.slice(0, sPos) + result + text.slice(ePos + 1);
  }

  /**
   * Replace all rich text markup with appropriate rich text HTML in the specified text.
   * @param text
   */
  static enrichAll(text) {
    const entityLinks = Object.keys(CONFIG).concat(game.triggers.arrayTriggers);
    // entityLinks.push('Tag');
    const entityMatchRgx = `@(${entityLinks.join('|')})\\[([^\\]]+)\\](?:{([^}]+)})?`;
    const rgx = new RegExp(entityMatchRgx, 'ig');
    let matchs = text.matchAll(rgx);
    for (let match of matchs) {
      let [triggerJournal, entity, id, label] = match;
      if (!entity) {
        continue;
      }
      // let trigger = game.triggers?.triggers.find((x) =>{
      //   return this._findByIdorName(x,id) || this._findByIdorName(x,label);
      // })
      // if(trigger){
      // while (text.includes('@Door')) {
      let newText;
      if (entity.toLowerCase() == TRIGGER_ENTITY_TYPES.DOOR.toLowerCase()) {
        newText = HTMLEnricherTriggers.enrich(
          triggerJournal,
          id,
          label,
          '@' + TRIGGER_ENTITY_TYPES.DOOR.toLowerCase(),
          'fas fa-door-open',
        );
      } else if (entity.toLowerCase() == TRIGGER_ENTITY_TYPES.TRIGGER.toLowerCase()) {
        newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, '@' + entity.toLowerCase(), 'fas fa-fire');
      } else if (entity.toLowerCase().includes('whisper'.toLowerCase())) {
        newText = HTMLEnricherTriggers.enrich(
          triggerJournal,
          id,
          label,
          '@' + entity.toLowerCase(),
          'fas fa-user-secret',
        );
      } else {
        newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, '@' + entity.toLowerCase(), undefined);
      }
      // triggerJournal = HTMLEnricherTriggers.enrich(triggerJournal,'@Tag');
      text = text.replace(triggerJournal, newText);
      // }
      // }
    }
    return text;
  }

  // _findByIdorName(x, IdOrName){
  //   if(!x || !idOrName){
  //     return false;
  //   }
  //   else if(x.id?.toLowerCase() == IdOrName.toLowerCase()){
  //     return true;
  //   }
  //   else if(x && x.name?.toLowerCase() == IdOrName.toLowerCase()){
  //     return true;
  //   }
  //   else if(x && x.data?.name?.toLowerCase() == IdOrName.toLowerCase()){
  //     return true;
  //   }
  //   else if(x && x.data?.text?.toLowerCase() == IdOrName.toLowerCase()){
  //     return true;
  //   }
  //   else if(x && x.data?.label?.toLowerCase() == IdOrName.toLowerCase()){
  //     return true;
  //   }
  //   else{
  //     return false;
  //   }
  // }

  static stringToColor(stringInput) {
    let stringUniqueHash = [...stringInput].reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
  }

  static icons() {
    // https://stackoverflow.com/questions/27992992/i-need-list-of-all-class-name-of-font-awesome
    const icons = $.map(
      $.map(document.styleSheets, function (s) {
        if (s.href && s.href.endsWith('fontawesome.css')) return s;
        return null;
      })[0].rules,
      function (r) {
        var result = [];
        if (r.cssText.indexOf('::before { content: ') > 0) {
          $.each(r.cssText.split(','), function (i, item) {
            result.push(item.split(':')[0].trim().substring(4));
          });
        }
        return result;
      },
    );
    return icons;
  }
  static fa = [];
}
