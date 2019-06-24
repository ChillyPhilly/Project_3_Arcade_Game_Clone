// Enemies our player must avoid
class Enemy {
  constructor() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    let laneYCoordinates = [60, 140, 220]; //lane Y Coordinates
    this.speed = this.generateSpeed();
    this.lane = this.whichLane();
    this.y = laneYCoordinates[this.lane];
    this.x = -100;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = "images/enemy-bug.png";
  }

  //Decide which of the three y-lanes the enemy will spawn in
  whichLane() {
    let laneIndex = Math.floor(Math.random() * 3);
    return laneIndex;
  }

  //Assign a random speed to each enemy (within certain limits)
  generateSpeed() {
    let randomSpeed = Math.random() * 100 + 100;
    return randomSpeed;
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x >= 600) {
      this.x -= 700;
      this.speed = this.generateSpeed();
      this.lane = this.whichLane();
    }
  }

  // Draw the enemy on the screen, required method for game
  render(dt) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
class Player {
  constructor() {
    this.sprite = "images/char-boy.png";
    this.x = 200;
    this.y = 410;
  }

  //Collision handler
  collision() {
    window.alert("You lost!");
  }

  //Gem pickup handler
  gemCollect() {
    console.log("Oooh, shiny!");
  }

  //Check for collisions whenever the screen updates
  update(dt) {
    for (let enemy of allEnemies) {
      if (
        this.x >= enemy.x - 80 &&
        this.x <= enemy.x + 80 &&
        (this.y >= enemy.y - 50 && this.y <= enemy.y + 50)
      ) {
        setTimeout(() => {
          return this.collision();
        }, 50);
      }
    }
    for (let gem of allGems) {
      if (
        this.x >= gem.x - 30 &&
        this.x <= gem.x + 30 &&
        (this.y >= gem.y - 70 && this.y <= gem.y + 25)
      ) {
        setTimeout(() => {
          allGems.delete(gem);
          return this.gemCollect();
        }, 50);
      }
    }
  }

  hitRiver() {
    this.x = 200;
    this.y = 410;
  }

  //Draw player on screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }

  //What to do when keys are pressed. Each has a limit to prevent off-screen movement
  handleInput(key) {
    if (key === "left") {
      if (this.x < 50) {
        return;
      } else {
        this.x -= 100;
      }
    } else if (key === "right") {
      if (this.x > 350) {
        return;
      } else {
        this.x += 100;
      }
    } else if (key === "down") {
      if (this.y > 400) {
        return;
      } else {
        this.y += 90;
      }
    } else if (key === "up") {
      if (this.y < 100) {
        return this.hitRiver();
      } else {
        this.y -= 90;
      }
    }
  }
}

class Gem {
  constructor() {
    const yCoordinates = [110, 190, 270];
    const xCoordinates = [20, 120, 220, 320, 420];
    let gemOption = this.gemColour();
    this.y = yCoordinates[Math.floor(Math.random() * yCoordinates.length)];
    this.x = xCoordinates[Math.floor(Math.random() * xCoordinates.length)];
    this.sprite = `images/Gem-${gemOption}.png`;
  }

  update(dt) {}

  gemColour() {
    const gemColours = ["Orange", "Green", "Blue"];
    let gemIndex = Math.floor(Math.random() * gemColours.length);
    return gemColours[gemIndex];
  }

  // Draw gem on screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 60, 100);
  }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

function spawnEnemy() {
  let maxEnemies = 6;
  for (let i = 0; i <= maxEnemies; i++) {
    setTimeout(() => {
      allEnemies.add(new Enemy());
    }, Math.random() * 3000);
  }
}

function spawnGem() {
  for (let i = 0; i <= 2; i++) {
    setTimeout(() => {
      allGems.add(new Gem());
    }, Math.random() * 20000);
  }
}

const player = new Player();
const allEnemies = new Set();
const allGems = new Set();

spawnGem();
spawnEnemy();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener("keyup", function(e) {
  var allowedKeys = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
