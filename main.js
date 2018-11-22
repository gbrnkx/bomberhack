//canvas
var canvas = document.getElementById('canvas')
var canvas_p1 = document.getElementById('marcador_player1')
var canvas_p2 = document.getElementById('marcador_player2')
var ctx_p1 = canvas_p1.getContext('2d')
var ctx_p2 = canvas_p2.getContext('2d')
var ctx = canvas.getContext('2d')

var bomberMusic = new Audio("images/music.mp3")


var gameWelcome = true
var hasWinner = false
var winner = 0
var lifes_p1 = 3
var lifes_p2 = 3

var imgBgMarkerP1 = new Image()
imgBgMarkerP1.src = "images/marker_player_1.jpg"
var imgBgMarkerP2 = new Image()
imgBgMarkerP2.src = "images/marker_player_2.jpg"
var imgInicio = new Image()
imgInicio.src = "images/bomberhack_inicio.jpg"
var imgWinnerPlayer1 = new Image()
imgWinnerPlayer1.src = "images/player1_winner.jpg"
var imgWinnerPlayer2 = new Image()
imgWinnerPlayer2.src = "images/player2_winner.jpg"

var imgLife = new Image()
imgLife.src = "images/life.png"

//ctx.drawImage(this.image,this.x,this.y,this.width,this.height)


//variables
var interval
var frames = 0
var arrBombas = []

var characters = {
  player1:"images/player1.png",
  player2:"images/player2.png" //cambiar jugador
}

var images = {
  bg: "images/fondo_bomberman.jpg"
}

var bombs = {
  normal:"images/bomb_normal_0.png",
  stronger:"images/bomb_stronger_0.png"
}

var powerUps = [{
  name:"normal",
  image:"images/nothing.png", //Pondremos una secuencia de imágenes dentro de un arreglo par recrear el movimiento
  bombsAllowed:1
},
  {
  name:"moreBombs",
  image:"images/2x_powerUp.png", //Pondremos una secuencia de imágenes dentro de un arreglo par recrear el movimiento
  bombsAllowed:2
},
{
  name:"strongerExplosion",
  image:"images/stronger_powerUp.png", //Pondremos una secuencia de imágenes dentro de un arreglo par recrear el movimiento
  bombRange:2
},
{
  name:"faster",
  bombermanVelocity:2,
  image:"images/faster_powerUp.png"
}]

var objBoxes_onfire = [{
  name:"nothing",
  level:0,
  image:"images/nothing_explosion.png"
},{
  name:"glass",
  level:1,
  image:"images/glass_explosion.png",
},
{
  name:"sand",
  level:2,
  image:"images/sand_explosion.png"
},
{
  name:"stone",
  level:3,
  image:"images/stone_explosion.png"
}]

var objBoxes = [{
  name:"nothing",
  level:0,
  image:"images/nothing.png"
},{
  name:"glass",
  level:1,
  image:"images/glass.png",
},
{
  name:"sand",
  level:2,
  image:"images/sand.png"
},
{
  name:"stone",
  level:3,
  image:"images/stone.png"
}]

function box(rdm_level, rdm_powerUp, box_position, limits){
  this.limitsBox = limits
  this.position = box_position
  this.level = rdm_level ? rdm_level : 0
  this.powerUp = rdm_powerUp
  this.image = new Image()
  this.image.src = objBoxes[rdm_level].image
  this.hasBomb = false
  this.hasPlayer_1 = false
  this.hasPlayer_2 = false

  this.explode = (stronger) =>{
    //console.log("Player 1 presente: "+ this.hasPlayer_1)
    //console.log("Player 2 presente: "+ this.hasPlayer_2)
    this.image.src = objBoxes_onfire[this.level].image
    if(this.hasPlayer_1 === true && this.hasPlayer_2 === true){
      getCaughtByExplosion(1)
      getCaughtByExplosion(2)
      lifes_p1--
      lifes_p2--
    }else if(this.hasPlayer_1 === true && this.hasPlayer_2 === false){
      getCaughtByExplosion(1)
      lifes_p1--
    }else if(this.hasPlayer_1 === false && this.hasPlayer_2 === true){
      getCaughtByExplosion(2)
      lifes_p2--
    }
    setTimeout(()=>{
      if(this.level === 0){
      this.image.src = objBoxes[this.level].image
      } else{

        if(this.level < 2){
          this.level--
        }

        if(this.level >= 2){
          if(stronger){
            this.level -=2
          } else{
            this.level--
          }
          
        }

        if(this.powerUp > 0 && this.level === 0){
        this.image.src = powerUps[this.powerUp].image
        } else{
        this.image.src = objBoxes[this.level].image
        }
      }    
    }, 200)


}
}

function dashboard(){
  this.x = 0
  this.y = 0
  this.filas = 8
  this.columnas = 12
  this.width = canvas.width
  this.height = canvas.height
  this.boxes = []
  this.image = new Image()
  this.image.src = images.bg

  this.draw = () =>{
    ctx.drawImage(this.image,this.x,this.y,this.width,this.height)
  }

  this.createBoxMatrix = () =>{
    var rdm_matrix = []
    for (var i=0;i<this.filas;i++){
      var rdm_array = []
      for(var j=0;j<this.columnas;j++){
          var level = Math.floor(Math.random()*4)
          var rdm_pu = Math.floor(Math.random()*4)
          if (rdm_pu>3 || level === 0){rdm_pu = 0}
         //if (level===0){level++}
          var rdm_box = new box(level, rdm_pu, [i,j],{limBox_up:i*80,limBox_down:(i+1)*80,limBox_left:j*80,limBox_right:(j+1)*80})
          //agregamos la box al arreglo de la fila
          rdm_array[j] = rdm_box
      }
      //agregamos la fila recién creada a la matriz
      rdm_matrix[i] = rdm_array
    }
    //Define las casillas de inicio como nivel 0 y sin powerUps
    rdm_matrix[0][0]= new box(0,0,[0,0],{limBox_up:0,limBox_down:80,limBox_left:0,limBox_right:80})
    rdm_matrix[0][1]= new box(0,0,[0,1],{limBox_up:0,limBox_down:80,limBox_left:80,limBox_right:160})
    rdm_matrix[1][0]= new box(0,0,[1,0],{limBox_up:80,limBox_down:160,limBox_left:0,limBox_right:80})
    rdm_matrix[6][11]= new box(0,0,[6,11],{limBox_up:480,limBox_down:560,limBox_left:880,limBox_right:960})
    rdm_matrix[7][10]= new box(0,0,[7,10],{limBox_up:560,limBox_down:640,limBox_left:800,limBox_right:880})
    rdm_matrix[7][11]= new box(0,0,[7,11],{limBox_up:560,limBox_down:640,limBox_left:880,limBox_right:960})
  //console.log(rdm_matrix)
  this.boxes = rdm_matrix
  }

  this.drawBoxMatrix = () =>{
    var next_fil = 0
    var next_col = 0
    for (var i=0;i<8;i++){
      for(var j=0;j<12;j++){
        //console.log("i= "+i+" j="+j)
        ctx.drawImage(this.boxes[i][j].image,next_fil,next_col,80,80)
        next_fil+=80
      }
      next_fil = 0
      next_col+=80
    }
  }

  this.drawInicio = ()=>{
    ctx.drawImage(imgInicio,0,0,960,640)
  }

  this.drawWinnerP1 = ()=>{
    ctx.drawImage(imgWinnerPlayer1,0,0,960,640)
    
  }

  this.drawWinnerP2 = ()=>{
    ctx.drawImage(imgWinnerPlayer2,0,0,960,640)
    
  }

  this.drawMarker=()=>{

    if(lifes_p1 === 3){
      ctx_p1.drawImage(imgLife,25,320,45,45)
      ctx_p1.drawImage(imgLife,25,380,45,45)
      ctx_p1.drawImage(imgLife,25,440,45,45)
    } else if(lifes_p1 == 2){
      ctx_p1.drawImage(imgLife,25,380,45,45)
      ctx_p1.drawImage(imgLife,25,440,45,45)
    } else if(lifes_p1 ===1){
      ctx_p1.drawImage(imgLife,25,440,45,45)
    }else{
      
    }

    if(lifes_p2 === 3){
      ctx_p2.drawImage(imgLife,25,320,45,45)
      ctx_p2.drawImage(imgLife,25,380,45,45)
      ctx_p2.drawImage(imgLife,25,440,45,45)
    } else if(lifes_p2 == 2){
      ctx_p2.drawImage(imgLife,25,380,45,45)
      ctx_p2.drawImage(imgLife,25,440,45,45)
    } else if(lifes_p2 ===1){
      ctx_p2.drawImage(imgLife,25,440,45,45)
    }else{

    }

  }
}

function bomb(pos,bombMorePower){
  var boxesToExplode = findAdjacent(pos)
  this.boomBox = dashb.boxes[pos.y][pos.x]
  this.range = 1
  this.image = new Image()
  if (bombMorePower){
    this.image.src = bombs.stronger
    this.strongerBomb = true
  } else {
    this.image.src = bombs.normal
    this.strongerBomb = false
  }
  
  this.boom = () =>{
    if(boxesToExplode.up != false && boxesToExplode.up.hasBomb != true){
      boxesToExplode.up.explode(this.strongerBomb)
    }
    if(boxesToExplode.down != false && boxesToExplode.down.hasBomb != true){
      boxesToExplode.down.explode(this.strongerBomb)
    }
    if(boxesToExplode.left != false && boxesToExplode.left.hasBomb != true){
      boxesToExplode.left.explode(this.strongerBomb)
    }
    if(boxesToExplode.right != false && boxesToExplode.right.hasBomb != true){
      boxesToExplode.right.explode(this.strongerBomb)
    }
    this.boomBox.hasBomb = false
    this.boomBox.image.src = objBoxes[0].image
  }

  this.draw = () =>{
    if(bombMorePower === true){
      dashb.boxes[pos.y][pos.x].image.src = bombs.stronger
    }else{
      dashb.boxes[pos.y][pos.x].image.src = bombs.normal
    }
  }
}

function bomberman(playerNum){

  this.width = 47
  this.height = 47
  this.playerNum  = playerNum ? playerNum : 1
  this.actualPos = {}
  //this.pastPosition = {x:0,y:0}
  this.lives = 2
  this.stillAlive = true
  this.bombMorePower = false
  this.bombsAllowed = 1
  this.velocity = 1.5
  this.image = new Image()
  this.image.src = characters.player1_alive

  if(this.playerNum === 1){
    this.pastPosition = {x:0,y:0}
    this.x = 20
    this.y = 20
    this.image.src = characters.player1
  } else if(this.playerNum === 2){
    this.pastPosition = {x:11,y:7}
    this.x = 895
    this.y = 580
    this.image.src = characters.player2
  }

  this.getActualBoxPosition = () =>{
    var x_center = this.x+(this.width/2)
    var y_center = this.y+(this.height/2)
    this.center = {x:x_center,y:y_center}

    for (var col=0;col<12;col++){
      for(var fil=0;fil<8;fil++){
        var lim_right = (col+1)*80 
        var lim_left = col*80
        var lim_up = fil*80
        var lim_down = (fil+1)*80
          if(lim_left<x_center&&x_center<lim_right
            && lim_down>y_center&&y_center>lim_up){
            this.actualPos = {
              x:col,
              y:fil
            }
            return this.actualPos
          }
        }
      }
  }

  this.draw = () =>{
    ctx.drawImage(this.image,this.x,this.y,this.width,this.height)
  }

  this.moveUp = (pos) =>{
    var adjacentsBoxes = findAdjacent(pos)
    var actualBox = dashb.boxes[pos.y][pos.x]
    var boxPowerUp = actualBox.powerUp

    if(boxPowerUp != 0 && actualBox.level === 0 && actualBox.hasBomb === false){
      switch(boxPowerUp) {
        case 1:
            this.bombsAllowed++
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 2:
            this.bombMorePower = true
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 3:
            if(this.velocity <= 2){
              this.velocity+=0.13
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }

    if (this.y > actualBox.limitsBox.limBox_up){
      this.y -=3*this.velocity
    } else if(adjacentsBoxes.up != false && adjacentsBoxes.up.level === 0 && adjacentsBoxes.up.hasBomb === false){
      this.y -=3*this.velocity
    }

  }
  this.moveDown = (pos) =>{
    var adjacentsBoxes = findAdjacent(pos)
    var actualBox = dashb.boxes[pos.y][pos.x]
    var boxPowerUp = actualBox.powerUp

    if(boxPowerUp != 0 && actualBox.level === 0 && actualBox.hasBomb === false){
      switch(boxPowerUp) {
        case 1:
            this.bombsAllowed++
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 2:
            this.bombMorePower = true
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 3:
            if(this.velocity <= 2){
              this.velocity+=0.13
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }
    if(this.y+this.height < actualBox.limitsBox.limBox_down){
      this.y +=3*this.velocity
    } else if(adjacentsBoxes.down != false && adjacentsBoxes.down.level === 0 && adjacentsBoxes.down.hasBomb === false){
      this.y +=3*this.velocity
    }  
  }

  this.moveLeft = (pos) =>{
    var adjacentsBoxes = findAdjacent(pos)
    var actualBox = dashb.boxes[pos.y][pos.x]
    var boxPowerUp = actualBox.powerUp

    if(boxPowerUp != 0 && actualBox.level === 0 && actualBox.hasBomb === false){
      switch(boxPowerUp) {
        case 1:
            this.bombsAllowed++
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 2:
            this.bombMorePower = true
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 3:
            if(this.velocity <= 2){
            this.velocity+=0.13
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }
    if(this.x > actualBox.limitsBox.limBox_left){
      this.x -=3*this.velocity
    } else if(adjacentsBoxes.left != false && adjacentsBoxes.left.level === 0 && adjacentsBoxes.left.hasBomb === false){
      this.x -=3*this.velocity
    }
  }

  this.moveRight = (pos) =>{
    var adjacentsBoxes = findAdjacent(pos)
    var actualBox = dashb.boxes[pos.y][pos.x]
    var boxPowerUp = actualBox.powerUp

    if(boxPowerUp != 0 && actualBox.level === 0 && actualBox.hasBomb === false){
      switch(boxPowerUp) {
        case 1:
            this.bombsAllowed++
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 2:
            this.bombMorePower = true
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        case 3:
            if(this.velocity <= 2){
              this.velocity+=0.13
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }
    if(this.x+this.width < actualBox.limitsBox.limBox_right){
      this.x +=3*this.velocity
    } else if(adjacentsBoxes.right != false && adjacentsBoxes.right.level === 0 && adjacentsBoxes.right.hasBomb === false){
      this.x +=3*this.velocity
    }
  }
}

function findAdjacent(pos){
  var x = pos.x
  var y = pos.y
  var objAdjacents = {right:false,down:false,left:false,up:false}

  if(x === 0 && y === 0){
    objAdjacents.right = dashb.boxes[y][x+1]
    objAdjacents.down = dashb.boxes[y+1][x]
    return objAdjacents
  } else if(x === 11 && y === 0){
    objAdjacents.down = dashb.boxes[y+1][x]
    objAdjacents.left = dashb.boxes[y][x-1]
    return objAdjacents
  } else if(x === 11  && y === 7){
    objAdjacents.left = dashb.boxes[y][x-1]
    objAdjacents.up = dashb.boxes[y-1][x]
    return objAdjacents
  } else if(x === 0 && y === 7){
    objAdjacents.right = dashb.boxes[y][x+1]
    objAdjacents.up = dashb.boxes[y-1][x]
    return objAdjacents
  } else if(x === 0){
    objAdjacents.right = dashb.boxes[y][x+1]
    objAdjacents.down = dashb.boxes[y+1][x]
    objAdjacents.up = dashb.boxes[y-1][x]
    return objAdjacents
  } else if (y === 0){
    objAdjacents.right = dashb.boxes[y][x+1]
    objAdjacents.down = dashb.boxes[y+1][x]
    objAdjacents.left = dashb.boxes[y][x-1]
    return objAdjacents
  } else if(y === 7){
    objAdjacents.right = dashb.boxes[y][x+1]
    objAdjacents.left = dashb.boxes[y][x-1]
    objAdjacents.up = dashb.boxes[y-1][x]
    return objAdjacents
  } else if(x === 11){
    objAdjacents.down = dashb.boxes[y+1][x]
    objAdjacents.left = dashb.boxes[y][x-1]
    objAdjacents.up = dashb.boxes[y-1][x]
    return objAdjacents
  } else {
    objAdjacents.right = dashb.boxes[y][x+1]
    objAdjacents.down = dashb.boxes[y+1][x]
    objAdjacents.left = dashb.boxes[y][x-1]
    objAdjacents.up = dashb.boxes[y-1][x]
    return objAdjacents
  }
}

var dashb = new dashboard()
var player_1 = new bomberman(1)
var player_2 = new bomberman(2)

dashb.createBoxMatrix()

function getCaughtByExplosion(playerNumber){
  if (playerNumber === 1){
    if(player_1.lives>0){
      player_1.lives--
    }else{
      player_1.stillAlive = false
      hasWinner = true
      winner =2
      //player_1.image.src = characters.player1_dead
    }
  } else if(playerNumber === 2){
    if(player_2.lives>0){
      player_2.lives--
    }else{
      player_2.stillAlive = false
      hasWinner = true
      winner = 1
      
      //player_2.image.src = characters.player2_dead
    }
  }
}

function updatePastPosition(){
  var actualPlayer_1_Pos = player_1.getActualBoxPosition()
  var boxWithPlayer_1 = dashb.boxes[actualPlayer_1_Pos.y][actualPlayer_1_Pos.x]
  var actualPlayer_2_Pos = player_2.getActualBoxPosition()
  var boxWithPlayer_2 = dashb.boxes[actualPlayer_2_Pos.y][actualPlayer_2_Pos.x]

  boxWithPlayer_1.hasPlayer_1 = true
  boxWithPlayer_2.hasPlayer_2 = true
  
  if(player_1.pastPosition.x != actualPlayer_1_Pos.x || player_1.pastPosition.y != actualPlayer_1_Pos.y ){
    dashb.boxes[player_1.pastPosition.y][player_1.pastPosition.x].hasPlayer_1 = false
    player_1.pastPosition.x = actualPlayer_1_Pos.x
    player_1.pastPosition.y = actualPlayer_1_Pos.y
  }
  
  if(player_2.pastPosition.x != actualPlayer_2_Pos.x || player_2.pastPosition.y != actualPlayer_2_Pos.y ){
    dashb.boxes[player_2.pastPosition.y][player_2.pastPosition.x].hasPlayer_2 = false
    player_2.pastPosition.x = actualPlayer_2_Pos.x
    player_2.pastPosition.y = actualPlayer_2_Pos.y
  }

}

function setBomb(player){
  var bombPosition = player.getActualBoxPosition()
  var bomba_ready = new bomb(bombPosition, player.bombMorePower)
  if(player.bombsAllowed > 0 && dashb.boxes[bombPosition.y][bombPosition.x].hasBomb === false){
    bomba_ready.draw()
    player.bombsAllowed--
    dashb.boxes[bombPosition.y][bombPosition.x].hasBomb = true
    setTimeout(()=>{ 
      bomba_ready.boom()
      player.bombsAllowed++
      }, 3500);
  }
}

function start(){
  
  

  //Cada 30 milisegundos se llamará a la función update() 1000/25=40
  //Esto es 40 veces por segundo

  if(!interval) interval = setInterval(update,40) 
}

function update(){

  if (gameWelcome === false && hasWinner === false){
    var pos_p2 = player_2.getActualBoxPosition()
    var pos_p1 = player_1.getActualBoxPosition()
    ctx_p1.drawImage(imgBgMarkerP1,0,0,100,640)
    ctx_p2.drawImage(imgBgMarkerP2,0,0,100,640)
    updatePastPosition()
    frames++
    ctx.clearRect(0,0,canvas.width, canvas.height)
    dashb.draw()
    dashb.drawMarker()
    dashb.drawBoxMatrix()
    player_1.draw()
    player_2.draw()

//Inicio de prueba
    if(mov_player2.up){
      player_2.moveUp(pos_p2)
    }
    if(mov_player2.down){
      player_2.moveDown(pos_p2)
    }
    if(mov_player2.left){
      player_2.moveLeft(pos_p2)
    }
    if(mov_player2.right){
      player_2.moveRight(pos_p2)
    }
    if(mov_player2.bomb){
      setBomb(player_2)
    }

    if(mov_player1.up){
      player_1.moveUp(pos_p1)
    }
    if(mov_player1.down){
      player_1.moveDown(pos_p1)
    }
    if(mov_player1.left){
      player_1.moveLeft(pos_p1)
    }
    if(mov_player1.right){
      player_1.moveRight(pos_p1)
    }
    if(mov_player1.bomb){
      setBomb(player_1)
    }
 //Fin de prueba

  }
  if (gameWelcome === true){
    dashb.drawInicio()
  }
    
  if(hasWinner === true){
    bomberMusic.pause()
    if (winner === 1){
      dashb.drawWinnerP1()
    }else if(winner === 2){
      dashb.drawWinnerP2()
    }

  }
}

start()
/*
var map = []; // You could also use an array
onkeydown = onkeyup = function(e){
    e = e || event; // to deal with IE
    map[e.keyCode] = e.type == 'keydown';
    // insert conditional here 
    console.log(map)
}
*/

var mov_player1 = {
  up:false,
  down:false,
  left:false,
  right:false,
  bomb:false
}

var mov_player2 = {
  up:false,
  down:false,
  left:false,
  right:false,
  bomb:false
}

addEventListener('keydown',function(e){
  
  switch(e.keyCode){
    case 40:
      mov_player2.down = true
      return
    case 38:
      mov_player2.up = true
      return
    case 37:
      mov_player2.left = true
      return
    case 39:
    mov_player2.right = true
      return
    case 189:
    mov_player2.bomb = true
      return
      default:
          return
  }
} )

addEventListener('keyup',function(e){

  switch(e.keyCode){
    case 40:
      mov_player2.down = false
      return
    case 38:
      mov_player2.up = false
      return
    case 37:
      mov_player2.left = false
      return
    case 39:
    mov_player2.right = false
      return
    case 189:
    mov_player2.bomb = false
      return
      default:
          return
  }
} )

addEventListener('keydown',function(e){
  switch(e.keyCode){
      case 83:
          mov_player1.down = true
          return
      case 87:
          mov_player1.up = true
          return
      case 65:
          mov_player1.left = true
          return
      case 68:
          mov_player1.right = true
          return
      case 81:
          mov_player1.bomb = true
          return
      default:
          return
  }
} )

addEventListener('keyup',function(e){
  switch(e.keyCode){
      case 83:
          mov_player1.down = false
          return
      case 87:
          mov_player1.up = false
          return
      case 65:
          mov_player1.left = false
          return
      case 68:
          mov_player1.right = false
          return
      case 81:
          mov_player1.bomb = false
          return
      default:
          return
  }
} )



addEventListener('keydown',function(e){
  if (e.keyCode > -100 && gameWelcome === true){
    bomberMusic.play()
    gameWelcome = false
  }
} )

/*
addEventListener('keydown',function(e){
  var pos_p2 = player_2.getActualBoxPosition()
  switch(e.keyCode){
      case 40:
          player_2.moveDown(pos_p2)
          return
      case 38:
          player_2.moveUp(pos_p2)
          return
      case 37:
          player_2.moveLeft(pos_p2)
          return
      case 39:
          player_2.moveRight(pos_p2)
          return
      case 189:
          setBomb(player_2)
          return
      default:
          return
  }
} )

addEventListener('keydown',function(e){
  var pos_p1 = player_1.getActualBoxPosition()
  switch(e.keyCode){
      case 83:
          player_1.moveDown(pos_p1)
          return
      case 87:
          player_1.moveUp(pos_p1)
          return
      case 65:
          player_1.moveLeft(pos_p1)
          return
      case 68:
          player_1.moveRight(pos_p1)
          return
      case 81:
          setBomb(player_1)
          return
      default:
          return
  }
} )

addEventListener('keydown',function(e){
  if (e.keyCode > -100 && gameWelcome === true){
    gameWelcome = false
  }
} )

*/