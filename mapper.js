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



var player;
var mc;
var mcc;
var wall_canvas;
var wall_context;
var bmc;
var bmcc;
var fly_icon;
var flies = [];
var walls = [];
var graph = [];

function main()
{
    // Prep offscreen buffer
    bmcc.clearRect(0,0,bmc.width, bmc.height);

    // Game logic
    player.move();
    checkWallCollision(player, walls);
    checkFlyCollision(player, flies);

    // Draw code
    bmcc.drawImage(wall_canvas,0,0);

    for (var i = 0; i < flies.length; i++)
    {
        flies[i].render();
    }

    player.render();

    // Screen flip
    mcc.clearRect(0,0,mc.width, mc.height);
    mcc.drawImage(bmc, 0, 0);
    requestAnimationFrame(main);
}

function checkWallCollision(p, w)
{
    for (var i = 0; i < w.length; i++)
    {
        var diff_x = Math.abs(p.x - w[i].x);
        var diff_y = Math.abs(p.y - w[i].y);

        if (diff_x < 32 && diff_y < 32)
        {
            if (diff_x > diff_y)
            {
                p.vel_x = 0;

                if (p.x > w[i].x)
                {
                    p.x = w[i].x + w[i].side;
                }
                else
                {
                    p.x = w[i].x - p.icon.width;
                }
            }
            else
            {
                p.vel_y = 0;

                if (p.y > w[i].y)
                {
                    p.y = w[i].y + w[i].side;
                }
                else
                {
                    p.y = w[i].y - p.icon.height;
                }
            }
        }
    }
}

function checkFlyCollision(p, f)
{
    for (var i = 0; i < f.length; i++)
    {
        var diff_x = Math.abs(p.x - f[i].x);
        var diff_y = Math.abs(p.y - f[i].y);

        if (diff_x < 32 && diff_y < 32)
        {
            f.splice(i,1);
        }
    }
}

var Node = function(x_pa, y_pa)
{
    this.x = x_pa;
    this.y = y_pa;
    this.neighbors = [];
    this.cost = Number.MAX_VALUE;
    this.came_from;
}

var Spider = function(ctx_pa, width_pa, height_pa)
{
    this.vel_x = 0;
    this.vel_y = 0;
    this.max_vel_sq = 9;    // Velocity squared, in px per frame
    this.cmd_x = 0;
    this.cmd_y = 0;
    this.acc = 0.25;        // px per frame^2, must be > than friction!
    this.friction = 0.2;
    this.icon = loadImage("spider.png");
    this.max_x = width_pa - this.icon.width;
    this.max_y = height_pa - this.icon.height;
    this.ctx = ctx_pa;
    this.x = (width_pa >> 1) - (this.icon.width >> 1);
    this.y = (height_pa >> 1) - (this.icon.height >> 1);
    this.path = [];

    this.render = function()
    {
        this.ctx.drawImage(this.icon, this.x, this.y);
    };

    this.move = function()
    {
        this.vel_x += this.acc * this.cmd_x;
        this.vel_y += this.acc * this.cmd_y;
        if (this.vel_x > this.friction)
        {
            this.vel_x -= this.friction;
        }
        else if (this.vel_x < -this.friction)
        {
            this.vel_x += this.friction;
        }
        else
        {
            this.vel_x = 0;
        }

        if (this.vel_y > this.friction)
        {
            this.vel_y -= this.friction;
        }
        else if (this.vel_y < -this.friction)
        {
            this.vel_y += this.friction;
        }
        else
        {
            this.vel_y = 0;
        }

        var speed = Math.pow(this.vel_x, 2) + Math.pow(this.vel_y, 2);
        if (speed > this.max_vel_sq)
        {
            var scale = Math.sqrt(this.max_vel_sq/speed);
            this.vel_x *= scale;
            this.vel_y *= scale;
        }

        this.x = Math.min(this.max_x, Math.max(0, this.x + this.vel_x));
        this.y = Math.min(this.max_y, Math.max(0, this.y + this.vel_y));
    }

    this.updateTarget = function(f)
    {

    }

    this.upArrowDown = function()
    {
        this.cmd_y = -1;
    };

    this.downArrowDown = function()
    {
        this.cmd_y = 1;
    };

    this.leftArrowDown = function()
    {
        this.cmd_x = -1;
    };

    this.rightArrowDown = function()
    {
        this.cmd_x = 1;
    };

    this.upArrowUp = function()
    {
        this.cmd_y = 0;
    };

    this.downArrowUp = function()
    {
        this.cmd_y = 0;
    };

    this.leftArrowUp = function()
    {
        this.cmd_x = 0;
    };

    this.rightArrowUp = function()
    {
        this.cmd_x = 0;
    };
}

var Fly = function(ctx_pa, x_pa, y_pa)
{
    this.ctx = ctx_pa;
    this.x = x_pa - (fly_icon.width >> 1);
    this.y = y_pa - (fly_icon.height >> 1);
    this.icon = fly_icon;

    this.render = function()
    {
        this.ctx.drawImage(this.icon, this.x, this.y);
    };
}

var Wall = function(ctx_pa, x_pa, y_pa)
{
    this.side = 32;

    this.ctx = ctx_pa;
    this.x = x_pa - (this.side >> 1);
    this.y = y_pa - (this.side >> 1);

    this.render = function()
    {
        this.ctx.fillRect(this.x, this.y, this.side, this.side);
    };

}

function updateWallContext()
{
    wall_context.clearRect(0,0,bmc.width, bmc.height);

    for (var i = 0; i < walls.length; i++)
    {
        walls[i].render();
    }
}

function updateGraph()
{
    // create a fresh graph using the existing nodes
    for (var x = 0; x < mc.width; x++)
    {
        for (var y = 0; y < mc.height; y++)
        {
            var node = graph[x][y];
            node.neighbors = [];
            if (x > 0)
            {
                node.neighbors.push(graph[x-1][y]);
            }
            if (x < mc.width - 1)
            {
                node.neighbors.push(graph[x+1][y]);
            }
            if (y > 0)
            {
                node.neighbors.push(graph[x][y+1]);
            }
            if (y < mc.height - 1)
            {
                node.neighbors.push(graph[x][y-1]);
            }
        }
    }
}

function checkKeyDown(e)
{
    var dispatch =  {'38':player.upArrowDown.bind(player),      // Up Arrow
                     '87':player.upArrowDown.bind(player),      // W
                     '40':player.downArrowDown.bind(player),    // Down Arrow
                     '83':player.downArrowDown.bind(player),    // S
                     '37':player.leftArrowDown.bind(player),    // Left Arrow
                     '65':player.leftArrowDown.bind(player),    // A
                     '39':player.rightArrowDown.bind(player),   // Right Arrow
                     '68':player.rightArrowDown.bind(player)    // D
                    };

    e = e || window.event;

    if (dispatch[e.keyCode])
    {
        dispatch[e.keyCode]();
    }
}

function checkKeyUp(e)
{

    var dispatch =  {'38':player.upArrowUp.bind(player),        // Up Arrow
                     '87':player.upArrowUp.bind(player),        // W
                     '40':player.downArrowUp.bind(player),      // Down Arrow
                     '83':player.downArrowUp.bind(player),      // S
                     '37':player.leftArrowUp.bind(player),      // Left Arrow
                     '65':player.leftArrowUp.bind(player),      // A
                     '39':player.rightArrowUp.bind(player),     // Right Arrow
                     '68':player.rightArrowUp.bind(player)      // D
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

    click_x = e.pageX - c_off.left;
    click_y = e.pageY - c_off.top;

    if (e.button === 0)
    {
        flies.push(new Fly(bmcc, click_x, click_y));
        player.updateTarget(flies);
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

function initialize()
{
    mc = document.getElementById("mapperCanvas");

    bmc = document.createElement('canvas');
    bmc.width = mc.width;
    bmc.height = mc.height;

    wall_canvas = document.createElement('canvas');
    wall_canvas.width = mc.width;
    wall_canvas.height = mc.height;

    mcc = mc.getContext("2d");
    bmcc = bmc.getContext("2d");
    wall_context = wall_canvas.getContext("2d");

    player = new Spider(bmcc, bmc.width, bmc.height);
    fly_icon = loadImage('fly.png');

    $(document).keydown(checkKeyDown);
    $(document).keyup(checkKeyUp);
    mc.onmousedown = checkMouseDown;

    // Disable the right click context menu
    mc.oncontextmenu = function(){return false;};

    for (var x = 0; x < mc.width; x++)
    {
        graph.push([]);

        for (var y = 0; y < mc.height; y++)
        {
            graph[x].push(new Node(x,y));
        }
    }

    main();
}

$(document).ready(initialize);
