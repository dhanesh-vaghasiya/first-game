const canvas = document.querySelector('#main-canvas')
const backgroundCanvas = document.querySelector('#background-canvas')
const c = canvas.getContext('2d')
const bgc = backgroundCanvas.getContext('2d')

canvas.width = innerWidth *.9
canvas.height = innerHeight *.9

backgroundCanvas.width = innerWidth *.9
backgroundCanvas.height = innerHeight *.9

//declaring variables
let playerJumpPower = 4
let player
let positiveOfset
let negativeOfset
let offSet
let backgroundDrawPositionX , backgroundDrawPositionMinusX
let healthBar
let score, lastScore
let scoreIntervalId
let enemies = []
let enemyBullet = []
let floor = []
let grass = []
let trees = []
let background = []
const backgroundMusic = new Audio('./music/background music.wav')
backgroundMusic.autoplay = true
backgroundMusic.loop = true
backgroundMusic.volume = 0.4
const playerAttackMusic = new Audio("./music/swordAttack.mp3")
const jumpMusic = new Audio("./music/playerJumping.wav")
const enemyFireSound = new Audio("./music/enemyFireSound.mp3")
const enemyDyingSound = new Audio("./music/enemyDying.mp3")
const playerDyingSound = new Audio("./music/playerDying.mp3")
const playerRunningSound = new Audio("./music/running.mp3")
const bulletHittingPlayer = new Audio("./music/playerHittingBullet.wav")

const playerJumpImage = createImage('./img/playerJump.png')
const playerJumpAttackImage = createImage('./img/playerJumpAttack.png')
const playerLandAttackImage = createImage('./img/playerLandingAttack.png')
const bulletImage = createImage("./img/bullet.png")
const floorImage = createImage("./img/Floor.png")
const groundImage = createImage("./img/Ground.png")
const waterImage = createImage("./img/Water.png")
const healthBarImage = createImage("./img/healthBar.png")
const grassImage = createImage('./img/Grass.png')
const backgroundImage = createImage('./img/background_scene.png')
const treeImage = createImage('./img/trees.png')
const keys = {
	right: {
		pressed: false
	},
	left: {
		pressed: false
	},
	space: {
		pressed: false
	}
}
const statesMovingSpeed = 5
const backgroundMovingSpeed = 1
const treesMovingSpeed = 2
let shouldConditionCheck = true


// Fetching Score
lastScore = localStorage.getItem("last-score")===null ? 0 : localStorage.getItem("last-score")
document.querySelector("#start-last-record").textContent = lastScore

bgc.fillStyle = '#41d5f9'
bgc.fillRect(0,0,canvas.width,canvas.height)
// Creating functions
function animate() {
	let animationID = requestAnimationFrame(animate)

  c.clearRect(0,0,canvas.width,canvas.height)
  bgc.clearRect(0,0,canvas.width,canvas.height)
	
	background.forEach(plain=>{
		plain.draw()
	})
	bgc.globalAlpha = 10
	trees.forEach(tree =>{
		tree.draw()
	})
	bgc.globalAlpha = 1
	
	healthBar.draw()
	
	if (positiveOfset > backgroundDrawPositionX){
		background.push(new Background(background.slice(-1)[0].position.x+canvas.height,0,canvas.height, canvas.height))
		backgroundDrawPositionX += 30
	}
	if (negativeOfset > backgroundDrawPositionMinusX){
		background.unshift(new Background(background[0].position.x-canvas.height,0,canvas.height, canvas.height))
		backgroundDrawPositionMinusX += 30
	}
	
	if (keys.right.pressed){
		player.velocity.x += player.speed
		positiveOfset++
		
		if(!player.inAir) playerRunningSound.play()
	} else if (keys.left.pressed) {
		player.velocity.x -= player.speed
		negativeOfset++
		
		if(!player.inAir) playerRunningSound.play()
	}	else player.velocity.x = 0
	
	if (player.position.x + player.width > canvas.width *.5 && offSet<440){
		floor.forEach(flo => {
			flo.position.x-= statesMovingSpeed
		})
		enemies.forEach(enem =>{
			enem.position.x -= statesMovingSpeed
			enem.platformStart -= statesMovingSpeed
			enem.platformEnd -= statesMovingSpeed
		})
		enemyBullet.forEach(bule=>{
			bule.position.x -= statesMovingSpeed
		})
		
		grass.forEach(pal=>{
			pal.position.x -= statesMovingSpeed
		})
		
		background.forEach(plain => {
			plain.position.x -= backgroundMovingSpeed
		})
		
		trees.forEach(wood=>{
			wood.position.x -= treesMovingSpeed
		})
		offSet++
		player.position.x = canvas.width*.5-player.width
	} else if (player.position.x < canvas.width *.1  && offSet>0){
		floor.forEach(flo => {
			flo.position.x += statesMovingSpeed
		})
		enemies.forEach(enem =>{
			enem.position.x += statesMovingSpeed
			enem.platformStart += statesMovingSpeed
			enem.platformEnd += statesMovingSpeed
		})
		enemyBullet.forEach(bule=>{
			bule.position.x += statesMovingSpeed
		})
		
		grass.forEach(pal=>{
			pal.position.x += statesMovingSpeed
		})
		
		background.forEach(plain => {
			plain.position.x += backgroundMovingSpeed
		})
		
		trees.forEach(wood=>{
			wood.position.x += treesMovingSpeed
		})
		offSet--
		
		player.position.x = canvas.width*.1
	}
	
	if (player.position.x <= 0) player.position.x =0
	
	if (player.position.x + player.width>= canvas.width){
		player.position.x = canvas.width - player.width
		if (enemies.length === 0){
			document.getElementById("game-win-menu").style.display = 'flex'
			localStorage.setItem("last-score", score)
			gameOver()
			cancelAnimationFrame(animationID)
			
		}
		
	}	
	
	enemyBullet.forEach((bullet, index)=>{
		bullet.update()
		bullet.position.x += bullet.velocity.x
		
		
		if(player.position.x + player.width*.7 >= bullet.position.x && player.position.x+player.width*.2 <=bullet.position.x + bullet.radius && player.position.y+player.height>=bullet.position.y&& player.position.y<=bullet.position.y+bullet.radius){
			
			if (healthBar.currentSprite === healthBar.sprite.AtFull){
				healthBar.currentSprite = healthBar.sprite.AtThird
				bulletHittingPlayer.play()
			} else if (healthBar.currentSprite === healthBar.sprite.AtThird){
				healthBar.currentSprite = healthBar.sprite.AtSecond
				bulletHittingPlayer.play()
			} else if (healthBar.currentSprite === healthBar.sprite.AtSecond){
				healthBar.currentSprite = healthBar.sprite.AtEmpty
				playerDyingSound.play()
				healthBar.draw()
				
			//Player Dying
				
				lastScore = score
				document.getElementById('game-over-menu').style.display = 'flex'
				gameOver()
				cancelAnimationFrame(animationID)
				
			}
			enemyBullet.splice(index,1)
		}
		
		if (bullet.position.x + bullet.radius <= 0 || bullet.position.x - bullet.radius >= canvas.width){
			enemyBullet.splice(index, 1)
		}
	})
	
	for (let i = 0; i<floor.length; i++){
		floor[i].update()
		if (player.position.y +player.width*.5 > floor[i].position.y && floor[i].image === waterImage) {
			
			c.fillStyle = '#41d5f9'
			c.fillRect(0,0, canvas.width, canvas.height)
			gameOver()
			document.getElementById('game-over-menu').style.display = 'flex'
			cancelAnimationFrame(animationID)
			
		}
	}
	
	grass.forEach(grass =>{
		grass.update()
	})
	
	enemies.forEach((enemy,index)=>{
		if (player.position.x + player.width >= enemy.position.x+enemy.width*.3 
		&&  player.position.x <= enemy.position.x + enemy.width*0.8
		&&  player.position.y + player.height >= enemy.position.y
		&&  player.position.y <= enemy.position.y + enemy.height
		&&  enemy.isAlive
		&& (player.currentSprite == player.playerSprite.Attacking.left || player.currentSprite == player.playerSprite.Attacking.right || player.currentSprite == player.playerSprite.JumpingAttack.right || player.currentSprite == player.playerSprite.JumpingAttack.left || player.currentSprite == player.playerSprite.LandingAttack.right || player.currentSprite == player.playerSprite.LandingAttack.left)){
			// if (enemy.alpha>0) enemy.alpha -=.07
			// if (enemy.alpha<0) enemy.alpha = 0
			// enemies.splice(index,1)
			enemy.isAlive = false
			enemy.velocity.x = 0
			
			if (enemy.currentSprite == enemy.enemySprint.Walking.Right|| enemy.currentSprite == enemy.enemySprint.Attacking.Right) enemy.currentSprite = enemy.enemySprint.Dying.right; console.log('dk')
			if (enemy.currentSprite == enemy.enemySprint.Walking.Left || enemy.currentSprite == enemy.enemySprint.Attacking.Left) enemy.currentSprite = enemy.enemySprint.Dying.left; console.log('kd')
			
			enemyDyingSound.play()
			setTimeout(function() {
				enemies.splice(index,1); 
				enemies.forEach((enemy, enemIndex)=>{
					if (enemy.currentSprite === enemy.enemySprint.Dying.right || enemy.currentSprite === enemy.enemySprint.Dying.left){
						enemies.splice(enemIndex, 1)
						
					}
				})
				
			}, 1500);
		}
		enemy.update()
	})
	document.querySelector(".player-time").textContent = score
	
	player.update()
	
	if (!shouldConditionCheck) return
	
	enemies.forEach(enem =>{
		if (player.position.y <= enem.position.y+enem.height && player.position.y >= enem.position.y - enem.height*.5 && player.position.x > enem.position.x-200 && enem.currentSprite == enem.enemySprint.Walking.Left && !(player.position.x > enem.position.x) && enem.isAlive){
			shouldConditionCheck = false
			enem.attack("left")
			setTimeout(() => {shouldConditionCheck = true	}, 2000)
		} else if (player.position.y<=enem.height+enem.position.y && player.position.y >= enem.position.y - enem.height*.5 && player.position.x < enem.position.x +200 && enem.currentSprite == enem.enemySprint.Walking.Right && !(player.position.x < enem.position.x)&& enem.isAlive ){
			shouldConditionCheck = false
			enem.attack("right")
			setTimeout( ()=>shouldConditionCheck= true, 2000)
		}
		
	})
}

function init() {
	
	//Adding events listeners
	addEventListener('keypress', e=> {
		switch (e.code) {
			case 'KeyD':
				if (!keys.left.pressed){
					keys.right.pressed = true
					
					if (!player.inAir) player.currentSprite = player.playerSprite.Standing.right
					else if(player.currentSprite=== player.playerSprite.Jumping.left) player.currentSprite = player.playerSprite.Jumping.right
					else if(player.currentSprite=== player.playerSprite.Landing.left) player.currentSprite = player.playerSprite.Landing.right
					else if(player.currentSprite === player.playerSprite.JumpingAttack.left) player.currentSprite = player.playerSprite.JumpingAttack.right
					else if(player.currentSprite === player.playerSprite.Attacking.left) player.currentSprite = player.playerSprite.Attacking.right
					else if(player.currentSprite === player.playerSprite.LandingAttack.left) player.currentSprite = player.playerSprite.LandingAttack.right
					
				}
				break;  
			
			case 'KeyA':
				if (!keys.right.pressed){
					keys.left.pressed = true
					if (!player.inAir) player.currentSprite = player.playerSprite.Standing.left
					else if(player.currentSprite === player.playerSprite.Landing.right) player.currentSprite = player.playerSprite.Landing.left
					else if(player.currentSprite === player.playerSprite.Jumping.right) player.currentSprite = player.playerSprite.Jumping.left
					else if(player.currentSprite === player.playerSprite.JumpingAttack.right) player.currentSprite = player.playerSprite.JumpingAttack.left
					else if(player.currentSprite === player.playerSprite.Attacking.right) player.currentSprite = player.playerSprite.Attacking.left
					else if(player.currentSprite === player.playerSprite.LandingAttack.right) player.currentSprite = player.playerSprite.LandingAttack.left

				}
				break;
			case 'KeyW':
				if (!player.inAir){
					// player.position.y -=2
					jumpMusic.play()
					player.jump()
				}
				
				break;
			case 'Space':
				
				if (player.currentSprite == player.playerSprite.Standing.left )	player.attack("left")
			  else if (player.currentSprite == player.playerSprite.Standing.right) player.attack("right")
			  else if (player.currentSprite == player.playerSprite.Jumping.right) player.currentSprite = player.playerSprite.JumpingAttack.right
			  else if (player.currentSprite == player.playerSprite.Jumping.left) player.currentSprite = player.playerSprite.JumpingAttack.left
			  else if (player.currentSprite == player.playerSprite.Landing.right) player.currentSprite = player.playerSprite.LandingAttack.right
			  else if (player.currentSprite == player.playerSprite.Landing.left) player.currentSprite = player.playerSprite.LandingAttack.left
				
				playerAttackMusic.play()
				break;
			
		}
	})
	
	addEventListener('keyup', e=> {
		switch (e.code) {
			case 'KeyD':
				keys.right.pressed = false
				playerRunningSound.pause()
				break;
			case 'KeyA':
				keys.left.pressed = false
				playerRunningSound.pause()
				break;
		}
	})
	
	document.querySelector("#right-run-btn").addEventListener('touchstart',()=>{
		if (!keys.left.pressed){
			keys.right.pressed= true
			
			if (!player.inAir) player.currentSprite = player.playerSprite.Standing.right
			else if(player.currentSprite=== player.playerSprite.Jumping.left) player.currentSprite = player.playerSprite.Jumping.right
			else if(player.currentSprite=== player.playerSprite.Landing.left) player.currentSprite = player.playerSprite.Landing.right
			else if(player.currentSprite === player.playerSprite.JumpingAttack.left) player.currentSprite = player.playerSprite.JumpingAttack.right
			else if(player.currentSprite === player.playerSprite.Attacking.left) player.currentSprite = player.playerSprite.Attacking.right
		}
	})
	
	document.querySelector("#left-run-btn").addEventListener('touchstart',()=>{
		if (!keys.right.pressed){
			keys.left.pressed = true
			if (!player.inAir) player.currentSprite = player.playerSprite.Standing.left
			else if(player.currentSprite=== player.playerSprite.Jumping.right) player.currentSprite = player.playerSprite.Jumping.left
			else if(player.currentSprite=== player.playerSprite.Landing.right) player.currentSprite = player.playerSprite.Landing.left
			else if(player.currentSprite === player.playerSprite.JumpingAttack.right) player.currentSprite = player.playerSprite.JumpingAttack.left
			else if(player.currentSprite === player.playerSprite.Attacking.right) player.currentSprite = player.playerSprite.Attacking.left
		}
	})
	
	document.querySelector('#left-run-btn').addEventListener('touchend',()=>{
		keys.left.pressed = false
		
	})
	
	document.querySelector('#right-run-btn').addEventListener('touchend',()=>{
		keys.right.pressed = false
		
	})
	
	document.querySelector('#jump-btn').addEventListener('touchstart',()=>{
		if (!player.inAir){
			player.jump()
			jumpMusic.play()
		}
	})
	
	document.querySelector("#player-attack-btn").addEventListener('touchstart', ()=>{
		if (player.currentSprite == player.playerSprite.Standing.left )	player.attack("left")
		else if (player.currentSprite == player.playerSprite.Standing.right) player.attack("right")
		else if (player.currentSprite == player.playerSprite.Jumping.right) player.currentSprite = player.playerSprite.JumpingAttack.right
		else if (player.currentSprite == player.playerSprite.Jumping.left) player.currentSprite = player.playerSprite.JumpingAttack.left
	  else if (player.currentSprite == player.playerSprite.Landing.right) player.currentSprite = player.playerSprite.LandingAttack.right
	  else if (player.currentSprite == player.playerSprite.Landing.left) player.currentSprite = player.playerSprite.LandingAttack.left
		playerAttackMusic.play()
	})
	
	levelCreation()
	
	// Initializing variables
	
	backgroundDrawPositionX = 0
	backgroundDrawPositionMinusX = 0
	positiveOfset = 0
	negativeOfset = 0
	offSet = 0
	score = 0
	healthBar = new HealthBar(0,0,100,50)
	player = new Player(100, 120, 60, 40)
	
	scoreIntervalId = setInterval(()=>{
		score++
	}, 1000)
	
	animate()
}

function createImage(src) {
	let img = new Image()
	img.src = src
	return img
w}

function changeAnimation(obj, direction){
	if (obj.currentSprite != obj.enemySprint.Dying.right && obj.currentSprite != obj.enemySprint.Dying.left){
		if (direction == "left"){
			obj.currentSprite = obj.enemySprint.Walking.Left
			obj.velocity.x = -1
		}
		
		if (direction == "right"){
			obj.currentSprite = obj.enemySprint.Walking.Right
			obj.velocity.x = 1
		}
	}
}

function drawGrass(startX, endX, y, width,height, grassNumber){
	for (let i = 0; i<grassNumber; i++){
		grass.push(new Grass( generateRandom(startX, endX),y-height, width,height))
	}
}

function generateRandom(min, max) {
  let difference = max - min;
  let rand = Math.random();
  rand = Math.floor( rand * difference);
  rand = rand + min;
	return rand;
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
    console.log("dkjlk")
  }
  this.stop = function(){
    this.sound.pause();
  }
}

function levelCreation(){
	
	
	for (var i = 0; i <14; i++) floor.push(new Floor(25*i+0,canvas.height-25*3,25,25, floorImage))
	for (var i = 0; i <14; i++)	floor.push(new Floor(25*i+0,canvas.height-25*1,25,25, groundImage))
	for (var i = 0; i <14; i++) floor.push(new Floor(25*i+0,canvas.height-25*2,25,25, groundImage))
	
	for (var i = 0; i <10; i++) floor.push(new Floor(25*i+ 500,canvas.height-50,25,25, floorImage))
	for (var i = 0; i <10; i++) floor.push(new Floor(25*i+ 500,canvas.height-25,25,25, groundImage))
	
	for (let i = 0; i <5; i++) floor.push(new Floor(25*i+750,canvas.height-25*5,25,25, floorImage))
	for (let i = 0; i <5; i++) floor.push(new Floor(25*i+750,canvas.height-25*4,25,25, groundImage))
	for (let i = 0; i <5; i++) floor.push(new Floor(25*i+750,canvas.height-25*3,25,25, groundImage))
	for (let i = 0; i <5; i++) floor.push(new Floor(25*i+750,canvas.height-25*2,25,25, groundImage))
	for (let i = 0; i <5; i++) floor.push(new Floor(25*i+750,canvas.height-25*1,25,25, groundImage))
	
	for (let i = 0; i <8; i++) floor.push(new Floor(25*i+975,canvas.height-25*3,25,25, floorImage))
	for (let i = 0; i <8; i++) floor.push(new Floor(25*i+975,canvas.height-25*2,25,25, groundImage))
	for (let i = 0; i <8; i++) floor.push(new Floor(25*i+975,canvas.height-25*1,25,25, groundImage))
	
	for (let i = 0; i <15; i++) floor.push(new Floor(25*i+1400,canvas.height-25*4,25,25, floorImage)) 
	for (let i = 0; i <15; i++) floor.push(new Floor(25*i+1400,canvas.height-25*3,25,25, groundImage)) 
	for (let i = 0; i <15; i++) floor.push(new Floor(25*i+1400,canvas.height-25*2,25,25, groundImage)) 
	for (let i = 0; i <15; i++) floor.push(new Floor(25*i+1400,canvas.height-25*1,25,25, groundImage)) 
	for (let i = 0; i <5; i++)  floor.push(new Floor(25*i+1650,canvas.height-25*5,25,25, floorImage))
	for (let i = 0; i <3; i++)  floor.push(new Floor(25*i+1700,canvas.height-25*6,25,25, floorImage))
	
	for (let i = 0; i <12; i++)  floor.push(new Floor(25*i+2150,canvas.height-25*5,25,25, floorImage))
	for (let i = 0; i <12; i++)  floor.push(new Floor(25*i+2150,canvas.height-25*4,25,25, groundImage))
	for (let i = 0; i <12; i++)  floor.push(new Floor(25*i+2150,canvas.height-25*3,25,25, groundImage))
	for (let i = 0; i <12; i++)  floor.push(new Floor(25*i+2150,canvas.height-25*2,25,25, groundImage))
	for (let i = 0; i <12; i++)  floor.push(new Floor(25*i+2150,canvas.height-25*1,25,25, groundImage))
	
	for (let i = 0; i < 9; i++)  floor.push(new Floor(25*i+2625, canvas.height-25*2,25,25, floorImage))
	for (let i = 0; i < 9; i++)  floor.push(new Floor(25*i+2625, canvas.height-25*1,25,25, groundImage))
	
	for(let i = 0 ; i<15; i++)	trees.push(new tree(i*(canvas.height+Math.random()*50), 0))
	
	for (let i = 0; i <500;i++) floor.push(new Floor(25*i+0, canvas.height-25, 25,25,waterImage))
	
	drawGrass(0,325, canvas.height-75, 25,15,8)
	drawGrass(500, 725,canvas.height-50, 25,15,5)
	drawGrass(750, 850,canvas.height-25*5, 25,15,5)
	drawGrass(975, 1150,canvas.height-25*3, 25,15,5)
	drawGrass(1400, 1750, canvas.height-25*4, 25,15,9)
	drawGrass(1650, 1750, canvas.height-25*5, 25,15,4)
	drawGrass(2150, 2425, canvas.height-25*5, 25,15,10)
	drawGrass(2625, 2825, canvas.height-25*2, 25,15,6)
	
	enemies.push(new Enemy(525,canvas.height-50-40, 50, 40, 525, 725))
	enemies.push(new Enemy(975,canvas.height-25*3-40, 50, 40, 975, 1150, "Left"))
	enemies.push(new Enemy(1500,canvas.height-25*4-40, 50, 40, 1400, 1750))
	enemies.push(new Enemy(2300,canvas.height-25*5-40, 50, 40, 2150, 2425, "Left"))
	enemies.push(new Enemy(2300,canvas.height-25*5-40, 50, 40, 2150, 2425))
	
	background.push(new Background(0,0, canvas.height, canvas.height), new Background(canvas.height, 0, canvas.height, canvas.height), new Background(canvas.height*2, 0, canvas.height,canvas.height))
	
}

function startGame(){
	enemies = []
	enemyBullet = []
	floor = []
	grass = []
	trees = []
	player = null
	background = []	
	document.querySelector("#right-run-btn").style.display = 'inline'
	document.querySelector("#left-run-btn").style.display = 'inline'
	document.querySelector("#jump-btn").style.display = 'inline'
	document.querySelector("#player-attack-btn").style.display = 'inline'
	document.querySelector(".Score-display").style.display = 'block'
	
	backgroundMusic.play()
	init()
	

}

function gameOver(){
	document.querySelector('#start-last-record').textContent = score
	document.querySelector('#win-last-record').textContent = score
	document.querySelector('#game-over-last-record').textContent = score
	
	clearInterval(scoreIntervalId)
}

//creating Classes
class Graphics {
	constructor(x, y, width, height) {
		this.position = {
			x: x,
			y: y
		}
		this.width = width
		this.height = height
	}
}

class Player extends Graphics {
	constructor(x, y, width, height) {
		super(x, y, width, height)
		this.playerSprite = {
			Standing: {
				right: {
					image: createImage('./img/playerStandingRight.png'),
					frame: 18,
					frameSpeed: 1,
					width: 200,
					height: 85,
					startY:0
				},
				left: {
					image: createImage('./img/playerStandingLeft.png'),
					frame: 18,
					frameSpeed: 1,
					width: 200,
					height: 85,
					startY: 0
				}
			},
			Attacking: {
				right: {
					image: createImage('./img/PlayerAttackingRight.png'),
					frame: 8,
					frameSpeed: .6,
					width: 420,
					height: 255,
					startY: 0
				},
				left: {
					image: createImage('./img/PlayerAttackLeft.png'),
					frame: 8,
					frameSpeed: .6,
					width: 420,
					height: 255,
					startY: 0
				}
			},
			JumpingAttack: {
				right: {
					image: playerJumpAttackImage,
					frame: 8,
					frameSpeed: .6,
					width: 420,
					height: 267,
					startY: 0
				},
				left: {
					image: playerJumpAttackImage,
					frame: 8,
					frameSpeed: .6,
					width: 420,
					height: 267,
					startY: 267
				}
			},
			LandingAttack: {
				right: {
					image: playerLandAttackImage,
					frame: 8,
					frameSpeed: .6,
					width: 420,
					height: 267,
					startY: 0
				},
				left: {
					image: playerLandAttackImage,
					frame: 8,
					frameSpeed: .6,
					width: 420,
					height: 267,
					startY: 267
				}
			},
			Jumping: {
				right: {
					image: playerJumpImage,
					frame: 0,
					frameSpeed: 0,
					width: 280,
					height: 178,
					startY: 0
				},
				left: {
					image: playerJumpImage,
					frame: 0,
					frameSpeed: 0,
					width: 280,
					height: 178,
					startY: 178
				}
			},
			Landing:{
				right: {
					image: playerJumpImage,
					frame: 0,
					frameSpeed : 0,
					width: 280,
					height: 178,
					startY: 356
				},
				left: {
					image: playerJumpImage,
					frame: 0,
					frameSpeed : 0,
					width: 280,
					height: 178,
					startY: 534
				}
			},
			Death:{
				right: {
					image: createImage("./img/PlayerDying.png"),
					frame: 0,
					frameSpeed : 0,
					width: 280,
					height: 178,
					startY: 0
				},
				left: {
					image: createImage('./img/PlayerDying.png'),
					frame: 0,
					frameSpeed : 0,
					width: 280,
					height: 178,
					startY: 0
				}
			}
		}
		this.currentSprite = this.playerSprite.Landing.right
		this.speed = 0.05
		this.SpriteFrame = 0
		this.velocity = {
			x: 0,
			y: 0
		}
		this.inAir = true
		this.shouldAttack = false
	}
	draw() {
		// c.fillStyle = "black"
		// c.fillRect(this.position.x, this.position.y, this.width, this.height)
		c.drawImage(this.currentSprite.image,
			this.currentSprite.width*Math.floor(this.SpriteFrame),
			this.currentSprite.startY,
			this.currentSprite.width,
			this.currentSprite.height,
			this.position.x,
			this.position.y,
			this.width,
			this.height
		)
		this.gravity = 0.1
	}	
	update() {
		this.draw()
		let addGraity= true
		console.log(this.velocity.y)
		
		// if (this.velocity.y<0 && this.currentSprite == this.playerSprite.Standing.left){
		// 	this.currentSprite = this.playerSprite.Jumping.left
		// } else if (this.velocity.y==0){
		// 	this.currentSprite = this.playerSprite.Standing.left
		// }
		
		
		if (this.SpriteFrame >= this.currentSprite.frame){
			this.SpriteFrame = 0
		} else this.SpriteFrame+=this.currentSprite.frameSpeed
		
		floor.forEach(elem=>{
			if ((this.position.y+this.velocity.y+this.height>=elem.position.y 
			&& this.position.x+this.width*.5<=elem.position.x+elem.width
			&& this.position.x+this.width*.5+this.velocity.x>= elem.position.x
			&& this.position.y+this.height+1<=elem.position.y+2
			&& elem.image == floorImage)
			||this.position.y+this.velocity.y+this.height-2>=canvas.height) {
				this.velocity.y=0
				this.inAir = false
				addGraity = false
			}
		})
		
		if (addGraity){
			this.inAir = true
			this.velocity.y += this.gravity
		}
		
		if (this.velocity.y>0 && this.velocity.y<.01 && (this.currentSprite===this.playerSprite.Jumping.right || this.currentSprite===this.playerSprite.Standing.right)) this.currentSprite = this.playerSprite.Landing.right
		else if(this.velocity.y>0 && this.velocity.y<.01  && (this.currentSprite===this.playerSprite.Jumping.left || this.currentSprite===this.playerSprite.Standing.left)) this.currentSprite = this.playerSprite.Landing.left
		
		if (this.currentSprite == this.playerSprite.Landing.right){
			if (this.velocity.y == 0 ){
				this.currentSprite = this.playerSprite.Standing.right
			}
		} else if (this.currentSprite == this.playerSprite.Landing.left){
			if(this.velocity.y == 0){
				this.currentSprite = this.playerSprite.Standing.left
			}
		}
		
		if(this.currentSprite==this.playerSprite.Jumping.right && this.velocity.y == 0) this.currentSprite = this.playerSprite.Standing.right
		if(this.currentSprite==this.playerSprite.Jumping.left && this.velocity.y == 0) this.currentSprite = this.playerSprite.Standing.left
		
		if (this.shouldAttack){
			if (this.currentSprite == this.playerSprite.Standing.right)	this.currentSprite = this.playerSprite.Attacking.right
			if (this.currentSprite == this.playerSprite.Standing.left) this.currentSprite = this.playerSprite.Attacking.left
			
		}
		
		if (this.currentSprite.frame == 8 && this.SpriteFrame >= 8){
			if (this.currentSprite == this.playerSprite.Attacking.right)this.currentSprite = this.playerSprite.Standing.right
			if (this.currentSprite == this.playerSprite.Attacking.left)	this.currentSprite = this.playerSprite.Standing.left
			if (this.currentSprite == this.playerSprite.JumpingAttack.right)this.currentSprite = this.playerSprite.Jumping.right
			if (this.currentSprite == this.playerSprite.JumpingAttack.left) this.currentSprite = this.playerSprite.Jumping.left
			if (this.currentSprite == this.playerSprite.LandingAttack.right) this.currentSprite = this.playerSprite.Landing.right
			if (this.currentSprite == this.playerSprite.LandingAttack.left) this.currentSprite = this.playerSprite.Landing.left
			this.shouldAttack = false
		}
		
		this.position.x+=this.velocity.x
		this.position.y+=this.velocity.y
		
	}
	
	attack(attackDirection){
		if (attackDirection==="right"){
			this.currentSprite = this.playerSprite.Attacking.right
		}
		
		if (attackDirection ==="left"){
			this.currentSprite = this.playerSprite.Attacking.left
		}
		
		this.shouldAttack = true
	}
	
	jump(jumpDirection){
		this.velocity.y -= playerJumpPower
		if (this.currentSprite === this.playerSprite.Standing.right ||this.currentSprite === this.playerSprite.Landing.right){
			this.currentSprite = this.playerSprite.Jumping.right
		}
		if (this.currentSprite === this.playerSprite.Standing.left || this.currentSprite === this.playerSprite.Landing.right){
			this.currentSprite = this.playerSprite.Jumping.left
		}
	}
}

class Floor extends Graphics{
	constructor(x,y,width,height, image){
		super(x,y,width,height)
		this.image = image
	}
	draw(){
		c.drawImage(this.image, this.position.x,this.position.y, this.width,this.height)
	}
	update(){
		this.draw()
	}
}

class Enemy extends Graphics{
	constructor(x,y,width,height, platformStart, platformEnd, enemyStart = "Right"){
		super(x,y,width,height)
		
		this.platformStart = platformStart
		this.platformEnd = platformEnd
		
		this.enemySprint = {
			Walking: {
				Right: {
					image: createImage('./img/enemyWalkingRight.png'),
					frame: 9,
					frameSpeed : .25,
					width: 330,
					height: 270,
					startY: 0
				},
				
				Left: {
					image: createImage('./img/enemyWalkingLeft.png'),
					frame: 9,
					frameSpeed :.25,
					width: 330,
					height: 270,
					startY: 0
				}
			},
			Attacking : {
				Right: {
					image: createImage('./img/EnemyAttack.png'),
					frame: 4,
					frameSpeed : .25,
					width: 330,
					height: 270,
					startY: 0
				},
				
				Left: {
					image: createImage('./img/EnemyAttack.png'),
					frame: 4,
					frameSpeed :.25,
					width: 330,
					height: 270,
					startY: 270
				}
			},
			Dying :{
				right:{
					image: createImage('./img/EnemyDying.png'),
					frame: 0,
					frameSpeed : 0,
					width: 330,
					height: 270,
					startY: 0
				},
				left: {
					image: createImage('./img/EnemyDying.png'),
					frame: 0,
					frameSpeed :.25,
					width: 330,
					height: 270,
					startY: 270
				}
			}
		}
		this.SpriteFrame = 0
		this.currentSprite = this.enemySprint.Walking[enemyStart]
		this.velocity = {
			x: enemyStart==="Right"? 1 : -1,
			y: .5
		}
		this.alpha = 1
		this.isAlive = true
		this.bulletFireLeft;
		this.bulletFireRight;
	}
	draw(){
		c.globalAlpha = this.alpha
		c.drawImage(this.currentSprite.image,
		this.currentSprite.width * Math.floor(this.SpriteFrame),
		this.currentSprite.startY,
		this.currentSprite.width,
		this.currentSprite.height,
		this.position.x,
		this.position.y,
		this.width,
		this.height
		)
		c.globalAlpha =1
	}
	
	update(){
		this.draw()
		
		if (this.SpriteFrame>=this.currentSprite.frame){
			this.SpriteFrame = 0
		} else	this.SpriteFrame += this.currentSprite.frameSpeed
	
		if (this.position.x + this.width*.5 >= this.platformEnd ){
			this.velocity.x *= -1
			if (this.SpriteFrame<this.currentSprite.frame) this.SpriteFrame++
			
			this.currentSprite = this.enemySprint.Walking.Left
			
		}
		
		if (this.position.x + this.width*.5<= this.platformStart){
			this.velocity.x *= -1
			if (this.SpriteFrame<this.currentSprite.frame) this.SpriteFrame++
			this.currentSprite =this.enemySprint.Walking.Right
		}
		
		this.position.x += this.velocity.x
	}
	
	attack(attackDirection){
		if (attackDirection == "left"){
			this.currentSprite = this.enemySprint.Attacking.Left
			setTimeout(changeAnimation, 1000, this, 'left')
			setTimeout(()=>{
				if (this.currentSprite != this.enemySprint.Dying.right && this.currentSprite != this.enemySprint.Dying.left){
					enemyBullet.push(new Bullet(this.position.x+this.width*.5, this.position.y+this.height*.3,5, 'left'))
					enemyFireSound.play()
				}
			}, 1000);
			
		} else if (attackDirection == 'right'){
			this.currentSprite = this.enemySprint.Attacking.Right
			setTimeout(changeAnimation, 1000, this, 'right')
			setTimeout(()=>{
				if (this.currentSprite != this.enemySprint.Dying.right && this.currentSprite != this.enemySprint.Dying.left){
					enemyBullet.push(new Bullet(this.position.x+this.width*.5, this.position.y+this.height*.3,5, 'right'))
					enemyFireSound.play()
				}	
				
			}, 1000);
		}
		
		this.velocity.x = 0
	}
}

class Bullet{
	constructor(x,y,radius, playerX){
		this.position = {
			x : x,
			y : y
		}
		this.velocity = {
			x : 10,
			y: 0
		}
		this.radius = radius
		if (playerX == 'left'){
			this.velocity.x *= -1
		}
		this.image = bulletImage
	}
	draw(){
	  c.drawImage(this.image, this.position.x, this.position.y, this.radius*2, this.radius*2)
	}
	update(){
		this.draw()
	}
}

class Grass{
	constructor(x,y,width,height){
		this.position = {
			x: x,
			y: y
		}
		this.animate = 0
		if (Math.random()>0.5) this.animate = 20
		else if (Math.random()<=0.5) this.animate = 0
		this.SpriteFrame = 0
		this.width = width
		this.height = height
		this.image = grassImage
	}
	
	draw(){
		c.drawImage(this.image, 
		32*Math.floor(this.SpriteFrame),this.animate,
		32,20,
		this.position.x,
		this.position.y,
		this.width,
		this.height)
	}
	update(){
		this.draw()
		if (this.SpriteFrame >= 2 ){
			this.SpriteFrame = 0
		} else this.SpriteFrame += .1
	}
}

class Background{
	constructor(x,y,width,height){
		this.position = {
			x:x,
			y:y
		}
		this.width = width
		this.height = height
		this.image = backgroundImage
	}
	draw(){
		bgc.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
	}
}

class tree {
	constructor(x,y){
		this.position = {
			x:x,
			y:y
		}
		if (Math.random()< .5)this.treesNumber = 0
		else this.treesNumber = 100
		this.spriteFrame = 0
	}
	draw(){
		bgc.drawImage(treeImage,
		120*Math.floor(this.spriteFrame),this.treesNumber,120,100,
		this.position.x ,this.position.y, backgroundCanvas.height, backgroundCanvas.height)
		
		if(this.spriteFrame>1.9){
			this.spriteFrame = 0
		} else this.spriteFrame += 0.01
	}
}

class AddGround{
	constructor(starting, ending){
		this.starting = starting
		this.ending = ending
		this.width = 25
		this.height = 25
		this.image = groundImage
	}
	draw(){
		for(let j=0; j<=Math.ceil((this.ending.y-this.starting.y)/this.height); j++){
			for (let i=0; i<(Math.floor((this.ending.x+this.width) - this.starting.x)/25); i++){
				c.drawImage(this.image , this.starting.x+25*i, this.starting.y+25*j, this.width, this.height)
			}
		}
		
	}
}

class HealthBar{
	constructor(x,y,width,height){
		this.position = {
			x:x,
			y:y
		}
		this.width = width
		this.height = height
		this.sprite = {
			AtFull: {
				position: 0
			},
			AtThird: {
				position: width
			},
			AtSecond : {
				position: width*2
			},
			AtEmpty: {
				position: width*3
			}
		}
		this.currentSprite = this.sprite.AtFull
	}
	draw(){
		bgc.drawImage(healthBarImage,
		this.currentSprite.position,0,this.width,this.height,
		this.position.x ,this.position.y,this.width,this.height)
	}
}

document.querySelector("#game-over-menu").addEventListener('click', ()=>{
	document.querySelector("#game-over-menu").style.display = "none"
	playerJumpPower/=2
	startGame()
})

document.querySelector("#game-start-menu").addEventListener('click', ()=>{
	document.querySelector("#game-start-menu").style.display = "none"
	startGame()
	
})

document.querySelector("#game-win-menu").addEventListener('click', ()=>{
	document.querySelector("#game-win-menu").style.display = "none"
	playerJumpPower /= 2
	startGame()
})


