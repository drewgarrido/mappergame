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

var Fly = function(ctx_pa, x_pa, y_pa, icon)
{
    this.ctx = ctx_pa;
    this.location = new Vector2D(x_pa, y_pa);
    this.icon = icon;
    this.width = icon.width;
    this.height = icon.height;
    this.half_width = (icon.width >> 1);
    this.half_height = (icon.height >> 1);

    this.render = function()
    {
        this.ctx.drawImage(this.icon,
                           this.location.x - this.half_width,
                           this.location.y - this.half_height);
    };

    this.checkCollision = function(other_location)
    {
        var diff_x = Math.abs(other_location.x - this.location.x);
        var diff_y = Math.abs(other_location.y - this.location.y);
        var result = false;

        if (diff_x < 32 && diff_y < 32)
        {
            result = true;
        }
        return result;
    };
};
