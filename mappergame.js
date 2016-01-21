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

var MapperGame = function(display_canvas)
{
    this.display_canvas = display_canvas;
    this.display_context;
    this.buffer_canvas;
    this.buffer_context;
    this.width = display_canvas.width;
    this.height = display_canvas.height;

    this.spider;
    this.fly_icon;
    this.flies = [];
    this.maze;
    this.grid;
    this.path = [];

    this.initialize = function()
    {
        this.buffer_canvas = document.createElement('canvas');
        this.buffer_canvas.width = this.width;
        this.buffer_canvas.height = this.height;

        this.display_context = this.display_canvas.getContext("2d");
        this.buffer_context = this.buffer_canvas.getContext("2d");

        this.spider = new Spider(this.buffer_context,
                                 loadImage('spider.png'),
                                 this.width,
                                 this.height);

        this.fly_icon = loadImage('fly.png');
        this.maze = new Maze(this.buffer_context, this.width, this.height);
        this.grid = new Grid(this.width, this.height);

        document.onkeydown = this.checkKeyDown.bind(this);
        document.onkeyup = this.checkKeyUp.bind(this);
        display_canvas.onmousedown = this.checkMouseDown.bind(this);

        // Disable the right click context menu
        this.display_canvas.oncontextmenu = function(){return false;};

        this.grid.initializeGrid();

        this.render_loop();
    };

    this.render_loop = function()
    {
        var idx;

        // Prep offscreen buffer
        this.buffer_context.clearRect(0,0,this.width, this.height);

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

        for (idx = 0; idx < this.flies.length; idx++)
        {
            this.flies[idx].render();
        }

        this.spider.render();

        this.drawPath();

        // Screen flip
        this.display_context.clearRect(0,0,this.width, this.height);
        this.display_context.drawImage(this.buffer_canvas, 0, 0);
        requestAnimationFrame(this.render_loop.bind(this));
    };


    this.checkWallCollision = function()
    {
        var walls = this.maze.walls;
        var diff_x, diff_y;
        var idx;

        for (idx = 0; idx < walls.length; idx++)
        {
            diff_x = Math.abs(this.spider.location.x - walls[idx].location.x);
            diff_y = Math.abs(this.spider.location.y - walls[idx].location.y);

            if (diff_x < (walls[idx].half_side + this.spider.half_width) &&
                diff_y < (walls[idx].half_side + this.spider.half_height))
            {
                if (diff_x > diff_y)
                {
                    this.spider.vel_x = 0;

                    if (this.spider.location.x > walls[idx].location.x)
                    {
                        this.spider.location.x = walls[idx].location.x + walls[idx].half_side + this.spider.half_width;
                    }
                    else
                    {
                        this.spider.location.x = walls[idx].location.x - walls[idx].half_side - this.spider.half_width;
                    }
                }
                else
                {
                    this.spider.vel_y = 0;

                    if (this.spider.location.y > walls[idx].location.y)
                    {
                        this.spider.location.y = walls[idx].location.y + walls[idx].half_side + this.spider.half_height;
                    }
                    else
                    {
                        this.spider.location.y = walls[idx].location.y - walls[idx].half_side - this.spider.half_height;
                    }
                }
            }
        }
    };


    this.drawPath = function()
    {
        var idx;

        if (this.path.length !== 0)
        {
            this.buffer_context.beginPath();
            this.buffer_context.lineWidth="5";
            this.buffer_context.strokeStyle="green";

            this.buffer_context.moveTo(this.path[0].x, this.path[0].y);

            for (idx = 1; idx < this.path.length; idx++)
            {
                this.buffer_context.lineTo(this.path[idx].x, this.path[idx].y);
            }

            this.buffer_context.stroke(); // Draw it
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
        var c_off = this.display_canvas;
        var click_x;
        var click_y;
        var idx;
        var goal_locations = [];
        var wall_locations = [];

        e = e || window.event;

        click_x = Math.round(e.offsetX);
        click_y = Math.round(e.offsetY);

        if (e.button === 0)
        {
            this.flies.push(new Fly(this.buffer_context, click_x, click_y, this.fly_icon));

            for (idx = 0; idx < this.flies.length; idx++)
            {
                goal_locations.push(this.flies[idx].location);
            }

            this.path = this.grid.dijkstra_to_closest_goal(this.spider.location.round(), goal_locations);
        }
        else if (e.button === 2)
        {
            this.maze.processClick(new Vector2D(click_x, click_y));

            this.maze.render();

            this.grid.resetGridConnections();

            for (idx = 0; idx < this.maze.walls.length; idx++)
            {
                wall_points.push(this.maze.walls[idx].location);
            }
            this.grid.updateGridConnections(wall_locations);
        }
    };
};

function loadImage(src)
{
    var img1 = false;
    if (document.images)
    {
        img1 = new Image();
        img1.src = src;
    }
    return img1;
}


