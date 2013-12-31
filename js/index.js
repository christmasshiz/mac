var THREE_D_SCENE = function (ctx, center, fl, backgroundStyle, width, height) {
    
    var context = ctx,
    bgStyle = backgroundStyle || 'rgba(0,0,0,0.1)',
    width = width || 600,
    height = height || 600,
    velZ = 0;
    objs = [];

    this.center =  {
        x : center.x || 200,
        y : center.y || 200,
        z : center.z || 400
    };
    this.focusLength =  fl || 550;
    this.identity = Math.round(Math.random() * 10000000)

    this.setCenter = function (cent) {
        this.center = cent; 
    };

    this.zoomAround = function (val) {
        velZ += val;
    }


    this.update = function () {
        var i = 0;
        this.center.z += velZ;
        velZ *= 0.96;

        for(i = 0; i < objs.length; i += 1) {
            objs[i].update();
        }
    };

    this.render = function () {

        context.save();
        context.fillStyle = bgStyle;
        context.fillRect(0,0,width, height);
        context.restore(); 

        for(i = 0; i < objs.length; i += 1) {
            objs[i].render(context);
        }
    };

    this.addObject = function (three_obj) {
        if(typeof three_obj.update === 'function' && typeof three_obj.render === 'function') {
            three_obj.setScene(this);
            objs.push(three_obj);
        } else {
            console.error('object needs an update and render function');
        }
    };

    this.updateSize = function (wid, hite) {
        width = wid;
        height = hite;
        this.center.x = width * 0.5;
        this.center.y = height * 0.5;
    };
};

var THREE_D_MATH = (function (){
    var maths = {};

    function radians (degs) { return (degs * Math.PI) / 180; }
    function degrees (rads) { return (rads / Math.PI) * 180; }

    maths.makeThreeDeePoints = function (points) {
        var i = 0,
        threedeepoints = [];

        if(!(points instanceof Array)) {
            return console.error('needs to be an array');
        }

        if(points.length % 3 !== 0) {
            return console.error('3d points need to be in sets of three');
        }

        for(i = 0; i < points.length; i += 3) {
            threedeepoints.push({
                x : points[i],
                y : points[i + 1],
                z : points[i + 2]
            });
        }

        return threedeepoints;
    }


    maths.rotateX = function () {
        var i = 0,
        p,
        y1,
        z1,
        rads = radians(this.rVelX),
        cos = Math.cos(rads),
        sin = Math.sin(rads);

        for(i = 0; i < this.points.length; i += 1) {
            p = this.points[i];
            y1 = (p.y * cos) -  (p.z * sin);
            z1 = (p.z * cos) + (p.y * sin);
            p.y =  y1;
            p.z =  z1;
        }
    };

    maths.rotateY = function () {
        var i = 0,
        p,
        x1,
        z1,
        rads = radians(this.rVelY),
        cos = Math.cos(rads),
        sin = Math.sin(rads);

        for(i = 0; i < this.points.length; i += 1) {
            p = this.points[i];
            x1 = (p.x * cos) + (p.z * sin);
            z1 = (p.z * cos) - (p.x * sin);

            p.x = x1;
            p.z = z1;
        }
    };

    maths.rotateZ = function () {
        var i = 0,
        p,
        x1,
        y1,
        rads = radians(this.rVelZ),
        cos = Math.cos(rads),
        sin = Math.sin(rads);

        for(i = 0; i < this.points.length; i += 1) {
            p = this.points[i];
            y1 = (p.y * cos) -  (p.x * sin);
            x1 = (p.x * cos) + (p.y * sin);

            p.x =  x1;
            p.y =  y1;
        }
    };

    /* 
    * you must set the context 
    * of this method to be an instance of Scene
    */
    maths.project = function (p3d, objcent) {
        var p2d = {};
        if(!this instanceof THREE_D_SCENE) {
            console.log('context of method project must be three d scene');
            return { x : 0, y : 0};
        }

        if(objcent) {
            this.scale = this.focusLength / (this.focusLength + p3d.z + this.center.z -objcent.z );
            p2d.x =  this.center.x - objcent.x + p3d.x * this.scale;
            p2d.y =  this.center.y - objcent.y + p3d.y * this.scale;
        } else {
            this.scale = this.focusLength / (this.focusLength + p3d.z + this.center.z );
            p2d.x =  this.center.x + p3d.x * this.scale;
            p2d.y =  this.center.y + p3d.y * this.scale;
        }

        return p2d;
    };


    return maths; 
}());
var THREE_D_OBJECT = function (three_d_points, style) {
    var three_obj = {
        scene : null,
        points : three_d_points,
        style : style || 'rgb(255,0,0)',
        velX : 0,
        velY : 0,
        velZ : 0,
        rVelX : Math.random() * 0.2,
        rVelY : Math.random() * 0.2,
        rVelZ :Math.random() * 0.2,
        center : {
            x : Math.random() * 1000 -400,
            y : Math.random() * 1000 -400,
            z : Math.random() * 4000// -400
        }
    },
    friction = 0.91;


    three_obj.updateVelocities = function (vels) {
        var vel;
        for(vel in vels) {
            three_obj[vel] = vels[vel];
        }
    };

    three_obj.setScene = function (seen) {
        three_obj.scene = seen;
    };

    three_obj.update = function () {
        THREE_D_MATH.rotateX.call(three_obj);
        THREE_D_MATH.rotateY.call(three_obj);
        THREE_D_MATH.rotateZ.call(three_obj);
    };

    three_obj.render = function (ctx) {
            var i = 1,
            p2d,
            c2d;

            ctx.save(); 

            ctx.strokeStyle = style;
            ctx.beginPath();

            p2d = THREE_D_MATH.project.call(three_obj.scene, three_obj.points[0], three_obj.center);
            ctx.moveTo( p2d.x , p2d.y );

            if(three_obj.points.length > 1) {
                for(i = 1; i < three_obj.points.length; i += 1) {
                    p2d = THREE_D_MATH.project.call(three_obj.scene, three_obj.points[i], three_obj.center );
                    ctx.lineTo(p2d.x, p2d.y);
                }
            } else {
                ctx.lineTo(p2d.x + 1,p2d.y + 1)
            }

            ctx.stroke();
            ctx.restore();
        };

    return three_obj; 
};

var ANIMATION_CONTROLLER = (function () {
	var troller = {},
	scenes = [],
	animFrame = (function(){
          return  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  window.oRequestAnimationFrame      ||
                  window.msRequestAnimationFrame     ||
                  function(/* function */ callback/*,  DOMElement  element */){
                    window.setTimeout(callback, 1000 / 60);
                  };
    }());

    function looper () {
    	var i = 0;

    	for(i = 0; i < scenes.length; i+= 1) {
    		scenes[i].update();
    	}

    	for(i = 0; i < scenes.length; i+= 1) {
    		scenes[i].render();
    	}

    	animFrame(looper);
    }

    troller.addScene = function (seen) {
    	if(seen instanceof THREE_D_SCENE) {
    		scenes.push(seen);
    	} else {
    		console.error('object needs an update and render function');
    	}
    };

    troller.removeScene = function (seen) {
    	var i = 0;
    	for(i = 0; i < scenes.length; i+= 1) {
    		if(seen.identity === scenes[i].identity) {
    			scenes.splice(i,1);
    		}
    	}
    }; 

    troller.init = function () {
    	looper();
    }

	return troller;

}());

(function () {
    var canvas = document.getElementById('canvas'),
    width = document.body.offsetWidth,
    height = document.body.offsetHeight,
    squareShape =[
    0,0,0,
    24,0,0,
    24,24,0,
    0,24,0,
    0,0,0,
    0,0,24,
    24,0,24,
    24,0,0,
    24,0,24,
    24,24,24,
    24,24,0,
    24,24,24,
    0,24,24,
    0,24,0,
    0,24,24,
    0,0,24],
    stars = [],
    randomColor = function () {
        var rr = Math.round(Math.random() * 255),
        rg = Math.round(Math.random() * 255),
        rb = Math.round(Math.random() * 255);

        return 'rgb(' + rr + ', ' + rg + ', ' + rb + ' )';s
    },
    context = canvas.getContext('2d'),
    scene = new THREE_D_SCENE(context, { x : 200, y : 200, z : 200}),
    square;
    canvas.width = width;
    canvas.height = height;
    scene.updateSize(width,height);

    for(var i = 0; i < 100; i += 1) {
        var sp = THREE_D_MATH.makeThreeDeePoints(squareShape);
        square = THREE_D_OBJECT(sp, randomColor());
        scene.addObject(square);
    }

    window.addEventListener('keydown', function (evt){
        var e = evt || window.event;
        switch(e.keyCode) {
            case 38:
                e.preventDefault();
                scene.zoomAround(2);
            break;
            case 40:
                e.preventDefault();
                scene.zoomAround(-2);
            break; 
        }
    }, false);
 
    ANIMATION_CONTROLLER.addScene(scene);
    ANIMATION_CONTROLLER.init();

}());