class StoryScene extends Phaser.Scene {
    constructor() { //constructor() is a special method for creating and initializing an object created with a class. In this case, it initializes the StoryScene class.
        super('StoryScene');
    }

    preload() {  //load assets (key, path)
        this.load.image('bg', 'assets/BoM/level2_bg.png');
    }

    create() {

        this.cameras.main.fadeIn(800, 0, 0, 0); //(duration, red, green, blue) 
        this.dialogues = [ // array of strings that will be displayed as dialogue in the story scene
            "In April 1521, Spanish explorer Ferdinand Magellan arrived in Cebu, seeking allies and converts for Spain.",
            "Rajah Humabon accepted his rule and the new faith, but one leader refused. On the nearby island of Mactan,",            
            "Datu Lapu-Lapu stood firm against foreign control. At dawn, Magellan led his men across the shallow waters",            
            "to confront him, unaware that this battle would change history.",            
        ];

        this.index = 0; // keeps track of the current dialogue index being displayed
        this.charIndex = 0; // keeps track of the current letter index being displayed in the current dialogue line
        this.typingSpeed = 30; // speed of typing effect in milliseconds (lower is faster)
        this.isTyping = false; 


        this.add.image(0, 0, 'bg').setScale(1).setOrigin(0,0); // (x, y, key) 

        this.dialogBox = this.add.rectangle(256, 240, 500, 90, 0xffffff) 
            .setStrokeStyle(2, 0x000000)
            .setScrollFactor(0);

        this.text = this.add.text(10, 200, '', { // (x, y, text, style)
            fontSize: '18px',
            fill: '#000000',
            wordWrap: { width: 490 }
        });

        this.hint = this.add.text(10, 260, 'SPACE / CLICK', {
            fontSize: '14px',
            fill: '#000000'
        });


        this.input.keyboard.on('keydown-SPACE', () => this.next()); // (event, callback)
        this.input.keyboard.on('keydown-RIGHT', () => this.next());
        this.input.on('pointerdown', () => this.next());

        this.showLine(); // starts the process of showing the first line of dialogue with a typing effect
        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '../adventure';
        });
    }

    showLine() {
        this.text.setText('');
        this.charIndex = 0;
        this.isTyping = true;
        this.current = this.dialogues[this.index];

        this.typingEvent = this.time.addEvent({
            delay: this.typingSpeed,
            loop: true,
            callback: () => {
                this.text.text += this.current[this.charIndex];
                this.charIndex++;

                if (this.charIndex >= this.current.length) {
                    this.isTyping = false;
                    this.time.removeAllEvents(); // stops the typing effect once the entire line has been displayed
                }
            }
        });
    }

    next() {
        if (this.isTyping) {
            this.text.setText(this.current); // immediately displays the full current line of dialogue if the player tries to advance while the typing effect is still in progress
            this.isTyping = false;
            this.time.removeAllEvents(); // stops the typing effect
            return;
        }

        this.index++;

        if (this.index >= this.dialogues.length) {
            this.cameras.main.fadeOut(800); 
            this.cameras.main.once('camerafadeoutcomplete', () => { // (event, callback)
                this.scene.start('MainScene');
            });
        } else {
            this.showLine();
        }
    }
}        

// =============================================
//  MAIN SCENE
// =============================================
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('bg', 'assets/BoM/level2_bg.png');
        this.load.image('plat', 'assets/BoM/level2_plat.png');
        this.load.image('log', 'assets/logs/l_log.png');
        this.load.image('lapu_idle', 'assets/lapu/lapu.png');
        this.load.image('lapu_walk', 'assets/lapu/lapu_walk.png');
        this.load.image('lapu_attack', 'assets/lapu/lapu_atk.png');
        this.load.image('lapu_jump', 'assets/lapu/lapu_jump.png');
        this.load.image('magellan_idle', 'assets/magellan/magellan.png');
        this.load.image('magellan_walk', 'assets/magellan/magellan_walk.png');
        this.load.image('magellan_attack', 'assets/magellan/magellan_atk.png');
        this.load.image('magellan_jump', 'assets/magellan/magellan_jump.png');
    }

    // ── DIALOGUE ──────────────────────────────
    showDialogue() {
        this.dialogText.setText('');
        this.charIndex = 0;
        this.isTyping = true;
        this.currentLine = this.dialogues[this.dialogIndex];

        this.time.addEvent({
            delay: 30,
            loop: true,
            callback: () => {
                this.dialogText.text += this.currentLine[this.charIndex];
                this.charIndex++;
                if (this.charIndex >= this.currentLine.length) {
                    this.isTyping = false;
                    this.time.removeAllEvents();
                }
            }
        });
    }

    nextDialogue() {
        if (this.gameStarted) return; // ignore after game starts

        if (this.isTyping) {
            // Skip typing animation — show full line instantly
            this.dialogText.setText(this.currentLine);
            this.isTyping = false;
            this.time.removeAllEvents();
            return;
        }

        this.dialogIndex++;

        if (this.dialogIndex >= this.dialogues.length) {
            // Hide dialogue and begin the fight
            this.dialogBox.setVisible(false);
            this.dialogText.setVisible(false);
            this.hintText.setVisible(false);
            this.input.keyboard.enabled = true;
            this.physics.resume();
            this.gameStarted = true;
        } else {
            this.showDialogue();
        }
    }

    // ── PLAYER ATTACK ─────────────────────────
    attack() {
        if (this.playerAttackCooldown) return;

        this.playerAttackCooldown = true;
        this.isAttacking = true;
        this.player.setTexture('lapu_attack');

        // Check hit at the moment of attack
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.enemy.x, this.enemy.y
        );

        if (distance < 60) {
            this.enemyLives--;
            this.enemyText.setText('Magellan: ' + this.enemyLives);

            // Force enemy out of attack if stunned
            if (this.enemyState === 'attack') {
                this.setEnemyState('cooldown');
            }

            if (this.enemyLives <= 0) {
                this.scene.start('EndScene');
                return;
            }
        }

        // End attack pose after 200 ms
        this.time.delayedCall(200, () => {
            this.isAttacking = false;
        });

        // Player can attack again after 600 ms (slightly faster than before — feels better)
        this.time.delayedCall(600, () => {
            this.playerAttackCooldown = false;
        });
    }

    // ── ENEMY STATE MACHINE ───────────────────
    /*
        States:
          idle     – enemy patrols slowly; doesn't notice player
          chase    – enemy walks toward player (not too fast)
          windup   – enemy is winding up an attack (telegraphed!)
          attack   – damage frame (short window)
          cooldown – enemy recovers; player can punish
    */
    setEnemyState(newState) {
        this.enemyState = newState;
        this.enemyStateTimer = 0;
    }

    updateEnemyAI(delta) {
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.enemy.x, this.enemy.y
        );
        const dx = this.player.x - this.enemy.x;

        this.enemyStateTimer += delta;

        switch (this.enemyState) {

            // ── IDLE / PATROL ──────────────────
            case 'idle': {
                // Simple patrol: walk back and forth
                this.enemy.setVelocityX(this.enemyPatrolDir * 50);
                this.enemy.flipX = this.enemyPatrolDir < 0;
                this.animateEnemy(true);

                // Reverse patrol direction every 2 seconds
                if (this.enemyStateTimer > 2000) {
                    this.enemyPatrolDir *= -1;
                    this.enemyStateTimer = 0;
                }

                // NOTICE the player if close enough (detection range: 180 px)
                if (dist < 180) {
                    // Small reaction delay before actually chasing
                    this.time.delayedCall(400, () => {
                        if (this.enemyState === 'idle') {
                            this.setEnemyState('chase');
                        }
                    });
                }
                break;
            }

            // ── CHASE ─────────────────────────
            case 'chase': {
                // Move toward player at a moderate speed
                if (Math.abs(dx) > 8) {
                    this.enemy.setVelocityX(dx > 0 ? 80 : -80);
                    this.enemy.flipX = dx < 0;
                }
                this.animateEnemy(true);

                // Jump if player is above and enemy is on ground
                if ((this.player.y - this.enemy.y) < -40 && this.enemy.body.blocked.down) {
                    this.enemy.setVelocityY(-380);
                    this.enemy.setTexture('magellan_jump');
                }

                // Go back to idle if player runs far away
                if (dist > 220) {
                    this.setEnemyState('idle');
                }

                // Enter wind-up when close enough
                if (dist < 55) {
                    this.setEnemyState('windup');
                }
                break;
            }

            // ── WIND-UP (telegraphed) ──────────
            case 'windup': {
                // Stop moving so the player can see the tell
                this.enemy.setVelocityX(0);
                this.enemy.setTexture('magellan_attack'); // show attack pose as warning

                // After 500 ms wind-up, deal damage
                if (this.enemyStateTimer > 500) {
                    this.dealEnemyDamage();
                    this.setEnemyState('attack');
                }
                break;
            }

            // ── ATTACK (brief damage frame) ────
            case 'attack': {
                this.enemy.setVelocityX(0);
                this.enemy.setTexture('magellan_attack');

                // Damage frame lasts 200 ms, then cooldown
                if (this.enemyStateTimer > 200) {
                    this.setEnemyState('cooldown');
                }
                break;
            }

            // ── COOLDOWN (player can punish!) ──
            case 'cooldown': {
                this.enemy.setVelocityX(0);
                this.enemy.setTexture('magellan_idle');

                // Enemy recovers after 900 ms — long enough to punish
                if (this.enemyStateTimer > 900) {
                    // Back to idle or chase depending on distance
                    this.setEnemyState(dist < 200 ? 'chase' : 'idle');
                }
                break;
            }
        }
    }

    // Apply damage to player during enemy attack
    dealEnemyDamage() {
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.enemy.x, this.enemy.y
        );

        // Only deal damage if player is still in range
        if (dist > 60) return;

        this.playerLives--;
        this.playerText.setText('Lapulapu: ' + this.playerLives);

        this.cameras.main.shake(200, 0.01);

        // Knockback
        this.player.setVelocityX(this.player.x < this.enemy.x ? -200 : 200);

        if (this.playerLives <= 0) {
            this.scene.start('GameOverScene');
        }
    }

    // ── WALK ANIMATION HELPER ─────────────────
    animateEnemy(isMoving) {
        // Don't override special state textures
        if (this.enemyState === 'windup' || this.enemyState === 'attack') return;

        if (isMoving && this.enemy.body.blocked.down) {
            this.enemy.walkTimer++;
            if (this.enemy.walkTimer > 8) {
                this.enemy.walkTimer = 0;
                this.enemy.walkIndex = (this.enemy.walkIndex + 1) % this.enemy.walkFrames.length;
                this.enemy.setTexture(this.enemy.walkFrames[this.enemy.walkIndex]);
            }
        } else if (!isMoving && this.enemy.body.blocked.down) {
            this.enemy.setTexture('magellan_idle');
        }
    }

    // ── CREATE ────────────────────────────────
    create() {
        this.physics.resume();
        this.input.keyboard.enabled = true;
        const platformData = [
            { x: 150, y: 170, key: 'log', w: 63, h: 12 },
            { x: 300, y: 120, key: 'log', w: 63, h: 12 },
        ];

        this.add.image(0, 0, 'bg').setOrigin(0, 0);

        this.ground = this.physics.add.staticGroup();
        this.ground.create(256, 270, 'plat').setScale(1).refreshBody();

        this.platforms = this.physics.add.staticGroup();
        platformData.forEach(p => {
            let platform = this.platforms.create(p.x, p.y, p.key).setScale(0.2).refreshBody();
            platform.body.setSize(p.w, p.h);
            platform.body.setOffset(5, 0);
        });

        // PLAYER
        this.player = this.physics.add.sprite(30, 220, 'lapu_idle').setScale(0.13);
        this.player.setCollideWorldBounds(true);
        this.walkFrames = ['lapu_idle', 'lapu_walk'];
        this.walkIndex = 0;
        this.walkTimer = 0;

        // ENEMY
        this.enemy = this.physics.add.sprite(400, 220, 'magellan_idle').setScale(0.13);
        this.enemy.setCollideWorldBounds(true);
        this.enemy.walkFrames = ['magellan_idle', 'magellan_walk'];
        this.enemy.walkIndex = 0;
        this.enemy.walkTimer = 0;

        // CONTROLS
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // LIVES
        this.playerLives = 5;
        this.enemyLives = 5;
        this.playerText  = this.add.text(10,  10, 'Lapulapu: 5', { fill: '#fff' }).setScrollFactor(0);
        this.enemyText   = this.add.text(390, 10, 'Magellan: 5', { fill: '#fff' }).setScrollFactor(0);

        // COMBAT FLAGS
        this.isAttacking = false;
        this.playerAttackCooldown = false;

        // COLLIDERS
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.enemy,  this.ground);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy,  this.platforms);

        // ENEMY AI STATE
        this.enemyState      = 'idle';
        this.enemyStateTimer = 0;
        this.enemyPatrolDir  = -1; // start patrolling left

        // DIALOGUE
        this.dialogues = [
            "F. Magellan: Submit to Spain.",
            "Lapulapu: I will never bow to foreign invaders!",
            "F. Magellan: Then we fight.",
            "Lapulapu: For Mactan!"
        ];
        this.dialogIndex = 0;
        this.charIndex   = 0;
        this.isTyping    = false;
        this.gameStarted = false;

        this.dialogBox = this.add.rectangle(256, 240, 500, 80, 0xffffff)
            .setStrokeStyle(2, 0x000000)
            .setScrollFactor(0);
        this.dialogText = this.add.text(20, 210, '', {
            fontSize: '16px',
            fill: '#000',
            wordWrap: { width: 470 }
        }).setScrollFactor(0);
        this.hintText = this.add.text(20, 260, 'SPACE to continue', {
            fontSize: '12px',
            fill: '#000'
        }).setScrollFactor(0);

        // Pause physics until dialogue ends
        this.physics.pause();
        this.input.keyboard.enabled = false;

        // Dialogue input (separate from game controls)
        this.input.keyboard.on('keydown-SPACE', () => this.nextDialogue());
        this.input.keyboard.on('keydown-RIGHT', () => this.nextDialogue());
        this.input.on('pointerdown', () => this.nextDialogue());

        this.showDialogue();

        // TIMER
        this.timeLeft = 60;
        this.timerText = this.add.text(200, 10, 'Time: 01:00', { fill: '#fff' }).setScrollFactor(0);
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (!this.gameStarted) return; // don't count down during dialogue

                this.timeLeft--;
                const minutes = Math.floor(this.timeLeft / 60);
                let   seconds = this.timeLeft % 60;
                if (seconds < 10) seconds = '0' + seconds;
                this.timerText.setText(`Time: ${minutes}:${seconds}`);

                if (this.timeLeft <= 0) {
                    this.scene.start('GameOverScene');
                }
            }
        });

        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '../adventure';
        });
    }

    // ── UPDATE ────────────────────────────────
    update(time, delta) {
        // ── PLAYER MOVEMENT ───────────────────
        let isMoving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-150);
            this.player.flipX = true;
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(150);
            this.player.flipX = false;
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        // Walk animation
        if (!this.isAttacking) {
            if (isMoving && this.player.body.blocked.down) {
                this.walkTimer++;
                if (this.walkTimer > 8) {
                    this.walkTimer = 0;
                    this.walkIndex = (this.walkIndex + 1) % this.walkFrames.length;
                    this.player.setTexture(this.walkFrames[this.walkIndex]);
                }
            } else if (!isMoving && this.player.body.blocked.down) {
                this.player.setTexture('lapu_idle');
            }
        }

        // Jump
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
            this.player.setTexture('lapu_jump');
        }

        // Attack — SPACE key (only during gameplay)
        if (this.gameStarted && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }

        // ── ENEMY AI ──────────────────────────
        if (this.gameStarted) {
            this.updateEnemyAI(delta);
        }
    }
}

// =============================================
//  GAME OVER SCENE
// =============================================
class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    create() {
        this.cameras.main.fadeIn(800, 0, 0, 0);

        this.add.text(256, 120, "Game Over", { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(256, 160, "History Changed...", { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(256, 220, "Press SPACE to Restart", { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(256, 250, "Press ESC to exit", { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.stop('MainScene');
            this.scene.stop('StoryScene');

            this.scene.start('StoryScene');
        });
        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '../adventure';
        });
    }
}

// =============================================
//  END SCENE
// =============================================
class EndScene extends Phaser.Scene {
    constructor() { super('EndScene'); }

    create() {
        this.cameras.main.fadeIn(800, 0, 0, 0);

        this.add.text(256, 120, "Battle of Mactan Complete", { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(256, 160, "History Fulfilled", { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(256, 220, "Press SPACE to Restart", { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(256, 250, "Press ESC to exit", { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.stop('MainScene');
            this.scene.stop('StoryScene');

            this.scene.start('StoryScene');
        });
        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '../adventure';
        });
    }
}

// =============================================
//  PHASER CONFIG
// =============================================
const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 288,
    pixelArt: true,
    parent: 'game-container',
    render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 500 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [StoryScene, MainScene, EndScene, GameOverScene]
};

const game = new Phaser.Game(config);