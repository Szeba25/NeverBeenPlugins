//=============================================================================
// NB_Interface.js
//=============================================================================

/*:
 * @plugindesc Interface base objects
 * All other UI scripts will be based on this plugin.
 * @author Scalytank
 */

(function() {
 
    var aliases = {};
    document.body.style.cursor = 'none';
    
    /*********************************************
     * Mouse position getters
     *********************************************/
    
    Object.defineProperty(TouchInput, 'ncx', {
        get: function() {
            return Graphics.pageToCanvasX(this._ncx);
        },
        configurable: true
    });
    
    Object.defineProperty(TouchInput, 'ncy', {
        get: function() {
            return Graphics.pageToCanvasY(this._ncy);
        },
        configurable: true
    });
    
    aliases.TouchInput_onMouseMove = TouchInput._onMouseMove;
    TouchInput._onMouseMove = function(event) {
        aliases.TouchInput_onMouseMove.call(event);
        TouchInput._ncx = event.pageX;
        TouchInput._ncy = event.pageY;
    };
    
    TouchInput.insideRegion = function(x, y, w, h) {
        return (TouchInput.ncx > x && TouchInput.ncx < x + w &&
                TouchInput.ncy > y && TouchInput.ncy < y + h);
    };

    /*********************************************
     * Interface graphics loader
     *********************************************/
    
    ImageManager.loadInterfaceElement = function(subpath, filename, hue) {
        return this.loadBitmap('img/interface/' + subpath, filename, hue, true);
    };
    
    /*********************************************
     * Hide mouse and remove blur from snapshots
     *********************************************/
    
    // Override!
    SceneManager.snap = function() {
        var mouseWasActive = this._scene.isMouseActive();
        this._scene.deactivateMouse();
        
        var snapshot = Bitmap.snap(this._scene);
        
        if (mouseWasActive) this._scene.activateMouse();
        return snapshot;
    };
    
    // Override!
    SceneManager.snapForBackground = function() {
        this._backgroundBitmap = this.snap();
    };
    
    /*********************************************
     * Mouse stuff
     *********************************************/
    
    var mouseActive = false;
    var mouse = new Sprite();
    mouse.bitmap = ImageManager.loadInterfaceElement('', 'cursor', 0);
    mouse.visible = false;
    mouse.x = TouchInput.ncx;
    mouse.y = TouchInput.ncy;
    
    Scene_Base.prototype.addMouse = function() {
        this.addChild(mouse);
    };
    
    Scene_Base.prototype.updateMouse = function() {
        if (Input.isTriggered('up') || Input.isTriggered('down')) {
            mouseActive = false;
            mouse.visible = false;
        } else {
            if (mouse.x != TouchInput.ncx || mouse.y != TouchInput.ncy) {
                mouse.x = TouchInput.ncx;
                mouse.y = TouchInput.ncy;
                mouseActive = true;
                mouse.visible = true;
            }
        }
    };
    
    Scene_Base.prototype.isMouseActive = function() {
        return mouseActive;  
    };
    
    Scene_Base.prototype.deactivateMouse = function() {
        mouseActive = false;
        mouse.visible = false;
    };
    
    Scene_Base.prototype.activateMouse = function() {
        mouseActive = true;
        mouse.visible = true;
    };
    
    aliases.Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        aliases.Scene_Map_createDisplayObjects.call(this);
        this.addMouse();
    };
    
    aliases.Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        aliases.Scene_Map_update.call(this);
        this.updateMouse();
    };

})();

/****************************************************************
 * The base of all never been interface scenes!
 ****************************************************************/

function NB_Interface() {
    this.initialize.apply(this, arguments);
}

NB_Interface.prototype = Object.create(Scene_Base.prototype);
NB_Interface.prototype.constructor = NB_Interface;

NB_Interface.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

NB_Interface.prototype.create = function() {
    this.addMouse();
    Scene_Base.prototype.create.call(this);
};

NB_Interface.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
};

NB_Interface.prototype.update = function() {
    this.updateMouse();
    Scene_Base.prototype.update.call(this);
};

NB_Interface.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
};

NB_Interface.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
};

NB_Interface.prototype.isBusy = function() {
    return Scene_Base.prototype.isBusy.call(this);
};

NB_Interface.prototype.isReady = function() {
    return Scene_Base.prototype.isReady.call(this);
};

/****************************************************************
 * General button interface element.
 ****************************************************************/

function NB_Button() {
    this.initialize.apply(this, arguments);
}

NB_Button.prototype.initialize = function(bkgPath, bkg, lightPath, light, text, x, y, masterOpacity) {
    this._graphics = new Sprite();
    this._graphics.bitmap = ImageManager.loadInterfaceElement(bkgPath, bkg, 0);
    this._light = new Sprite();
    this._light.bitmap = ImageManager.loadInterfaceElement(lightPath, light, 0);
    this._x = x;
    this._y = y;
    this._lightOpacity = 0;
    this._active = false;
    this._masterOpacity = masterOpacity;
    
    this.updateOpacity();
    this._syncPosition();
};

NB_Button.prototype._syncPosition = function() {
    this._graphics.x = this._x;
    this._graphics.y = this._y;
    this._light.x = this._x;
    this._light.y = this._y;
};

NB_Button.prototype.setMasterOpacity = function(opc) {
    this._masterOpacity = opc;
    this.updateOpacity();
};

NB_Button.prototype.activate = function() {
    this._active = true;
};

NB_Button.prototype.deactivate = function() {
    this._active = false;  
};

NB_Button.prototype.updateOpacity = function() {
    this._graphics.opacity = this._masterOpacity;
    this._light.opacity = Math.round(this._lightOpacity * (this._masterOpacity / 255));
};

NB_Button.prototype.mouseInside = function() {
    return (TouchInput.insideRegion(this._x, this._y, this._graphics.width, this._graphics.height));
};

NB_Button.prototype.update = function() {
    if (this._active) {
        if (this._lightOpacity < 255) this._lightOpacity += 15;
    } else {
        if (this._lightOpacity > 0) this._lightOpacity -= 15;
    }
    this.updateOpacity();
};

/****************************************************************
 * Button group
 ****************************************************************/

function NB_ButtonGroup() {
    this.initialize.apply(this, arguments);
}

NB_ButtonGroup.prototype.initialize = function() {
    
};

