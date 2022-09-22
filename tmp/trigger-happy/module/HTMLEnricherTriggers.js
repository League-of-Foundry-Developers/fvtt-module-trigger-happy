import { TRIGGER_ENTITY_TYPES } from '../trigger.js';

/**
 * @Door[id]{label}
 * @Tag[tags]
 * OR in the HMTL editor
 * <a class="sound_link" data-playlist="Music" data-sound="music" data-loop="0">Play Music/music</a>
 */
export class HTMLEnricherTriggers {
  static patchEnrich() {
    // const originalEnrich = TextEditor.enrichHTML;
    // TextEditor.enrichHTML = function (html, options) {
    //   html = originalEnrich.apply(this, [html, options]);
    //   html = HTMLEnricherTriggers.enrichAll(html);
    //   return html;
    // };
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
      // new Error(game.i18n.localize('InvalidFormat for trigger'));
      const result = `<a class="entity-link broken" draggable="true" data-entity="trigger" data-id="null"><i class="fas fa-unlink"></i> ${text}</a>`;
      return result;
    }
    // Order is not correct
    if (lCurly != -1 && rCurly != -1) {
      if (rCurly < lCurly || lCurly < rBracket || rBracket < lBracket) {
        // throw new Error(game.i18n.localize('InvalidFormat for trigger'));
        const result = `<a class="entity-link broken" draggable="true" data-entity="trigger" data-id="null"><i class="fas fa-unlink"></i> ${text}</a>`;
        return result;
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
      //throw new Error(game.i18n.localize('Empty Link Text'));
      const result = `<a class="entity-link broken" draggable="true" data-entity="trigger" data-id="null"><i class="fas fa-unlink"></i> ${text}</a>`;
      return result;
    }
    let finalLabel = ' ' + text;
    // if (noId) {
    //   if (label) {
    //     finalLabel = '[' + label + ']';
    //   } else {
    //     finalLabel = '[' + id + ']';
    //   }
    // } else {
    //   finalLabel = '[' + id + ']{' + label + '}';
    // }
    // finalLabel = ' ' + entity + finalLabel;
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
        <a class="${clazz}" draggable="true" data-entity="${clazz}" data-id="${id}"
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
    // const entityMatchRgx = `@(${entityLinks.join('|')})\\[([^\\]]+)\\](?:{([^}]+)})?`;
    const entityMatchRgx = `@(${entityLinks.join('|')})\\[((?:[^\[\\]]+|\\[(?:[^\\[\\]]+|\\[[^\\[\\]]*\\])*\\])*)\\](?:{([^}]+)})?`;
    const rgx = new RegExp(entityMatchRgx, 'ig');

    const triggerLines = text
      .replace(/(<p>|<div>|<br *\/?>)/gm, '\n')
      .replace(/&nbsp;/gm, ' ')
      .split('\n');

    // Remove empty/undefined/non valid lines before loop more easy to debug
    const filteredTriggerLines = triggerLines.filter(function (el) {
      return el != null && el != undefined && el != '' && el.includes('@');
    });

    for (const line of filteredTriggerLines) {
      let lineTmp = line;
      let matchs = lineTmp.matchAll(rgx);
      let newStr = '';
      let oldStr = '';
      for (let match of matchs) {
        if (!match) {
          continue;
        }
        let [triggerJournal, entity, id, label] = match;
        oldStr = oldStr + triggerJournal;
        if (!entity) {
          continue;
        }
        if (
          entity.toLowerCase() == TRIGGER_ENTITY_TYPES.ACTOR.toLowerCase() ||
          entity.toLowerCase() == TRIGGER_ENTITY_TYPES.JOURNAL_ENTRY.toLowerCase() ||
          entity.toLowerCase() == TRIGGER_ENTITY_TYPES.SOUND_LINK.toLowerCase() ||
          entity.toLowerCase() == TRIGGER_ENTITY_TYPES.SCENE.toLowerCase()
        ) {
          newStr = newStr + triggerJournal;
          continue;
        }
        let newText;
        const myEntity = '@' + entity.toLowerCase();
        if (entity.toLowerCase() == TRIGGER_ENTITY_TYPES.DOOR.toLowerCase()) {
          newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, myEntity, 'fas fa-door-open');
        } else if (entity.toLowerCase() == TRIGGER_ENTITY_TYPES.TRIGGER.toLowerCase()) {
          newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, myEntity, 'fas fa-fire');
        } else if (entity.toLowerCase() == TRIGGER_ENTITY_TYPES.TOKEN.toLowerCase()) {
          newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, myEntity, 'fas fa-meh-rolling-eyes');
        } else if (entity.toLowerCase().includes('whisper'.toLowerCase())) {
          newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, myEntity, 'fas fa-user-secret');
        } else {
          newText = HTMLEnricherTriggers.enrich(triggerJournal, id, label, myEntity, undefined);
        }
        // text = text.replace(triggerJournal, newText);
        newStr = newStr + newText;
      }

      let ind = text.toLowerCase().indexOf(oldStr.toLowerCase());
      text = HTMLEnricherTriggers.replaceBetween(text, ind, ind + oldStr.length, newStr);
    }
    return text;
  }

  static replaceBetween(origin, startIndex, endIndex, insertion) {
    return origin.substring(0, startIndex) + insertion + origin.substring(endIndex);
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
    return `hsl(${stringUniqueHash % 360}, 95%, 35%, 0.5)`;
  }

  static icons() {
    // https://stackoverflow.com/questions/27992992/i-need-list-of-all-class-name-of-font-awesome
    const icons = $.map(
      $.map(document.styleSheets, function (s) {
        if (s.href && s.href.endsWith('th-fontawesome.css')) return s;
        return null;
      })[0].rules,
      function (r) {
        var result = [];
        if (r.cssText.indexOf('::before { content: ') > 0) {
          $.each(r.cssText.split(','), function (i, item) {
            let res = item.split(':')[0].trim().substring(4);
            result.push(res);
          });
        }
        return result;
      },
    );
    return icons;
  }
  static fa = [];
}
