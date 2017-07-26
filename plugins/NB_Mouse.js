//=============================================================================
// NB_Mouse.js
//=============================================================================

/*:
 * @plugindesc Adds the mouse to base scenes.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    document.body.style.cursor = 'none';
    
    ImageManager.loadMouseGraphics = function(subpath, filename) {
        return this.loadBitmap('img/mouse/' + subpath, filename, 0, true);
    };
    
    /*********************************************
     * Disable mouse in snaps
     *********************************************/
    
    // Override!
    SceneManager.snap = function() {
        var mouseWasActive = this._scene.isMouseActive();
        this._scene.deactivateMouse();
        
        var snapshot = Bitmap.snap(this._scene);
        
        if (mouseWasActive) this._scene.activateMouse();
        return snapshot;
    };
    
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
     * Mouse
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
        this._mouse.bitmap = ImageManager.loadMouseGraphics('', 'cursor');
        this._mouseLight = new Sprite();
        this._mouseLight.bitmap = ImageManager.loadMouseGraphics('', 'cursor_light');
        
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
