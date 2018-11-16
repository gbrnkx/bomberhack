//canvas
var canvas = document.getElementById('canvas')
var canvas_p1 = document.getElementById('marcador_player1')
var canvas_p2 = document.getElementById('marcador_player2')
var ctx_p1 = canvas_p1.getContext('2d')
var ctx_p2 = canvas_p2.getContext('2d')
var ctx = canvas.getContext('2d')

//variables
var interval
var frames = 0
var arrBombas = []

var characters = {
  temporal:"images/temporal.png"
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
  this.hasPlayer = false

  this.explode = () =>{
    if(this.level > 0){
      this.level--
      //console.log(this.powerUp)
      if(this.powerUp > 0 && this.level === 0){
        this.image.src = powerUps[this.powerUp].image
      }else{
        this.image.src = objBoxes[this.level].image
      }
      this.hasBomb = false
  } 
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
  console.log(rdm_matrix)
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
}

function bomb(pos,bombMorePower){
  var boxesToExplode = findAdjacent(pos)
  this.boomBox = dashb.boxes[pos.y][pos.x]
  this.range = 1
  this.image = new Image()
  if (bombMorePower){
    this.image.src = bombs.stronger
  } else {
    this.image.src = bombs.normal
  }
  
  this.boom = () =>{
    if(boxesToExplode.up != false){
      boxesToExplode.up.explode()
    }
    if(boxesToExplode.down != false){
      boxesToExplode.down.explode()
    }
    if(boxesToExplode.left != false){
      boxesToExplode.left.explode()
    }
    if(boxesToExplode.right != false){
      boxesToExplode.right.explode()
    }
    dashb.boxes[pos.y][pos.x].image.src = objBoxes[0].image
  }

  this.draw = () =>{
    if(bombMorePower === true){
      dashb.boxes[pos.y][pos.x].image.src = bombs.stronger
    }else{
      dashb.boxes[pos.y][pos.x].image.src = bombs.normal
    }
  }

  function marker(){

  }
}

function bomberman(playerNum){
  this.x = 20
  this.y = 20
  this.width = 47
  this.height = 47
  this.playerNum  = playerNum ? playerNum : 1
  this.actualPos = {}
  this.lives = 3
  this.stillAlive = true
  this.bombMorePower = false
  this.bombsAllowed = 1
  this.velocity = 2.5
  this.image = new Image()
  this.image.src = characters.temporal

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

  this.getCaughtByExplosion = () =>{
    if(this.lives>0){
      this.lives--
    }else{
      this.stillAlive = false
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
            if(this.velocity <= 4){
              this.velocity+=0.2
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }

    if (this.y > actualBox.limitsBox.limBox_up){
      this.y -=3*this.velocity
    } else if(adjacentsBoxes.up != false && adjacentsBoxes.up.level === 0){
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
            if(this.velocity <= 4){
              this.velocity+=0.2
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }
    if(this.y+this.height < actualBox.limitsBox.limBox_down){
      this.y +=3*this.velocity
    } else if(adjacentsBoxes.down != false && adjacentsBoxes.down.level === 0){
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
            if(this.velocity <= 4){
            this.velocity+=0.2
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }
    if(this.x > actualBox.limitsBox.limBox_left){
      this.x -=3*this.velocity
    } else if(adjacentsBoxes.left != false && adjacentsBoxes.left.level === 0){
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
            if(this.velocity <= 4){
              this.velocity+=0.2
            }
            actualBox.image.src = objBoxes[0].image
            actualBox.powerUp = 0
            break;
        }
      }
    if(this.x+this.width < actualBox.limitsBox.limBox_right){
      this.x +=3*this.velocity
    } else if(adjacentsBoxes.right != false && adjacentsBoxes.right.level === 0){
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
var player_1 = new bomberman()
dashb.createBoxMatrix()

function setBomb(player){
  var bombPosition = player.getActualBoxPosition()
  var bomba_ready = new bomb(bombPosition, player.bombMorePower)
  if(player.bombsAllowed > 0){
    bomba_ready.draw()
    player.bombsAllowed--
    dashb.boxes[bombPosition.y][bombPosition.x].hasBomb = true
    setTimeout(function(){ 
      bomba_ready.boom()
      player.bombsAllowed++
      }, 3000);
  }
}

function start(){
  //Cada 30 milisegundos se llamará a la función update() 1000/25=40
  //Esto es 40 veces por segundo
  if(!interval) interval = setInterval(update,40) 
}

function update(){
  frames++
  ctx.clearRect(0,0,canvas.width, canvas.height)
  dashb.draw()
  dashb.drawBoxMatrix()
  player_1.draw()
}

addEventListener('keydown',function(e){
  this.console.log(e.keyCode)
  switch(e.keyCode){
      case 40:
          player_1.moveDown(player_1.getActualBoxPosition())
          return
      case 38:
          player_1.moveUp(player_1.getActualBoxPosition())
          return
      case 37:
          player_1.moveLeft(player_1.getActualBoxPosition())
          return
      case 39:
          player_1.moveRight(player_1.getActualBoxPosition())
          return
      case 189:
          setBomb(player_1)
          return
      default:
          return
  }
} )

start()