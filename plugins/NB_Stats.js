//=============================================================================
// NB_Stats.js
//=============================================================================

/*:
 * @plugindesc Custom stat system for Never Been
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    aliases.Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        aliases.Game_Actor_initMembers.call(this);
        this._nbStats = new NB_Stats();
    };
    
    aliases.Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        aliases.Game_Actor_setup.call(this, actorId);
        this._nbStats.setup(this.mhp, this.mmp, this.atk, this.def, this.agi, this.skills());
    };
    
    Game_Actor.prototype.nbStats = function() {
        return this._nbStats;
    };
    
    // Override!
    // Change HP
    Game_Interpreter.prototype.command311 = function() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function(actor) {
            actor.nbStats().changeHp(value);
        }.bind(this));
        return true;
    };
    
    // Override!
    // Change MP
    Game_Interpreter.prototype.command312 = function() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function(actor) {
            actor.nbStats().changeMp(value);
        }.bind(this));
        return true;
    };
    
    // Override!
    // Recover All
    Game_Interpreter.prototype.command314 = function() {
        this.iterateActorEx(this._params[0], this._params[1], function(actor) {
            actor.nbStats().recover();
        }.bind(this));
        return true;
    };
    
    // Override!
    // Change Parameter
    Game_Interpreter.prototype.command317 = function() {
        var value = this.operateValue(this._params[3], this._params[4], this._params[5]);
        this.iterateActorEx(this._params[0], this._params[1], function(actor) {
            switch(this._params[2]) {
                case 0:
                    actor.nbStats().changeMaxHp(value);
                    break;
                case 1:
                    actor.nbStats().changeMaxMp(value);
                    break;
                case 2:
                    actor.nbStats().changeAtk(value);
                    break;
                case 3:
                    actor.nbStats().changeDef(value);
                    break;
                case 6:
                    actor.nbStats().changeAgi(value);
                    break;
                default:
                    console.log('Change Parameter: NOT SUPPORTED ID! (' + this._param[2] + ')');
                    break;
            }
        }.bind(this));
        return true;
    };
    
    // Override!
    // Change State
    Game_Interpreter.prototype.command313 = function() {
        this.iterateActorEx(this._params[0], this._params[1], function(actor) {
            if (this._params[2] === 0) {
                actor.nbStats().addStatusEffect(this._params[3]);
            } else {
                actor.nbStats().removeStatusEffect(this._params[3]);
            }
        }.bind(this));
        return true;
    };
    
    // Override!
    // Change Skill
    Game_Interpreter.prototype.command318 = function() {
        this.iterateActorEx(this._params[0], this._params[1], function(actor) {
            if (this._params[2] === 0) {
                actor.nbStats().addSkill(this._params[3]);
            } else {
                actor.nbStats().removeSkill(this._params[3]);
            }
        }.bind(this));
        return true;
    };
    
    /****************************************************************
     * Main stats system
     ****************************************************************/
    
    function NB_Stats() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Stats.prototype.initialize = function() {
        this.MAX_MHP = 10000;
        this.MAX_MMP = 10000;
        this.MAX_ATK = 100;
        this.MAX_DEF = 100;
        this.MAX_AGI = 20;
        this._hp = 0;
        this._mp = 0;
        this._mhp = 0;
        this._mmp = 0;
        this._atk = 0;
        this._def = 0;
        this._agi = 0;
        this._equipment = [null, null, null, null, null];
        this._statusEffects = [];
        this._skills = [];
    };
    
    NB_Stats.prototype.setup = function(hp, mp, atk, def, agi, skills) {
        this._mhp = hp;
        this._mmp = mp;
        this._atk = atk;
        this._def = def;
        this._agi = agi;
        for (var i = 0; i < skills.length; i++) {
            this.addSkill(skills[i].id);
        }
        this.recover();
    };
    
    NB_Stats.prototype.changeHp = function(change) {
        this._hp = this._changePts(this._hp, 0, this.getTotalMaxHp(), change);
    };
    
    NB_Stats.prototype.changeMp = function(change) {
        this._mp = this._changePts(this._mp, 0, this.getTotalMaxMp(), change);
    };
    
    NB_Stats.prototype.changeMaxHp = function(change) {
        this._mhp = this._changePts(this._mhp, 0, this.MAX_MHP, change);
        this._hp = this._valueConstraint(this._hp, 0, this.getTotalMaxHp());
    };
    
    NB_Stats.prototype.changeMaxMp = function(change) {
        this._mmp = this._changePts(this._mmp, 0, this.MAX_MMP, change);
        this._mp = this._valueConstraint(this._mp, 0, this.getTotalMaxMp());
    };
    
    NB_Stats.prototype.changeAtk = function(change) {
        this._atk = this._changePts(this._atk, 0, this.MAX_ATK, change);
    };
    
    NB_Stats.prototype.changeDef = function(change) {
        this._def = this._changePts(this._def, 0, this.MAX_DEF, change);
    };
    
    NB_Stats.prototype.changeAgi = function(change) {
        this._agi = this._changePts(this._agi, 0, this.MAX_AGI, change);
    };
    
    NB_Stats.prototype._changePts = function(value, min, max, change) {
        value += change;
        return this._valueConstraint(value, min, max);
    };
    
    NB_Stats.prototype._valueConstraint = function(value, min, max) {
        if (value > max) value = max;
        if (value < min) value = min;
        return value;
    };
    
    NB_Stats.prototype.recover = function() {
        this._hp = this.getTotalMaxHp();
        this._mp = this.getTotalMaxMp();
    };
    
    NB_Stats.prototype.getHp = function() {
        return this._hp;
    };
    
    NB_Stats.prototype.getMp = function() {
        return this._mp;
    };
    
    NB_Stats.prototype.getTotalMaxHp = function() {
        var mhp = this._mhp;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            mhp += statusEffect.getMaxHpBonus();
        }
        return this._valueConstraint(mhp, 0, this.MAX_MHP);
    };
    
    NB_Stats.prototype.getTotalMaxMp = function() {
        var mmp = this._mmp;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            mmp += statusEffect.getMaxMpBonus();
        }
        return this._valueConstraint(mmp, 0, this.MAX_MMP);
    };
    
    NB_Stats.prototype.getTotalAtk = function() {
        var atk = this._atk;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            atk += statusEffect.getAtkBonus();
        }
        return this._valueConstraint(atk, 0, this.MAX_ATK);
    };
    
    NB_Stats.prototype.getTotalDef = function() {
        var def = this._def;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            def += statusEffect.getDefBonus();
        }
        return this._valueConstraint(def, 0, this.MAX_DEF);
    };
    
    NB_Stats.prototype.getTotalAgi = function() {
        var agi = this._agi;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            agi += statusEffect.getAgiBonus();
        }
        return this._valueConstraint(agi, 0, this.MAX_AGI);
    };
    
    NB_Stats.prototype.getStatusEffects = function(id) {
        return this._statusEffects;
    };
    
    NB_Stats.prototype.hasStatusEffect = function(id) {
        for (var i = 0; i < this._statusEffects.length; i++) {
            if (id === this._statusEffects[i].getId()) {
                return i;
            }
        }
        return -1;
    };
    
    NB_Stats.prototype.addStatusEffect = function(id) {
        if (this.hasStatusEffect(id) === -1) {
            this._statusEffects.push(new NB_StatusEffect(id, -1));
        }
    };
    
    NB_Stats.prototype.removeStatusEffect = function(id) {
        var pos = this.hasStatusEffect(id);
        if (pos !== -1) {
            this._statusEffects.splice(pos, 1);
        }
    };
    
    NB_Stats.prototype.getSkills = function(id) {
        return this._skills;
    };
    
    NB_Stats.prototype.hasSkill = function(id) {
        for (var i = 0; i < this._skills.length; i++) {
            if (id === this._skills[i]) {
                return i;
            }
        }
        return -1;
    };
    
    NB_Stats.prototype.addSkill = function(id) {
        if (this.hasSkill(id) === -1) {
            this._skills.push(id);
        }
    };
    
    NB_Stats.prototype.removeSkill = function(id) {
        var pos = this.hasSkill(id);
        if (pos !== -1) {
            this._skills.splice(pos, 1);
        }
    };
    
})();

/****************************************************************
 * Item effect object
 ****************************************************************/

function NB_ItemEffect() {
    this.initialize.apply(this, arguments);
}

NB_ItemEffect.EFFECT_RECOVER_HP = 11;
NB_ItemEffect.EFFECT_RECOVER_MP = 12;
NB_ItemEffect.EFFECT_ADD_STATE = 21;
NB_ItemEffect.EFFECT_REMOVE_STATE = 22;
NB_ItemEffect.EFFECT_GROW = 42;
NB_ItemEffect.EFFECT_LEARN_SKILL = 43;

NB_ItemEffect.prototype.initialize = function(itemSchema) {
    this._hpChange = 0;
    this._mpChange = 0;
    this._mhpChange = 0;
    this._mmpChange = 0;
    this._atkChange = 0;
    this._defChange = 0;
    this._agiChange = 0;
    this._statusEffectsChange = [];
    this._learnSkill = [];
    if (itemSchema) {
        for (var i = 0; i < itemSchema.effects.length; i++) {
            this.applyFromEffect(itemSchema.effects[i]);
        }
    }
};

NB_ItemEffect.prototype.applyFromEffect = function(effect) {
    switch(effect.code) {
    case NB_ItemEffect.EFFECT_RECOVER_HP:
        this._addHpChange(effect.value2);
        break;
    case NB_ItemEffect.EFFECT_RECOVER_MP:
        this._addMpChange(effect.value2);
        break;
    case NB_ItemEffect.EFFECT_ADD_STATE:
        this._statusEffectsChange.push(effect.dataId);
        break;
    case NB_ItemEffect.EFFECT_REMOVE_STATE:
        this._statusEffectsChange.push(effect.dataId * -1);
        break;
    case NB_ItemEffect.EFFECT_GROW:
        switch(effect.dataId) {
            case 0: // MAX HP
                this._addMaxHpChange(effect.value1);
                break;
            case 1: // MAX MP
                this._addMaxMpChange(effect.value1);
                break;
            case 2: // ATK
                this._addAtkChange(effect.value1);
                break;
            case 3: // DEF
                this._addDefChange(effect.value1);
                break;
            case 6: // AGI
                this._addAgiChange(effect.value1);
                break;
        }
        break;
    case NB_ItemEffect.EFFECT_LEARN_SKILL:
        this._learnSkill.push(effect.dataId);
        break;
    default:
        break;
    }
};

NB_ItemEffect.prototype._addHpChange = function(value) {
    this._hpChange += value;
};

NB_ItemEffect.prototype._addMpChange = function(value) {
    this._mpChange += value;
};

NB_ItemEffect.prototype._addMaxHpChange = function(value) {
    this._mhpChange += value;
};

NB_ItemEffect.prototype._addMaxMpChange = function(value) {
    this._mmpChange += value;
};

NB_ItemEffect.prototype._addAtkChange = function(value) {
    this._atkChange += value;
};

NB_ItemEffect.prototype._addDefChange = function(value) {
    this._defChange += value;
};

NB_ItemEffect.prototype._addAgiChange = function(value) {
    this._agiChange += value;
};

NB_ItemEffect.prototype.apply = function(nbStats) {
    nbStats.changeHp(this._hpChange);
    nbStats.changeMp(this._mpChange);
    nbStats.changeMaxHp(this._mhpChange);
    nbStats.changeMaxMp(this._mmpChange);
    nbStats.changeAtk(this._atkChange);
    nbStats.changeDef(this._defChange);
    nbStats.changeAgi(this._agiChange);
    for (var i = 0; i < this._statusEffectsChange.length; i++) {
        var id = this._statusEffectsChange[i];
        if (id > 0) {
            nbStats.addStatusEffect(id);
        } else if (id < 0) {
            nbStats.removeStatusEffect(-id);
        }
    }
};

/****************************************************************
 * Status effect object
 ****************************************************************/

function NB_StatusEffect() {
    this.initialize.apply(this, arguments);
}

NB_StatusEffect.SHIELD = 2;
NB_StatusEffect.HASTE = 3;
NB_StatusEffect.POISON = 4;
NB_StatusEffect.DISEASE = 5;
NB_StatusEffect.REGENERATION = 6;
NB_StatusEffect.NAUSEA = 7;
NB_StatusEffect.BLINDNESS = 8;
NB_StatusEffect.PARALYZE = 9;
NB_StatusEffect.MAGIC_RESISTANCE = 10;
NB_StatusEffect.MIGHT = 11;
NB_StatusEffect.SLOW = 12;
NB_StatusEffect.FEAR = 13;
NB_StatusEffect.WEAKNESS = 14;
NB_StatusEffect.BERSERK = 15;

NB_StatusEffect.prototype.initialize = function(id, duration) {
    this._databaseId = id;
    this._mhpBonus = 0;
    this._mmpBonus = 0;
    this._atkBonus = 0;
    this._defBonus = 0;
    this._agiBonus = 0;
    this._duration = 0;
    this._setBonuses();
};

NB_StatusEffect.prototype._setBonuses = function() {
    switch(this._databaseId) {
        case NB_StatusEffect.SHIELD:
            this._defBonus = 25;
            break;
        case NB_StatusEffect.HASTE:
            this._agiBonus = 5;
            break;
        case NB_StatusEffect.POISON:
            // SPECIAL EFFECT: -5% hp / tick
            break;
        case NB_StatusEffect.DISEASE:
            this._defBonus = -15;
            this._atkBonus = -15;
            this._agiBonus = -3;
            break;
        case NB_StatusEffect.REGENERATION:
            // SPECIAL EFFECT: +5% hp / tick
            break;
        case NB_StatusEffect.NAUSEA:
            this._defBonus = -5;
            this._agiBonus = -2;
            break;
        case NB_StatusEffect.BLINDNESS:
            // SPECIAL EFFECT: cannot move, use ranged attack, 50% miss on melee
            break;
        case NB_StatusEffect.PARALYZE:
            // SPECIAL EFFECT: cannot act
            break;
        case NB_StatusEffect.MAGIC_RESISTANCE:
            // SPECIAL EFFECT: 25% reduced damage from magic on top of defense
            break;
        case NB_StatusEffect.MIGHT:
            this._atkBonus = 15;
            break;
        case NB_StatusEffect.SLOW:
            this._agiBonus = -5;
            break;
        case NB_StatusEffect.FEAR:
            this._atkBonus = -5;
            this._agiBonus = -2;
            break;
        case NB_StatusEffect.WEAKNESS:
            this._atkBonus = -15;
            break;
        case NB_StatusEffect.BERSERK:
            // SPECIAL EFFECT: attacks nearest
            this._atkBonus = 40;
            this._defBonus = -20;
            break;
        default:
            console.log('Status effect error, no such ID: ' + this._databaseId);
            break;
    }
};

NB_StatusEffect.prototype.getId = function() {
    return this._databaseId;
};

NB_StatusEffect.prototype.getMaxHpBonus = function() {
    return this._mhpBonus;
};

NB_StatusEffect.prototype.getMaxMpBonus = function() {
    return this._mmpBonus;
};

NB_StatusEffect.prototype.getAtkBonus = function() {
    return this._atkBonus;
};

NB_StatusEffect.prototype.getDefBonus = function() {
    return this._defBonus;
};

NB_StatusEffect.prototype.getAgiBonus = function() {
    return this._agiBonus;
};