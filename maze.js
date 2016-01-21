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

var Wall = function(ctxp, locationp)
{
    this.side = 32;
    this.halfSide = (this.side >> 1);

    this.ctx = ctxp;
    this.location = locationp;

    this.render = function()
    {
        this.ctx.fillRect(this.location.x - this.halfSide,
                          this.location.y - this.halfSide,
                          this.side,
                          this.side);
    };

    this.checkClick = function(clickLocation)
    {
        var result = false;
        var diffX = Math.abs(clickLocation.x - this.location.x);
        var diffY = Math.abs(clickLocation.y - this.location.y);

        if (diffX < this.halfSide && diffY < this.halfSide)
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

    this.processClick = function(clickLocation)
    {
        var idx;
        var noWallClickedOn = true;

        for (idx = 0; idx < this.walls.length; idx++)
        {
            if (this.walls[idx].checkClick(clickLocation))
            {
                this.walls.splice(idx, 1);
                // The splice moves future arrays forward
                // adjust i to match the next object
                idx--;
                noWallClickedOn = false;
            }
        }

        if (noWallClickedOn)
        {
            this.walls.push(new Wall(this.ctx, clickLocation));
        }
    };
};






