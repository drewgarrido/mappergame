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
    this.point = new Point_2d(x_pa, y_pa);

    this.render = function()
    {
        this.ctx.fillRect(this.point.x - this.half_side,
                          this.point.y - this.half_side,
                          this.side,
                          this.side);
    };

    this.checkClick = function(click_point)
    {
        var result = false;
        var diff_x = Math.abs(click_point.x - (this.walls[idx].x + this.half_side));
        var diff_y = Math.abs(click_point.y - (this.walls[idx].y + this.half_side));

        if (diff_x < this.half_side && diff_y < this.half_side)
        {
            result = true;
        }

        return result;
    }
};

var Maze = function(ctx, width, height)
{
    this.walls = [];
    this.ctx = ctx;

    this.render = function()
    {
        var idx;

        this.ctx.clearRect(0,0,this.width, this.height);

        for (idx = 0; idx < walls.length; idx++)
        {
            walls[idx].render();
        }
    };

    function checkWallCollision(p)
    {
        var diff_x, diff_y;
        var idx;

        for (idx = 0; idx < w.length; idx++)
        {
            diff_x = Math.abs(p.x - walls[idx].point.x);
            diff_y = Math.abs(p.y - walls[idx].point.y);

            if (diff_x < 32 && diff_y < 32)
            {
                if (diff_x > diff_y)
                {
                    p.vel_x = 0;

                    if (p.x > walls[idx].point.x)
                    {
                        p.x = walls[idx].point.x + walls[idx].side;
                    }
                    else
                    {
                        p.x = walls[idx].point.x - p.icon.width;
                    }
                }
                else
                {
                    p.vel_y = 0;

                    if (p.y > walls[idx].point.y)
                    {
                        p.y = walls[idx].point.y + walls[idx].side;
                    }
                    else
                    {
                        p.y = walls[idx].point.y - p.icon.height;
                    }
                }
            }
        }
        return p;
    }

    this.processClick = function(click_point)
    {
        var idx;
        var no_wall_clicked_on = true;

        for (idx = 0; idx < walls.length; idx++)
        {
            if (walls[idx].checkClick(click_point))
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
            this.walls.push(new Wall(wall_context, click_point.x, click_point.y));
        }
    }
}






