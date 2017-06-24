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
    
    aliases.TouchInput_static_onMouseMove = TouchInput._onMouseMove;
    TouchInput._onMouseMove = function(event) {
        aliases.TouchInput_static_onMouseMove.call(event);
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
    var mouseX = TouchInput.ncx;
    var mouseY = TouchInput.ncy;
    
    aliases.Scene_Base_initialize = Scene_Base.prototype.initialize;
    Scene_Base.prototype.initialize = function() {
        aliases.Scene_Base_initialize.call(this);
        this._mouseAvailable = false;
        this._mouse = null;
        this._mouseLight = null;
    }
    
    Scene_Base.prototype.addMouse = function() {
        this._mouseAvailable = true;
        this._mouse = new Sprite();
        this._mouse.bitmap = ImageManager.loadInterfaceElement('', 'cursor', 0);
        this._mouseLight = new Sprite();
        this._mouseLight.bitmap = ImageManager.loadInterfaceElement('', 'cursor_light', 0);
        
        mouseX = TouchInput.ncx;
        mouseY = TouchInput.ncy;
        this._mouse.x = mouseX;
        this._mouse.y = mouseY;
        this._mouseLight.x = mouseX;
        this._mouseLight.y = mouseY;
        
        if (mouseActive) {
            this._mouse.visible = true;
            this._mouseLight.visible = true;
            this._mouseLight.opacity = 0;
        } else {
            this._mouse.visible = false;
            this._mouseLight.visible = false;
            this._mouseLight.opacity = 0;
        }
        
        this.addChild(this._mouse);
        this.addChild(this._mouseLight);
    };
    
    Scene_Base.prototype.updateMouse = function() {
        if (Input.isTriggered('up') || Input.isTriggered('down')) {
            mouseActive = false;
            this._mouse.visible = false;
            this._mouseLight.visible = false;
            this._mouseLight.opacity = 0;
        } else {
            if (mouseX != TouchInput.ncx || mouseY != TouchInput.ncy) {
                mouseActive = true;
                mouseX = TouchInput.ncx;
                mouseY = TouchInput.ncy;
                this._mouse.x = mouseX;
                this._mouse.y = mouseY;
                this._mouseLight.x = mouseX;
                this._mouseLight.y = mouseY;
                this._mouse.visible = true;
                this._mouseLight.visible = true;
            }
        }
        if (TouchInput.isPressed()) {
            this._mouseLight.opacity = 255;
        } else {
            if (this._mouseLight.opacity > 0) this._mouseLight.opacity -= 15;
        }
    };
    
    Scene_Base.prototype.isMouseActive = function() {
        return mouseActive;
    };
    
    Scene_Base.prototype.deactivateMouse = function() {
        if (this._mouseAvailable) {
            mouseActive = false;
            this._mouse.visible = false;
            this._mouseLight.visible = false;
        }
    };
    
    Scene_Base.prototype.activateMouse = function() {
        if (this._mouseAvailable) {
            mouseActive = true;
            this._mouse.visible = true;
            this._mouseLight.visible = true;
        }
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
    this._scalePoint = new PIXI.Point(1, 1);
    this._disposed = false;
    
    this.updateOpacity();
    this._syncPosition();
};

NB_Button.prototype.dispose = function() {
    this._disposed = true;
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
    if (this._disposed) {
        this._scalePoint.x += 0.01;
        this._graphics.scale = this._scalePoint;
    } else {
        if (this._active) {
            if (this._lightOpacity < 255) this._lightOpacity += 15;
        } else {
            if (this._lightOpacity > 0) this._lightOpacity -= 15;
        }
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
    this._buttons = [];
    this._active = 0;
};

NB_ButtonGroup.prototype.add = function(button, activate) {
    this._buttons.push(button);
    if (activate) this._buttons[this._buttons.length-1].activate();
};

NB_ButtonGroup.prototype.setMasterOpactiy = function(value) {
    for (i = 0; i < this._buttons.length; i++) {
        this._buttons[i].setMasterOpacity(value);
    }
};

NB_ButtonGroup.prototype.addToContainer = function(container) {
    for (i = 0; i < this._buttons.length; i++) {
        container.addChild(this._buttons[i]._graphics);
        container.addChild(this._buttons[i]._light);
    }  
};

NB_ButtonGroup.prototype.getActiveID = function() {
    return this._active;  
};

NB_ButtonGroup.prototype.update = function(mouseActive) {
    // Control keyboard input
    if (Input.isTriggered('up')) {
        SoundManager.playCursor();
        if (this._active == 0) {
            this._active = this._buttons.length-1;
        } else {
            this._active--;
        }
    }
    if (Input.isTriggered('down')) {
        SoundManager.playCursor();
        if (this._active == this._buttons.length-1) {
            this._active = 0;
        } else {
            this._active++;
        }
    }
    // Control mouse input
    for (i = 0; i < this._buttons.length; i++) {
        if (mouseActive) {
            if (this._buttons[i].mouseInside()) {
                this._active = i;
            }
        }
    }
    // Control button opacity
    for (i = 0; i < this._buttons.length; i++) {
        if (this._active == i) {
            this._buttons[i].activate();
        } else {
            this._buttons[i].deactivate();
        }
        this._buttons[i].update();
    }
};
