class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutSceneSpaces = config.cutSceneSpaces || {};
        this.walls = config.walls || {};
        this.tiledMap = new Image();
        this.tiledMap.src = config.tiledMapSrc;
        this.isCutscenePlaying = false;
    }

    drawMap(ctx, cameraPerson){
        ctx.drawImage(this.tiledMap, utils.widthGrid(11.5) - cameraPerson.x, utils.widthGrid(7.5) - cameraPerson.y)
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction)
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            let object = this.gameObjects[key];
            object.id = key;
            object.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;
        // Start the loop of events from the cutscene and wait for each one to complete
        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this
            });
            await eventHandler.init();
            
        }
        this.isCutscenePlaying = false;

        // Reset the NPC's behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    checkForFootstepCutscene() {
        const character = this.gameObjects["player_character"];
        const match = this.cutSceneSpaces[`${character.x},${character.y}`];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events)
        }
    }

    checkForActionCutscene() {
        const character = this.gameObjects["player_character"];
        const nextCoords = utils.nextPosition(character.x, character.y, character.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {
            this.startCutscene(match.talking[0].events)
        }
    }

    addWall(x,y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall(x,y) {
        delete this.walls[`${x},${y}`];
    }
    moveWall(oldX, OldY, direction) {
        this.removeWall(oldX,OldY);
        const {x,y} = utils.nextPosition(oldX,OldY,direction);
        this.addWall(x,y);
    }

}

window.OverworldMaps = {
    GameStart: {
        tiledMapSrc: "assets/sprites/Scene0.png",
        gameObjects: {
            player_character: new Character({
                IsPlayerControlled: true,
                x: utils.widthGrid(6),
                y: utils.widthGrid(6),
            }),
            npcA: new Character({
                x: utils.widthGrid(8),
                y: utils.widthGrid(8),
                src: "assets/sprites/NPC_GodOfLight.png",
                behaviorLoop: [
                    { type: "walk", direction: "right" },
                    { type: "stand", direction: "up", time: 800 },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "down" }
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Hi!", facePlayer: "npcA" },
                            { type: "textMessage", text: "GTFO!" },
                            { who: "player_character", type: "walk", direction: "left" },
                        ]
                    }
                ]
            })
        },
        walls: utils.findElementPositions(14,14,[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 0, 0, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0]),
        cutSceneSpaces: {
/*             [utils.asGridCoord(7,12)] : [
                {
                    events: [
                        { type: "textMessage", text: "I can't go yet!" },
                        { who: "player_character", type: "walk", direction: "up" },
                        { who: "player_character", type: "walk", direction: "up" },
                    ]
                }
            ], */
            [utils.asGridCoord(8,13)] : [
                {
                    events: [
                        { type: "changeMap", map: "DirtRoadToCity" },
                    ]
                }
            ],
            [utils.asGridCoord(7,13)] : [
                {
                    events: [
                        { type: "changeMap", map: "DirtRoadToCity" },
                    ]
                }
            ],
        }
    },
    DirtRoadToCity: {
        tiledMapSrc: "assets/sprites/Scene1.png",
        gameObjects: {
            player_character: new Character({
                IsPlayerControlled: true,
                x: utils.widthGrid(6),
                y: utils.widthGrid(1),
            }),
            npcB: new Character({
                x: utils.widthGrid(10),
                y: utils.widthGrid(12),
                src: "assets/sprites/NPC_ShadowBandit.png",
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Hello $player$!", facePlayer:["npcB"]},
                            {type: "textMessage", text: "Lets Battle!", facePlayer:["npcB"]},
                            {type: "battle" }

                        ]
                    }
                ]
            })         
        },
        walls: utils.findElementPositions(32,24,[0, 0, 0, 1908, 0, 0, 1908, 0, 1908, 1908, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 0, 1908, 1908, 0, 1908, 1908, 1908, 0, 0, 1908, 1908, 0, 0, 1908, 1908, 1908, 0, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908, 1908]),
        cutSceneSpaces: {
                        [utils.asGridCoord(5,0)] : [
                            {
                                events: [
                                    { type: "changeMap", map: "GameStart" },
                                ]
                            }
                        ],
                        [utils.asGridCoord(6,0)] : [
                            {
                                events: [
                                    { type: "changeMap", map: "GameStart" },
                                ]
                            }
                        ],
                        [utils.asGridCoord(27,14)] : [
                            {
                                events: [
                                    { type: "textMessage", text: "The cave is too scary!" },
                                ]
                            }
                        ],
                    }
    },
}