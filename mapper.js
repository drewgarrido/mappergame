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



var spider;
var display_canvas;
var display_context;
var wall_canvas;
var wall_context;
var buffer_canvas;
var buffer_context;
var fly_icon;
var flies = [];
var walls = [];
var graph = [];
var path = [];

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
    this.cost_so_far = Number.MAX_VALUE;
    this.cost_to = 1;
    this.connected = true;
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
    wall_context.clearRect(0,0,buffer_canvas.width, buffer_canvas.height);

    for (var i = 0; i < walls.length; i++)
    {
        walls[i].render();
    }
}

function initializeGraph()
{
    for (var x = 0; x < display_canvas.width; x++)
    {
        graph.push([]);

        for (var y = 0; y < display_canvas.height; y++)
        {
            graph[x].push(new Node(x,y));
        }
    }

    for (var x = 0; x < display_canvas.width; x++)
    {
        for (var y = 0; y < display_canvas.height; y++)
        {
            var node = graph[x][y];
            node.neighbors = [];
            if (x > 0)
            {
                node.neighbors.push(graph[x-1][y]);
            }
            if (x < display_canvas.width - 1)
            {
                node.neighbors.push(graph[x+1][y]);
            }
            if (y > 0)
            {
                node.neighbors.push(graph[x][y-1]);
            }
            if (y < display_canvas.height - 1)
            {
                node.neighbors.push(graph[x][y+1]);
            }
        }
    }

    resetGraphConnections();
}

function resetGraphConnections()
{
    for (var x = 0; x < display_canvas.width; x++)
    {
        for (var y = 0; y < display_canvas.height; y++)
        {
            graph[x][y].connected = true;
            graph[x][y].came_from = undefined;
            graph[x][y].cost_so_far = Number.MAX_VALUE;
        }
    }
}

function resetGraphPath()
{
    for (var x = 0; x < display_canvas.width; x++)
    {
        for (var y = 0; y < display_canvas.height; y++)
        {
            graph[x][y].came_from = undefined;
            graph[x][y].cost_so_far = Number.MAX_VALUE;
        }
    }
}

function updateGraphConnections()
{
    for (var i = 0; i < walls.length; i++)
    {
        var start_x = Math.max(0, walls[i].x - 32);
        var start_y = Math.min(graph.length, walls[i].y - 32);
        var end_x = Math.max(0, walls[i].x + 32);
        var end_y = Math.min(graph[0].length, walls[i].y + 32);

        for (var x = start_x; x < end_x; x++)
        {
            for (var y = start_y; y < end_y; y++)
            {
                graph[x][y].connected = false;
            }
        }
    }
}

function dijkstra_to_closest_fly()
{
    var start_node = graph[(spider.x+16)|0][(spider.y+16)|0];
    var frontier = [start_node];    // Priority queue
    var current_node, next_node, goal_node;
    var new_cost = 0;
    var reverse_path = [];

    if (flies.length === 0)
    {
        return;
    }

    resetGraphPath();

    path = [];

    start_node.came_from = start_node;
    start_node.cost_so_far = 0;

    while (frontier.length > 0 && goal_node === undefined)
    {
        current_node = frontier.shift();

        for (var i = 0; i < flies.length; i++)
        {
            if (current_node.x === flies[i].x &&
                current_node.y === flies[i].y)
            {
                goal_node = current_node;
                break;
            }
        }

        if (goal_node === undefined)
        {
            for (var k = 0; k < current_node.neighbors.length; k++)
            {
                next_node = current_node.neighbors[k];
                new_cost = current_node.cost_so_far + next_node.cost_to;

                if (next_node.connected &&
                    new_cost < next_node.cost_so_far)
                {
                    next_node.cost_so_far = new_cost;

                    for (var m = 0; m < frontier.length; m++)
                    {
                        if (frontier[m].cost_so_far > new_cost)
                        {
                            frontier.splice(m, 0, next_node);
                            break;
                        }
                    }
                    if (m === frontier.length)
                    {
                        frontier.push(next_node);
                    }

                    next_node.came_from = current_node;
                }
            }
        }
    }

    current_node = goal_node;

    while (current_node.cost_so_far !== 0)
    {
        reverse_path.push(current_node);
        current_node = current_node.came_from;
        if (current_node === undefined)
        {
            i = 0;
        }
    }
    // Reverse the list, so index 0 is the start
    while (reverse_path.length)
    {
        path.push(reverse_path.pop());
    }
}

function drawPath()
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

function initialize()
{
    display_canvas = document.getElementById("mapperCanvas");

    buffer_canvas = document.createElement('canvas');
    buffer_canvas.width = display_canvas.width;
    buffer_canvas.height = display_canvas.height;

    wall_canvas = document.createElement('canvas');
    wall_canvas.width = display_canvas.width;
    wall_canvas.height = display_canvas.height;

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

$(document).ready(initialize);
