window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var lambda = function(){
	var self = this,
		runLoop = false,

		canvas = null,
		canvas_ctx = null,

		last_frame = 0,

		gameBlockSize = [10,10],

		playerIndex = false,

		stageGameOver = false,
		stageLevelComplete = false,
		stageMainMenu = true,

		gameVolumeLimit = 0.2;
		gameVolume = gameVolumeLimit;

	self.gameObjects = [];

	self.gameGridSize = [200,200];
	self.gameResolution = [800,800];

	self.fps = 0;
	self.delta = 0;

	self.gameScore = 0;

	self.inputs = {
		up:false,
		down:false,
		left:false,
		right:false,
		shoot:false,
		mute:false
	};

	function __constructor(){
		canvas = document.getElementById('game-viewport');
		canvas.width = self.gameResolution[0];
		canvas.height = self.gameResolution[1];

		canvas_ctx = canvas.getContext('2d');

		$(window).resize(function(){
			if($(window).outerWidth()<800){
				self.gameResolution = [$(window).outerWidth(),$(window).outerHeight()];
			}else{
				self.gameResolution = [800,800];
			}
			canvas.width = self.gameResolution[0];
			canvas.height = self.gameResolution[1];
			gameBlockSize = [(self.gameResolution[0]/self.gameGridSize[0]),(self.gameResolution[1]/self.gameGridSize[0])];
		});
		$(window).resize();

		$('.btn-replay').mouseup(function(){
			$('.stage-gameOver').hide();
			self.reloadLevel();
		});
		$('.btn-start').mouseup(function(){
			$('.stage-start').hide();
			self.reloadLevel();
		});

		window.addEventListener("keydown", function(e){
            switch(e.keyCode){
                case 65: self.inputs.left = true; break;
                case 87: self.inputs.up = true; break;
                case 68: self.inputs.right = true; break;
                case 83: self.inputs.down = true; break;
                case 32: self.inputs.shoot = true; break;
                case 77: self.switchVolume(); break;
            }
        }, false);
        window.addEventListener("keyup", function(e){
            switch(e.keyCode){
                case 65: self.inputs.left = false; break;
                case 87: self.inputs.up = false; break;
                case 68: self.inputs.right = false; break;
                case 83: self.inputs.down = false; break;
                case 32: self.inputs.shoot = false; break;
            }
        }, false);

        self.setVolume(gameVolumeLimit);
		self.start();
		return self;
	}

	function _createGameObjects(){
		self.gameObjects.push(
			new lmbda_object_group_invaders([	
				new lambda_enemy_invader(20,25),
				new lambda_enemy_invader(36,25),
				new lambda_enemy_invader(52,25),
				new lambda_enemy_invader(68,25),
				new lambda_enemy_invader(84,25),
				new lambda_enemy_invader(100,25),
				new lambda_enemy_invader(116,25),
				new lambda_enemy_invader(132,25),
				new lambda_enemy_invader(148,25),
				new lambda_enemy_invader(164,25),
				new lambda_enemy_invader(20,37),
				new lambda_enemy_invader(36,37),
				new lambda_enemy_invader(52,37),
				new lambda_enemy_invader(68,37),
				new lambda_enemy_invader(84,37),
				new lambda_enemy_invader(100,37),
				new lambda_enemy_invader(116,37),
				new lambda_enemy_invader(132,37),
				new lambda_enemy_invader(148,37),
				new lambda_enemy_invader(164,37),	
				new lambda_enemy_invader(20,49),
				new lambda_enemy_invader(36,49),
				new lambda_enemy_invader(52,49),
				new lambda_enemy_invader(68,49),
				new lambda_enemy_invader(84,49),
				new lambda_enemy_invader(100,49),
				new lambda_enemy_invader(116,49),
				new lambda_enemy_invader(132,49),
				new lambda_enemy_invader(148,49),
				new lambda_enemy_invader(164,49),
				new lambda_enemy_invader(36,61),
				new lambda_enemy_invader(52,61),
				new lambda_enemy_invader(68,61),
				new lambda_enemy_invader(84,61),
				new lambda_enemy_invader(100,61),
				new lambda_enemy_invader(116,61),
				new lambda_enemy_invader(132,61),
				new lambda_enemy_invader(148,61)
			]),
			new lambda_fort([15,155]),
			new lambda_fort([65,155]),
			new lambda_fort([115,155]),
			new lambda_fort([161,155]),
			new lambda_fort([161,155])
		);

		self.gameObjects.push(new lambda_player([95,180]));
		playerIndex = self.gameObjects.length-1;
	}

	function _gameLoop(t){
		if(runLoop){
			self.delta = (t-last_frame);
			self.fps =(1000/self.delta).toFixed(2);
			_update(t);
			_render(t);
			last_frame=t;
			window.requestAnimationFrame(_gameLoop);
		}
	}
	function _update(t){
		for(var i=0;i<self.gameObjects.length;i++){
			self.gameObjects[i].update(self);
		}
	}
	function _render(t){
		canvas_ctx.clearRect(0,0,self.gameResolution[0],self.gameResolution[1]);

		for(var i=0;i<self.gameObjects.length;i++){
			self.gameObjects[i].render(canvas_ctx,gameBlockSize);
		}

		if(stageMainMenu){

		}else if(stageGameOver){

		}else if(stageLevelComplete){

		}

		canvas_ctx.font = '20px press_start_2pregular';
		canvas_ctx.fillStyle = 'white';
			canvas_ctx.fillText(self.gameScore, 20, 40);

  		canvas_ctx.font = '9px press_start_2pregular';
  		canvas_ctx.fillStyle = '#33FF00';
			canvas_ctx.fillText('Game Objects: '+self.gameObjects.length, 20, 60);
			canvas_ctx.fillText('Loose FPS: '+self.fps, 20, 80);

			if(playerIndex)
				canvas_ctx.fillText('(x,y): '+self.gameObjects[playerIndex].xy, 20, 100);
	}

	function _clearGameObjects(){
		self.gameObjects = [];
	}

	self.checkGridColision = function(xy,testObjectType,collection){
		// TODO - replace hack fix to take into account object grouping
		var testGroup = (collection) ? collection : self.gameObjects;

		var collision = false;
		for(var a=0;a<testGroup.length;a++){
			if(testGroup[a].objectType && testGroup[a].objectType=='object_group'){
				collision = self.checkGridColision(xy,testObjectType,testGroup[a].objs); // Recursive
				if(collision!==false) break;
			}else{
				// Check loop
				var object = testGroup[a]
				for(var mX=0;mX<object.model.width;mX++){
					for(var mY=0;mY<object.model.height;mY++){
						canvas_ctx.fillRect(mX*gameBlockSize[0],mY*gameBlockSize[1],gameBlockSize[0],gameBlockSize[1]);

						if(object.model.data[mY][mX]==1 && (xy[0]==(object.xy[0]+mX) && xy[1]==(object.xy[1]+mY))){
							collision = {
								obj:object,
								colModelIndex:[mX,mY]
							};
							break;
						}
					}
				}
			}
		}
		return collision;
	}
	self.removeGameObject = function(id,col){
		var collection = (col) ? col : self.gameObjects;

		for(var i=0;i<collection.length;i++){
			if(collection[i].objectType && collection[i].objectType=='object_group'){
				self.removeGameObject(id,collection[i].objs);
			}else{
				if(collection[i].uid==id){
					collection.splice(i,1);
					return true;
				}
			}
		}
		return false;
	}

	self.switchVolume = function(){
		gameVolume = (gameVolume==0.0) ? gameVolumeLimit : 0.0;
		self.setVolume(gameVolume);
	}
	self.setVolume = function(volume){
		document.getElementById('invaderAudio0').volume = volume;
		document.getElementById('invaderAudio1').volume = volume;
		document.getElementById('invaderAudio2').volume = volume;
		document.getElementById('invaderAudio3').volume = volume;
		document.getElementById('playerShoot').volume = volume;
		document.getElementById('invaderKilled').volume = volume;
	}

	self.gameOver = function(){
		playerIndex = false;
		_clearGameObjects();
		stageGameOver = true;
		jQuery('.stage-gameOver').show();
	}

	self.reloadLevel = function(){
		gameScore = 0;
		stageLevelComplete = false;
		stageMainMenu = false;
		stageGameOver = false;
		_createGameObjects();
	}

	self.start = function(){
		runLoop = true;
		_gameLoop();
	}
	self.end = function(){
		runLoop = false;
	}

	return __constructor();
}


var lambda_object = function(){
	var self = this;

	self.uid = Math.random().toString(36).substr(2, 9); // Unlikely Identifier
	self.objectType = 'object';

	self.xy = [0,0];
	self.model = {
		width: 1,
		height: 1,
		data: [
			[1]
		]
	};
	self.colour = '#FFF';

	function __constructor(){
		return self;
	}

	self.update = function(g){

	}
	self.render = function(canvas_ctx,blockSize){
		var xOffset = self.xy[0]*blockSize[0],
			yOffset = self.xy[1]*blockSize[1];

		canvas_ctx.fillStyle = self.colour;

		for(var mX=0;mX<self.model.width;mX++){
			for(var mY=0;mY<self.model.height;mY++){
				if(self.model.data[mY][mX]==1){
					canvas_ctx.fillRect(xOffset+(mX*blockSize[0]),yOffset+(mY*blockSize[1]),blockSize[0],blockSize[1]);
				}
			}
		}
	}

	return __constructor();
}
var lambda_object_group = function(objs){
	var self = this;

	self.objectType = 'object_group';
	self.objs = objs;

	self.update = function(g){
		for(var i=0;i<self.objs.length;i++){
			self.objs[i].update(g);
		}
	}
	self.render = function(canvas_ctx,blockSize){
		for(var i=0;i<self.objs.length;i++){
			self.objs[i].render(canvas_ctx,blockSize);
		}
	}

	return self;
}
var lmbda_object_group_invaders = function(objs){
	var self = new lambda_object_group();

	self.objs = objs;

	self.dir = 2;
	self.moveTick = 500;
	self.lastTick = new Date().getTime();

	var parent_update = self.update;
	self.update = function(g){
		if((new Date().getTime()-self.lastTick)>self.moveTick){
			var vX=0, vY=0;
			vX = (self.dir==2) ? 1 : -1;

			document.getElementById('invaderAudio'+(self.moveTick%4)).play();

			for(var i=0;i<self.objs.length;i++){
				var top = 	self.objs[i].xy[1],
					right = (self.objs[i].xy[0]+self.objs[i].model.width),
					bottom = (self.objs[i].xy[1]+self.objs[i].model.height),
					left = self.objs[i].xy[0];

				if(self.dir==2 && (right+vX)>(g.gameGridSize[0]-15)){
					self.dir = 1;
					vY=2;
				}else if((left+vX)<16){
					self.dir = 2;
					vY=2;
				}
				if(bottom+vY>g.gameGridSize[1]){
					vY=0;
					g.gameOver();
				}
			}

			for(var i=0;i<self.objs.length;i++){
				self.objs[i].xy = [(self.objs[i].xy[0]+vX),(self.objs[i].xy[1]+vY)];
			}

			if(self.moveTick>1)
				self.moveTick-=1;

			self.lastTick = new Date().getTime();
		}
		parent_update(g);
	}

	return self;
}

var lambda_player = function(xy){
	var self = new lambda_object(),
		shootTick = 800;

	self.objectType = 'player';

	self.xy = xy;
	self.speed = 10;
	self.model = {
		width: 15,
		height: 10,
		data: 	[
			[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
			[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
			[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
			[0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
			[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0],
			[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
			[1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
			[1,1,1,1,1,0,1,1,1,0,1,1,1,1,1],
			[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
			[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0]
		]
	};
	self.colour = '#33FF00';

	self.lastShot = new Date().getTime();

	self.update = function(g){
		var vX=0, vY=0;

		if(g.inputs.shoot && (new Date().getTime()-self.lastShot)>shootTick){
			g.gameObjects.push(new lambda_player_bullet([(self.xy[0]+Math.floor(self.model.width/2)),self.xy[1]]));
			document.getElementById('playerShoot').play();
			self.lastShot = new Date().getTime();
		}

		if(g.inputs.left)
			vX-=self.speed*(g.delta/100).toFixed(2);
		if(g.inputs.right)
			vX+=self.speed*(g.delta/100).toFixed(2);

		if(((self.xy[0]+self.model.width)+vX)>(g.gameGridSize[0]) || (self.xy[0]+vX)<0){
			vX=0;
		}

		self.xy[0]=parseInt(self.xy[0]+vX);
		self.xy[1]=parseInt(self.xy[1]+vY);
	}

	return self;
}
var lambda_player_bullet = function(xy){
	var self = new lambda_object();

	self.objectType = 'bullet';

	self.xy = [parseInt(xy[0]),parseInt(xy[1])];
	self.model = {
		width: 1,
		height: 2,
		data: [
			[1],
			[1]
		]
	};

	self.speed = -1;
	self.colour = '#FFF';

	self.update = function(g){
		var vX=0, vY=self.speed;

		var enemy_col = g.checkGridColision([(self.xy[0]+vX),(self.xy[1]+vY)],'enemy');
		if(enemy_col){
			document.getElementById('invaderKilled').play();
			enemy_col.obj.health-=1;
			if(enemy_col.obj.health<1){
				g.removeGameObject(enemy_col.obj.uid);
				g.gameScore+=10;
			}else{
				enemy_col.obj.model.data[enemy_col.colModelIndex[1]][enemy_col.colModelIndex[0]] = 0;
			}
			g.removeGameObject(self.uid);
		}

		if((self.xy[1]+vY)<1){
			g.removeGameObject(self.uid);
		}

		self.xy[0]+=vX;
		self.xy[1]+=vY;
	}

	return self;
}

var lambda_fort = function(xy){
	var self = new lambda_object();

	self.objectType = 'fort';

	self.xy = xy;
	self.model = {
		width: 24,
		height: 16,
		data: [
			[0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
			[0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
			[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
			[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
			[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1]
		]
	};

	self.colour = '#33FF00';

	self.health = 335;

	return self;
}


var lambda_enemy = function(x,y){
	var self = new lambda_object();

	self.objectType = 'enemy';

	self.xy = [x,y];
	self.dir = 2; // 1-left, 2-right, 3-up, 4-down
	self.model = {
		width: 1,
		height: 1,
		data: [1]
	};
	self.health = 5;

	return self;
}
var lambda_enemy_invader = function(x,y){
	var self = new lambda_enemy(x,y);

	self.model = {
		width: 11,
		height: 8,
		data: 	[
			[0,0,1,0,0,0,0,0,1,0,0],
			[0,0,0,1,0,0,0,1,0,0,0],
			[0,0,1,1,1,1,1,1,1,0,0],
			[0,1,1,0,1,1,1,0,1,1,0],
			[1,1,1,1,1,1,1,1,1,1,1],
			[1,0,1,1,1,1,1,1,1,0,1],
			[1,0,1,0,0,0,0,0,1,0,1],
			[0,0,0,1,1,0,1,1,0,0,0]
		]
	};

	return self;
}

