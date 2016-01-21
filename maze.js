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

var Wall = function(ctx_pa, x_pa, y_pa)
{
    this.side = 32;
    this.half_side = (this.side >> 1);

    this.ctx = ctx_pa;
    this.location = new Vector2D(x_pa, y_pa);

    this.render = function()
    {
        this.ctx.fillRect(this.location.x - this.half_side,
                          this.location.y - this.half_side,
                          this.side,
                          this.side);
    };

    this.checkClick = function(click_location)
    {
        var result = false;
        var diff_x = Math.abs(click_location.x - this.location.x);
        var diff_y = Math.abs(click_location.y - this.location.y);

        if (diff_x < this.half_side && diff_y < this.half_side)
        {
            result = true;
        }

        return result;
    };
};

var Maze = function(ctx, width, height)
{
    this.walls = [];
    this.ctx = ctx;

    this.render = function()
    {
        var idx;

        this.ctx.clearRect(0, 0, this.width, this.height);

        for (idx = 0; idx < this.walls.length; idx++)
        {
            this.walls[idx].render();
        }
    };

    this.processClick = function(click_location)
    {
        var idx;
        var no_wall_clicked_on = true;

        for (idx = 0; idx < this.walls.length; idx++)
        {
            if (this.walls[idx].checkClick(click_location))
            {
                this.walls.splice(idx, 1);
                // The splice moves future arrays forward
                // adjust i to match the next object
                idx--;
                no_wall_clicked_on = false;
            }
        }

        if (no_wall_clicked_on)
        {
            this.walls.push(new Wall(this.ctx, click_location.x, click_location.y));
        }
    };
};






