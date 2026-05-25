

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('rajahH_idle', '/sugbohenyo/games/assets/rajahH/rajahH.png');
        this.load.image('rajahH_walk', '/sugbohenyo/games/assets/rajahH/rajahH_walk.png');
        this.load.image('rajahH_jump', '/sugbohenyo/games/assets/rajahH/rajahH_jump.png');
        this.load.image('bg', '/sugbohenyo/games/assets/badian/bg_badian.png');
        this.load.image('grass', '/sugbohenyo/games/assets/oslob/oslob_ground.png');
        
        this.load.image('fish', '/sugbohenyo/games/assets/bantayan/fish.png');
        this.load.image('egg', '/sugbohenyo/games/assets/bantayan/egg.png');
        this.load.image('wood', '/sugbohenyo/games/assets/bantayan/wood.png');
        this.load.image('trash', '/sugbohenyo/games/assets/bantayan/trash.png');

    }

    showDialogue() {
        this.dialogText.setText('');
        this.charIndex = 0;
        this.isTyping = true;

        this.currentLine = this.dialogues[this.dialogIndex];

        this.typingEvent = this.time.addEvent({
            delay: 30,
            loop: true,
            callback: () => {
                this.dialogText.text += this.currentLine[this.charIndex];
                this.charIndex++;

                if (this.charIndex >= this.currentLine.length) {
                    this.isTyping = false;
                    this.typingEvent.remove(false); // ← only removes the typing event
                }
            }
        });
    }

    nextDialogue() {
        if (!this.gameStarted) {
            if (this.isTyping) {
                this.dialogText.setText(this.currentLine);
                this.isTyping = false;
                this.typingEvent.remove(false); // ← only removes the typing event
                return;
            }

            this.dialogIndex++;

            if (this.dialogIndex >= this.dialogues.length) {
                this.dialogBox.setVisible(false);
                this.dialogText.setVisible(false);
                this.hintText.setVisible(false);

                this.input.keyboard.enabled = true;

                this.physics.resume(); // resume physics
                this.gameStarted = true;
                this.startTimer();
                this.spawnEvent.paused = false;
            } else {
                this.showDialogue();
            }
        }
    }

    startTimer() {
        if (this.timerStarted) return;

        this.timerStarted = true;

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (!this.gameStarted) return; // 🔥 IMPORTANT: don't run during dialogue

                this.timeLimit--;

                this.timerText.setText('Time: ' + this.timeLimit + 's');

                if (this.timeLimit <= 0) {
                    this.timerEvent.remove(false);
                    this.scene.start('QuizScene', {
                        score: this.score,
                        lives: this.lives
                    });
                }
            }
        });
    }

    spawnItem() {
        if (!this.gameStarted) return;
        const types = ['fish', 'egg', 'wood', 'trash'];
        const type = Phaser.Utils.Array.GetRandom(types);

        const x = Phaser.Math.Between(30, 480);

        const item = this.items.create(x, -20, type);

        item.body.setAllowGravity(false);
        item.setVelocityY(this.fallSpeed);
        item.setScale(.05);
        item.setDepth(10); // optional but now correct

        item.type = type;
    }

    catchItem(player, item) {
        if (item.type === 'fish') {
            this.score += 10;
        } 
        else if (item.type === 'egg') {
            this.score += 20;
        } 
        else if (item.type === 'wood') {
            this.score += 5;
        } 
        else if (item.type === 'trash') {
            this.lives -= 1;
        }

        item.destroy();

        this.scoreText.setText('Score: ' + this.score);
        this.livesText.setText('Lives: ' + this.lives);

        if (this.lives <= 0) {
            this.timerEvent?.remove(false);
            this.scene.start('GameOverScene');
        }
    }


    create() {
        this.physics.resume();
        this.input.keyboard.enabled = true;
        this.score = 0;
        this.lives = 3;
        this.timeElapsed = 0;
        this.timeLimit = 60;
        this.timerStarted = false;
        this.fallSpeed = 100;
        this.hitCooldown = false;
        this.entering = false;
        this.gameStarted = false;
        this.spawnEvent = null;
        
        
        this.add.image(256, 144, 'bg').setScale(5);

        let ground = this.physics.add.staticGroup(); // creates a static physics group called 'ground' that will be used to create the ground tiles for the level, allowing the player to collide with them and walk on them
        for (let x = 0; x < 550; x += 128) {
            let tile = ground.create(x, 275, 'grass'); // (x, y, key)
            tile.setScale(3).refreshBody(); // .refreshbody() updates the physics body of the tile after scaling, ensuring that the collision detection works correctly with the new size of the tile.
            tile.refreshBody();
        }

        this.instrucText = this.add.text(30, 100, 'Use ->, <- to move', {
            fontSize: '16px',
            fill: '#000000'
        })

        this.livesText = this.add.text(10, 10, 'Lives: 3', {  
            fontSize: '16px',
            fill: '#000000'
        }).setScrollFactor(0);

        this.scoreText = this.add.text(10, 30, 'Score: 0', {
            fontSize: '16px',
            fill: '#000000'
        }).setScrollFactor(0);

        this.timerText = this.add.text(10, 50, 'Time: 60s', {
            fontSize: '16px',
            fill: '#000000'
        }).setScrollFactor(0);

        this.player = this.physics.add.sprite(250, 130, 'rajahH_idle'); //(x, y, key)
        this.player.setScale(.12);
        this.player.setCollideWorldBounds(true);
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.physics.add.collider(this.player, ground); // (object1, object2)

        this.dialogues = [
            "Lapu-Lapu: Bantayan stands as the watchful guardian of the northern seas...",
            "Lapu-Lapu: The people here protect the island through fishing, farming, and faith.",
            "Lapu-Lapu: I must gather supplies and earn the trust of the islanders before continuing my journey."
        ];

        this.dialogIndex = 0;
        this.charIndex = 0;
        this.isTyping = false;

        this.dialogBox = this.add.rectangle(256, 240, 500, 80, 0xffffff)
            .setStrokeStyle(2, 0x000000) // border
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

        this.input.keyboard.on('keydown-SPACE', () => this.nextDialogue());
        this.input.keyboard.on('keydown-RIGHT', () => this.nextDialogue());
        this.input.on('pointerdown', () => this.nextDialogue());

        this.showDialogue();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.items = this.physics.add.group();

        this.startTimer();
        this.spawnEvent = this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: this.spawnItem,
            callbackScope: this
        });
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                this.fallSpeed += 10;
            }
        });

        this.walkFrames = ['rajahH_idle', 'rajahH_walk'];
        this.walkIndex = 0;
        this.walkTimer = 0;

        this.physics.add.overlap(this.player, this.items, this.catchItem, null, this);
        this.physics.world.setBounds(0, 0, 512, 288);
        this.physics.world.setBoundsCollision(true, true, true, false); // (x, y, width, height, checkLeft, checkRight, checkUp, checkDown) 
        
        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '/adventure';
        });
    }

    update() {
        if (!this.gameStarted && !this.physics.world.isPaused) {
            if (this.player.body.blocked.down) {
                this.physics.pause(); // pause ONLY when grounded
            }
        }
        let isMoving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
            this.player.flipX = true;
            isMoving = true;

        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
            this.player.flipX = false;
            isMoving = true;

        } else {
            this.player.setVelocityX(0);
        }

        if (isMoving && this.player.body.blocked.down) {
            this.walkTimer++;

            if (this.walkTimer > 8) {
                this.walkTimer = 0;

                this.walkIndex++;
                if (this.walkIndex >= this.walkFrames.length) {
                    this.walkIndex = 0;
                }

                this.player.setTexture(this.walkFrames[this.walkIndex]);
            }

        } else if (this.player.body.blocked.down) {
            this.player.setTexture('rajahH_idle');
        }
    }
}
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.fadeIn(800, 0, 0, 0);

        this.add.text(256, 120, "Game Over", {
            fontSize: '32px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        this.add.text(256, 160, "Press SPACE to Restart", {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(256, 220, "Press ESC to exit", {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.stop('MainScene');

            this.scene.start('MainScene');
        });
        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '/adventure';
        });
    }
}


class QuizScene extends Phaser.Scene {
    constructor() {
        super('QuizScene');
    }

    init(data) {
        this.score = data.score;
        this.lives = data.lives;
    }

    create() {

        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.questions = [
            {
                question: "What is Bantayan famously called?",
                answers: ["Egg Basket of the Visayas", "Banig Capital of Cebu", "Whale Shark Capital"],
                correct: 0
            },
            {
                question: "What does the word “Bantayan” mean?",
                answers: ["To trade", "To keep watch", "To sail"],
                correct: 1
            },
            {
                question: "Which famous dried fish delicacy comes from Bantayan?",
                answers: ["Chicharon", "Danggit", "Otap"],
                correct: 1
            },
            {
                question: "Which historic church is found in Bantayan??",
                answers: ["Basilica del Sto. Niño", "Sts. Peter and Paul Parish Church", "Oslob Parish Church"],
                correct: 1
            },
            {
                question: "What industry is one of Bantayan’s largest sources of livelihood?",
                answers: ["Fishing", "Wood Carving", "Poultry and egg production"],
                correct: 2
            }
        ];

        this.currentQuestion = 0;

        this.livesText = this.add.text(10, 10,
            'Lives: ' + this.lives,
            {
                fontSize: '16px',
                fill: '#ffffff'
            }
        );

        this.scoreText = this.add.text(130, 10,
            'Score: ' + this.score,
            {
                fontSize: '16px',
                fill: '#ffffff'
            }
        );

        this.questionText = this.add.text( 
            256,
            70,
            '',
            {
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: 450 }
            }
        ).setOrigin(0.5);

        this.answerTexts = [];

        for (let i = 0; i < 3; i++) {

            let answer = this.add.text(
                256,
                140 + (i * 40),
                '',
                {
                    fontSize: '18px',
                    fill: '#ffff00',
                    backgroundColor: '#000000',
                    padding: {
                        x: 10,
                        y: 5
                    }
                }
            ).setOrigin(0.5)
             .setInteractive();

            answer.on('pointerdown', () => {
                this.checkAnswer(i);
            });

            this.answerTexts.push(answer);
        }

        this.showQuestion();
    }

    showQuestion() {

        let q = this.questions[this.currentQuestion];

        this.questionText.setText(
            `Question ${this.currentQuestion + 1}/5\n\n${q.question}`
        );

        for (let i = 0; i < 3; i++) {
            this.answerTexts[i].setText(q.answers[i]);
        }
    }

    checkAnswer(choice) {

        let q = this.questions[this.currentQuestion];

        if (choice === q.correct) {

            this.score += 20;

            this.scoreText.setText(
                'Score: ' + this.score
            );

        } else {

            this.lives--;

            this.livesText.setText(
                'Lives: ' + this.lives
            );

            this.cameras.main.shake(200, 0.01);

            if (this.lives <= 0) {

                this.scene.start('GameOverScene');

                return;
            }
        }

        this.currentQuestion++;

        if (this.currentQuestion >= this.questions.length) {

            this.scene.start('RewardScene', {
                score: this.score,
                lives: this.lives
            });

        } else {

            this.showQuestion();
        }
    }
}

class RewardScene extends Phaser.Scene {
    constructor() {
        super('RewardScene');
    }

    init(data) {
        this.score = data.score;
        this.lives = data.lives;
    }

    preload() {

        // ADD YOUR ITEM IMAGE
        this.load.image(
            'artifact',
            '/sugbohenyo/games/assets/bantayan/egg_relic.png'
        );
    }

    create() {

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.add.rectangle(
            256,
            144,
            512,
            288,
            0x000000
        );

        let glow = this.add.circle(
            256,
            120,
            50,
            0xffffff,
            0.3
        );

        this.tweens.add({
            targets: glow,
            scale: 1.5,
            alpha: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        let item = this.add.image(
            256,
            120,
            'artifact'
        );

        item.setScale(0);

        this.tweens.add({
            targets: item,
            scale: 0.5,
            duration: 1000,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: item,
            angle: 5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.time.delayedCall(1200, () => {

            this.add.text(
                256,
                180,
                "You obtained:\nEgg of Prosperity",
                {
                    fontSize: '24px',
                    fill: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            this.add.text(
                256,
                225,
                "A sacred symbol of Bantayan’s thriving poultry industry\nand hardworking communities.",
                {
                    fontSize: '14px',
                    fill: '#ffffaa',
                    align: 'center'
                }
            ).setOrigin(0.5);

            this.add.text(
                256,
                260,
                "Press SPACE to continue",
                {
                    fontSize: '12px',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);

        });

        this.input.keyboard.once('keydown-SPACE', () => {

            this.scene.start('EndScene', {
                score: this.score,
                lives: this.lives
            });

        });
    }
}

class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    create() {
        this.cameras.main.fadeIn(800, 0, 0, 0);

        this.add.text(256, 120, "Message Delivered", {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(256, 160, "Lapu-Lapu: The people stand united.", {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(256, 220, "Press SPACE to restart", {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(256, 250, "Press ESC to exit", {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.stop('MainScene');

            this.scene.start('MainScene');
        });
        this.input.keyboard.on('keydown-ESC', () => {
            window.location.href = '/adventure';
        });
    }
}

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
    scene: [
        MainScene,
        QuizScene,
        RewardScene,
        EndScene,
        GameOverScene
    ]
};

const game = new Phaser.Game(config);