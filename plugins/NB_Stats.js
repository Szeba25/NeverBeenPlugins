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
        this._nbStats.setup(this.mhp, this.mmp, this.atk, this.def);
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
        this._hp = 0;
        this._mhp = 0;
        this._mp = 0;
        this._mmp = 0;
        this._atk = 0;
        this._def = 0;
        this._equipment = [null, null, null, null, null];
        this._statusEffects = [];
    };
    
    NB_Stats.prototype.setup = function(hp, mp, atk, def) {
        this._mhp = hp;
        this._mmp = mp;
        this._atk = atk;
        this._def = def;
        this.recover();
    };
    
    NB_Stats.prototype.changeHp = function(change, emulate) {
        var emulatedValue = this._changePts(this._hp, this.getTotalMaxHp(), change);
        if (!emulate) this._hp = emulatedValue;
        return emulatedValue;
    };
    
    NB_Stats.prototype.changeMp = function(change, emulate) {
        var emulatedValue = this._changePts(this._mp, this.getTotalMaxMp(), change);
        if (!emulate) this._mp = emulatedValue;
        return emulatedValue;
    };
    
    NB_Stats.prototype.changeMaxHp = function(change) {
        this._mhp = this._changePts(this._mhp, this.MAX_MHP, change);
        if (this._hp > this.getTotalMaxHp()) this._hp = this.getTotalMaxHp();
    };
    
    NB_Stats.prototype.changeMaxMp = function(change) {
        this._mmp = this._changePts(this._mmp, this.MAX_MMP, change);
        if (this._mp > this.getTotalMaxMp()) this._mp = this.getTotalMaxMp();
    };
    
    NB_Stats.prototype.changeAtk = function(change, emulate) {
        var newValue = this._changePts(this._atk, this.MAX_ATK, change);
        var emulatedValue = this.getTotalAtk(newValue);
        if (!emulate) this._atk = newValue;
        return emulatedValue;
    };
    
    NB_Stats.prototype.changeDef = function(change, emulate) {
        var newValue = this._changePts(this._def, this.MAX_DEF, change);
        var emulatedValue = this.getTotalDef(newValue);
        if (!emulate) this._def = newValue;
        return emulatedValue;
    };
    
    NB_Stats.prototype._changePts = function(value, max, change) {
        value += change;
        if (value > max) value = max;
        if (value < 0) value = 0;
        return value;
    };
    
    NB_Stats.prototype.recover = function() {
        this._hp = this.getTotalMaxHp();
        this._mp = this.getTotalMaxMp();
    };
    
    NB_Stats.prototype.getHp = function() {
        return this._hp;
    };
    
    NB_Stats.prototype.getTotalMaxHp = function() {
        var mhp = this._mhp;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            mhp += statusEffect.getMaxHpBonus();
        }
        if (mhp < 0) mhp = 0;
        if (mhp > this.MAX_MHP) mhp = this.MAX_MHP;
        return mhp;
    };
    
    NB_Stats.prototype.getMp = function() {
        return this._mp;
    };
    
    NB_Stats.prototype.getTotalMaxMp = function() {
        var mmp = this._mmp;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            mmp += statusEffect.getMaxMpBonus();
        }
        if (mmp < 0) mmp = 0;
        if (mmp > this.MAX_MMP) mmp = this.MAX_MMP;
        return mmp;
    };
    
    NB_Stats.prototype.getTotalAtk = function(emulateFromOther) {
        var atk = emulateFromOther || this._atk;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            atk += statusEffect.getAtkBonus();
        }
        if (atk < 0) atk = 0;
        if (atk > this.MAX_ATK) atk = this.MAX_ATK;
        return atk;
    };
    
    NB_Stats.prototype.getTotalDef = function(emulateFromOther) {
        var def = emulateFromOther || this._def;
        for (var i = 0; i < this._statusEffects.length; i++) {
            var statusEffect = this._statusEffects[i];
            def += statusEffect.getDefBonus();
        }
        if (def < 0) def = 0;
        if (def > this.MAX_DEF) def = this.MAX_DEF;
        return def;
    };
    
    NB_Stats.prototype.hasStatusEffect = function(id) {
        for (var i = 0; i < this._statusEffects.length; i++) {
            if (id == this._statusEffects[i].getId()) {
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
        var effectId = this.hasStatusEffect(id);
        if (effectId !== -1) {
            this._statusEffects.splice(effectId, 1);
        }
    };
    
})();

/****************************************************************
 * Item effect object
 ****************************************************************/

function NB_ItemEffect() {
    this.initialize.apply(this, arguments);
}

NB_ItemEffect.prototype.initialize = function(itemSchema) {
    this._hpChange = 0;
    this._mhpChange = 0;
    this._mpChange = 0;
    this._mmpChange = 0;
    this._atkChange = 0;
    this._defChange = 0;
    this._statusEffectsChange = [];
    if (itemSchema) {
        for (var i = 0; i < itemSchema.effects.length; i++) {
            this.applyFromEffect(itemSchema.effects[i]);
        }
    }
};

NB_ItemEffect.prototype.applyFromEffect = function(effect) {
    switch(effect.code) {
    case 11:
        // RECOVER HP
        this._addHpChange(effect.value2);
        break;
    case 12:
        // RECOVER MP
        this._addMpChange(effect.value2);
        break;
    case 21:
        // ADD STATE
        this._statusEffectsChange.push(effect.dataId);
        break;
    case 42:
        // GROW
        switch(effect.dataId) {
            case 0:
                this._addMaxHpChange(effect.value1);
                break;
            case 1:
                this._addMaxMpChange(effect.value1);
                break;
            case 2:
                this._addAtkChange(effect.value1);
                break;
            case 3:
                this._addDefChange(effect.value1);
                break;
        }
        break;
    default:
        break;
    }
};

NB_ItemEffect.prototype._addHpChange = function(value) {
    this._hpChange += value;
};

NB_ItemEffect.prototype._addMaxHpChange = function(value) {
    this._mhpChange += value;
};

NB_ItemEffect.prototype._addMpChange = function(value) {
    this._mpChange += value;
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

NB_ItemEffect.prototype.getEmulatedHpChange = function(nbStats) {
    return nbStats.changeHp(this._hpChange, true);
};

NB_ItemEffect.prototype.getEmulatedMpChange = function(nbStats) {
    return nbStats.changeMp(this._mpChange, true);
};

NB_ItemEffect.prototype.getEmulatedAtkChange = function(nbStats) {
    return nbStats.changeAtk(this._atkChange, true);
};

NB_ItemEffect.prototype.getEmulatedDefChange = function(nbStats) {
    return nbStats.changeDef(this._defChange, true);
};

NB_ItemEffect.prototype.apply = function(nbStats) {
    nbStats.changeHp(this._hpChange);
    nbStats.changeMaxHp(this._mhpChange);
    nbStats.changeMp(this._mpChange);
    nbStats.changeMaxMp(this._mmpChange);
    nbStats.changeAtk(this._atkChange);
    nbStats.changeDef(this._defChange);
    for (var i = 0; i < this._statusEffectsChange.length; i++) {
        nbStats.addStatusEffect(this._statusEffectsChange[i]);
    }
};

/****************************************************************
 * Status effect object
 ****************************************************************/

function NB_StatusEffect() {
    this.initialize.apply(this, arguments);
}

NB_StatusEffect.prototype.initialize = function(id, duration) {
    this._databaseId = id;
    this._mhpBonus = 0;
    this._mmpBonus = 0;
    this._atkBonus = 0;
    this._defBonus = 0;
    this._duration = 0;
    this._setBonuses();
};

NB_StatusEffect.prototype._setBonuses = function() {
    switch(this._databaseId) {
        case 1: // Knockout - NOT USED
            break;
        case 2: // Shield
            this._defBonus = 20;
            break;
        case 3: // Weakness
            this._atkBonus = -10;
            break;
        default:
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