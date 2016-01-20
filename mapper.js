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
    this.width;
    this.height;

    this.spider;
    this.fly_icon;
    this.flies = [];
    this.walls = [];
    this.graph = [];
    this.path = [];


    this.initialize = function()
    {
        this.display_canvas = document.getElementById("mapperCanvas");

        this.buffer_canvas = document.createElement('canvas');
        this.buffer_canvas.width = display_canvas.width;
        this.buffer_canvas.height = display_canvas.height;

        this.wall_canvas = document.createElement('canvas');
        this.wall_canvas.width = display_canvas.width;
        this.wall_canvas.height = display_canvas.height;

        display_context = display_canvas.getContext("2d");
        buffer_context = buffer_canvas.getContext("2d");
        wall_context = wall_canvas.getContext("2d");

        spider = new Spider(buffer_context, buffer_canvas.width, buffer_canvas.height);
        fly_icon = loadImage('fly.png');

        $(document).keydown(checkKeyDown);
        $(document).keyup(checkKeyUp);
        display_canvas.onmousedown = checkMouseDown;

        // Disable the right click context menu
        display_canvas.oncontextmenu = function(){return false;};

        initializeGraph();

        main();
    }

}


function main()
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
    requestAnimationFrame(main);
}



function updateWallContext()
{
    wall_context.clearRect(0,0,buffer_canvas.width, buffer_canvas.height);

    for (var i = 0; i < walls.length; i++)
    {
        walls[i].render();
    }
}

function checkKeyDown(e)
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
}

function checkKeyUp(e)
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
}

function checkMouseDown(e)
{
    var c_off = $(this).offset();
    var click_x;
    var click_y;

    e = e || window.event;

    click_x = Math.round(e.pageX - c_off.left);
    click_y = Math.round(e.pageY - c_off.top);

    if (e.button === 0)
    {
        flies.push(new Fly(buffer_context, click_x, click_y));

        dijkstra_to_closest_fly();
    }
    else if (e.button === 2)
    {
        var no_wall_clicked_on = true;
        for (var i = 0; i < walls.length; i++)
        {
            var diff_x = Math.abs(click_x - (walls[i].x + 16));
            var diff_y = Math.abs(click_y - (walls[i].y + 16));

            if (diff_x < 16 && diff_y < 16)
            {
                walls.splice(i, 1);
                // The splice moves future arrays forward
                // adjust i to match the next object
                i--;
                no_wall_clicked_on = false;
            }
        }

        if (no_wall_clicked_on)
        {
            walls.push(new Wall(wall_context, click_x, click_y));
        }

        updateWallContext();

        resetGraphConnections();
        updateGraphConnections();
    }
}

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

$(document).ready(initialize);
