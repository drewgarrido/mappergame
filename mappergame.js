"use strict";
/*
    Copyright 2016 Drew Garrido

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
    MA 02110-1301, USA.
*/

var MapperGame = function(htmlElements)
{
    this.displayCanvas = htmlElements.mainCanvas;
    this.displayContext;
    this.bufferCanvas;
    this.bufferContext;
    this.diagCostText = htmlElements.diagCostText;
    this.critPointOptCheck = htmlElements.critPointOptCheck;

    this.width = this.displayCanvas.width;
    this.height = this.displayCanvas.height;

    this.spiderIcon;
    this.spider;
    this.flyIcon;
    this.flies = [];
    this.maze;
    this.grid;
    this.path = [];

    this.initialize = function()
    {
        this.loadImages(this.initializeObjects.bind(this));
    };

    /* Must wait for the images to be loaded, or the dimensions
     * will return a 0 while constructing objects */
    this.loadImages = function(cb)
    {
        this.flyIcon = loadImage('fly.png', undefined);
        this.spiderIcon = loadImage('spider.png', cb);
    };

    this.initializeObjects = function()
    {
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.width;
        this.bufferCanvas.height = this.height;

        this.displayContext = this.displayCanvas.getContext("2d");
        this.bufferContext = this.bufferCanvas.getContext("2d");

        this.spider = new Spider(this.bufferContext,
                                 this.spiderIcon,
                                 this.width,
                                 this.height);

        this.maze = new Maze(this.bufferContext, this.width, this.height);
        this.grid = new Grid(this.width, this.height);

        document.onkeydown = this.checkKeyDown.bind(this);
        document.onkeyup = this.checkKeyUp.bind(this);
        this.displayCanvas.onmousedown = this.checkMouseDown.bind(this);

        // Controls
        this.diagCostText.oninput = this.checkDiagCost.bind(this);
        this.checkDiagCost(null);
        this.critPointOptCheck.onchange = this.checkCritPointOpt.bind(this);
        this.checkCritPointOpt(null);

        // Disable the right click context menu
        this.displayCanvas.oncontextmenu = function(){return false;};

        this.grid.initializeGrid();

        this.renderLoop();
    };

    this.renderLoop = function()
    {
        var idx;

        // Prep offscreen buffer
        this.bufferContext.clearRect(0,0,this.width, this.height);

        // Game logic
        this.spider.move();
        this.checkWallCollision();

        for (idx = 0; idx < this.flies.length; idx++)
        {
            if (this.flies[idx].checkCollision(this.spider.location))
            {
                this.flies.splice(idx, 1);
                idx--;
            }
        }

        // Draw code
        this.maze.render();
        this.grid.render(this.bufferContext);

        for (idx = 0; idx < this.flies.length; idx++)
        {
            this.flies[idx].render();
        }

        this.spider.render();

        this.drawPath();

        // Screen flip
        this.displayContext.clearRect(0,0,this.width, this.height);
        this.displayContext.drawImage(this.bufferCanvas, 0, 0);
        requestAnimationFrame(this.renderLoop.bind(this));
    };


    this.checkWallCollision = function()
    {
        var walls = this.maze.walls;
        var diffX, diffY;
        var idx;

        for (idx = 0; idx < walls.length; idx++)
        {
            diffX = Math.abs(this.spider.location.x - walls[idx].location.x);
            diffY = Math.abs(this.spider.location.y - walls[idx].location.y);

            if (diffX < (walls[idx].halfSide + this.spider.halfWidth) &&
                diffY < (walls[idx].halfSide + this.spider.halfHeight))
            {
                if (diffX > diffY)
                {
                    this.spider.velocity.x = 0;

                    if (this.spider.location.x > walls[idx].location.x)
                    {
                        this.spider.location.x = walls[idx].location.x + walls[idx].halfSide + this.spider.halfWidth;
                    }
                    else
                    {
                        this.spider.location.x = walls[idx].location.x - walls[idx].halfSide - this.spider.halfWidth;
                    }
                }
                else
                {
                    this.spider.velocity.y = 0;

                    if (this.spider.location.y > walls[idx].location.y)
                    {
                        this.spider.location.y = walls[idx].location.y + walls[idx].halfSide + this.spider.halfHeight;
                    }
                    else
                    {
                        this.spider.location.y = walls[idx].location.y - walls[idx].halfSide - this.spider.halfHeight;
                    }
                }
            }
        }
    };


    this.drawPath = function()
    {
        var idx;

        if (this.grid.pathFound)
        {
            this.bufferContext.beginPath();
            this.bufferContext.lineWidth="5";
            this.bufferContext.strokeStyle="green";

            this.bufferContext.moveTo(this.grid.path[0].x, this.grid.path[0].y);

            for (idx = 1; idx < this.grid.path.length; idx++)
            {
                this.bufferContext.lineTo(this.grid.path[idx].x, this.grid.path[idx].y);
            }

            this.bufferContext.stroke(); // Draw it
        }
    };

    this.checkKeyDown = function(e)
    {
        var dispatch =  {'38':this.spider.upArrowDown.bind(this.spider),      // Up Arrow
                         '87':this.spider.upArrowDown.bind(this.spider),      // W
                         '40':this.spider.downArrowDown.bind(this.spider),    // Down Arrow
                         '83':this.spider.downArrowDown.bind(this.spider),    // S
                         '37':this.spider.leftArrowDown.bind(this.spider),    // Left Arrow
                         '65':this.spider.leftArrowDown.bind(this.spider),    // A
                         '39':this.spider.rightArrowDown.bind(this.spider),   // Right Arrow
                         '68':this.spider.rightArrowDown.bind(this.spider)    // D
                        };

        e = e || window.event;

        if (dispatch[e.keyCode])
        {
            dispatch[e.keyCode]();
        }
    };

    this.checkKeyUp = function(e)
    {

        var dispatch =  {'38':this.spider.upArrowUp.bind(this.spider),        // Up Arrow
                         '87':this.spider.upArrowUp.bind(this.spider),        // W
                         '40':this.spider.downArrowUp.bind(this.spider),      // Down Arrow
                         '83':this.spider.downArrowUp.bind(this.spider),      // S
                         '37':this.spider.leftArrowUp.bind(this.spider),      // Left Arrow
                         '65':this.spider.leftArrowUp.bind(this.spider),      // A
                         '39':this.spider.rightArrowUp.bind(this.spider),     // Right Arrow
                         '68':this.spider.rightArrowUp.bind(this.spider)      // D
                        };

        e = e || window.event;

        if (dispatch[e.keyCode])
        {
            dispatch[e.keyCode]();
        }
    };

    this.checkMouseDown = function(e)
    {
        var clickLocation = new Vector2D(e.offsetX, e.offsetY);
        var idx;
        var goalLocations = [];
        var wallLocations = [];

        e = e || window.event;

        clickLocation = clickLocation.round();

        if (e.button === 0)
        {
            this.flies.push(new Fly(this.bufferContext, clickLocation, this.flyIcon));

            for (idx = 0; idx < this.flies.length; idx++)
            {
                goalLocations.push(this.flies[idx].location);
            }

            this.grid.dijkstraToClosestGoal(this.spider.location.round(), goalLocations);
        }
        else if (e.button === 2)
        {
            this.maze.processClick(clickLocation);

            this.maze.render();

            this.grid.resetGridConnections();

            for (idx = 0; idx < this.maze.walls.length; idx++)
            {
                wallLocations.push(this.maze.walls[idx].location);
            }
            this.grid.updateGridConnections(wallLocations);
        }
    };

    this.checkDiagCost = function(evt)
    {
        var idx;
        var wallLocations = [];
        var textStr = this.diagCostText.value;
        var patt = /^([0-9]+\.[0-9]+|[0-9]+)$/;

        if (patt.test(textStr))
        {
            this.grid.diagonalCost = parseFloat(textStr);
            this.grid.initializeGrid();

            for (idx = 0; idx < this.maze.walls.length; idx++)
            {
                wallLocations.push(this.maze.walls[idx].location);
            }
            this.grid.updateGridConnections(wallLocations);
        }
    };

    this.checkCritPointOpt = function(evt)
    {
        this.grid.criticalPointOpt = this.critPointOptCheck.checked;
    };
};

function loadImage(src, cb)
{
    var img1 = false;

    if (document.images)
    {
        img1 = new Image();
        img1.onload = cb;
        img1.src = src;
    }
    return img1;
};

/* Animate pathfinding
 * Allow diagonals
 * Add controls for optimizations
 * Add critical node optimization for non-45 degree vectors
 * TODO: Critical node optimization sometimes adds a critical node it passes by
 * TODO: Accounting for motion
 * TODO: Find shortest path to all flies
 * TODO: Move spider to flies
 * TODO: A* optimization
 */
