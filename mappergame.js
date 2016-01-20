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

        this.wall_canvas = document.createElement('canvas');
        this.wall_canvas.width = this.width;
        this.wall_canvas.height = this.height;

        this.display_context = this.display_canvas.getContext("2d");
        this.buffer_context = this.buffer_canvas.getContext("2d");
        this.wall_context = this.wall_canvas.getContext("2d");

        this.spider = new Spider(buffer_context,
                                 loadImage('spider.png'),
                                 this.width,
                                 this.height);

        this.fly_icon = loadImage('fly.png');
        this.maze = new Maze(buffer_context, this.width, this.height);
        this.grid = new Grid(this.width, this.height);

        $(document).keydown(this.checkKeyDown);
        $(document).keyup(this.checkKeyUp);
        display_canvas.onmousedown = this.checkMouseDown;

        // Disable the right click context menu
        this.display_canvas.oncontextmenu = function(){return false;};

        this.grid.initializeGrid();

        this.render_loop();
    };

    this.render_loop = function()
    {
        // Prep offscreen buffer
        buffer_context.clearRect(0,0,buffer_canvas.width, buffer_canvas.height);

        // Game logic
        spider.move();
        checkWallCollision(spider, walls);
        checkFlyCollision(spider, flies);

        // Draw code
        buffer_context.drawImage(wall_canvas,0,0);

        for (var i = 0; i < flies.length; i++)
        {
            flies[i].render();
        }

        spider.render();

        drawPath();

        // Screen flip
        display_context.clearRect(0,0,display_canvas.width, display_canvas.height);
        display_context.drawImage(buffer_canvas, 0, 0);
        requestAnimationFrame(this.render_loop);
    };


    this.drawPath = function(path)
    {
        if (path.length !== 0)
        {
            buffer_context.beginPath();
            buffer_context.lineWidth="5";
            buffer_context.strokeStyle="green"; // Green path

            buffer_context.moveTo(path[0].x, path[0].y);

            for (var i = 1; i < path.length; i++)
            {
                buffer_context.lineTo(path[i].x,path[i].y);
            }

            buffer_context.stroke(); // Draw it
        }
    };

    this.checkKeyDown = function(e)
    {
        var dispatch =  {'38':spider.upArrowDown.bind(spider),      // Up Arrow
                         '87':spider.upArrowDown.bind(spider),      // W
                         '40':spider.downArrowDown.bind(spider),    // Down Arrow
                         '83':spider.downArrowDown.bind(spider),    // S
                         '37':spider.leftArrowDown.bind(spider),    // Left Arrow
                         '65':spider.leftArrowDown.bind(spider),    // A
                         '39':spider.rightArrowDown.bind(spider),   // Right Arrow
                         '68':spider.rightArrowDown.bind(spider)    // D
                        };

        e = e || window.event;

        if (dispatch[e.keyCode])
        {
            dispatch[e.keyCode]();
        }
    };

    this.checkKeyUp = function(e)
    {

        var dispatch =  {'38':spider.upArrowUp.bind(spider),        // Up Arrow
                         '87':spider.upArrowUp.bind(spider),        // W
                         '40':spider.downArrowUp.bind(spider),      // Down Arrow
                         '83':spider.downArrowUp.bind(spider),      // S
                         '37':spider.leftArrowUp.bind(spider),      // Left Arrow
                         '65':spider.leftArrowUp.bind(spider),      // A
                         '39':spider.rightArrowUp.bind(spider),     // Right Arrow
                         '68':spider.rightArrowUp.bind(spider)      // D
                        };

        e = e || window.event;

        if (dispatch[e.keyCode])
        {
            dispatch[e.keyCode]();
        }
    };

    this.checkMouseDown = function(e)
    {
        var c_off = $(this).offset();
        var click_x;
        var click_y;
        var idx;
        var goal_points = []

        e = e || window.event;

        click_x = Math.round(e.pageX - c_off.left);
        click_y = Math.round(e.pageY - c_off.top);

        if (e.button === 0)
        {
            this.flies.push(new Fly(buffer_context, click_x, click_y));

            for (idx = 0; idx < flies.length; idx++)
            {
                goal_points.push(flies[i].point);
            }

            this.path = maze.dijkstra_to_closest_goal(spider.point, goal_points);
        }
        else if (e.button === 2)
        {
            maze.processClick(new Point_2d(click_x, click_y));

            maze.render();

            resetGraphConnections();
            updateGraphConnections();
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


